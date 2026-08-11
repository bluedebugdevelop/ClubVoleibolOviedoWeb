// ==========================================================================
// API del panel de administración.
//
//   POST /api/panel/entrar          { acceso }  → deja la cookie firmada
//   GET  /api/panel/sesion                      → quién soy y estado del disco
//   POST /api/panel/salir                       → borra la cookie
//   PUT  /api/panel/noticias        { noticias }
//   PUT  /api/panel/patrocinadores  { patrocinadores }
//   POST /api/panel/imagen          (bytes de la imagen) → { ruta }
//
// Todo lo que no sea `entrar` exige cookie válida. Y lo que llega se pasa por
// una lista blanca de campos: lo que el panel manda acaba pintado en la web, así
// que no se guarda un objeto tal cual venga del navegador.
//
// Las respuestas cuando no hay permiso son 404, no 401: quien husmee no debe
// poder distinguir "esto existe pero no puedes" de "esto no existe".
// ==========================================================================

import {
  borrarImagen,
  esPersistente,
  escribir,
  guardarImagen,
  leer,
  TAMANO_MAXIMO,
  TIPOS_ACEPTADOS,
} from './_almacen.js'
import { borrarCookie, configurado, ponerCookie, quienEs, sesion } from './_acceso.js'
import { semilla } from './contenido.js'

const LIMITE_TEXTO = 400
const LIMITE_PARRAFO = 2000

function texto(v, max = LIMITE_TEXTO) {
  if (typeof v !== 'string') return ''
  return v.trim().slice(0, max)
}

/** Solo rutas de imagen que hayamos generado nosotros o que estén en /media. */
function rutaImagen(v) {
  const s = texto(v, 300)
  return s.startsWith('/subidas/') || s.startsWith('/media/') ? s : ''
}

const slugificar = (s) =>
  texto(s, 80)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** Encuadre de la foto de cabecera: es un `object-position` de CSS, así que
    solo se admite ese formato y no cualquier texto que acabe en una hoja de estilos. */
const foco = (v) => (/^[a-z0-9 %.]{0,24}$/i.test(texto(v, 24)) ? texto(v, 24) : '')

function limpiaNoticia(n, i) {
  const titulo = texto(n.titulo, 160)
  /* `cuerpo` son los párrafos de la página propia de la noticia (Noticia.jsx).
     Sin cuerpo la noticia existe igual, pero solo como tarjeta del listado:
     `enlaceNoticia` la deja sin enlazar a ninguna ficha. */
  const cuerpo = Array.isArray(n.cuerpo)
    ? n.cuerpo.map((t) => texto(t, LIMITE_PARRAFO)).filter(Boolean).slice(0, 20)
    : []

  return {
    id: texto(n.id, 40) || `n-${Date.now().toString(36)}-${i}`,
    slug: slugificar(n.slug || titulo) || `noticia-${i}`,
    destacada: n.destacada === true,
    categoria: texto(n.categoria, 60),
    fecha: texto(n.fecha, 40),
    titulo,
    resumen: texto(n.resumen, 600),
    img: rutaImagen(n.img),
    foco: foco(n.foco),
    cuerpo,
    // el único botón que sabe pintar la ficha; cualquier otro valor se descarta
    cta: n.cta === 'preinscripcion' ? 'preinscripcion' : '',
  }
}

function limpiaPatrocinador(p, i) {
  const nombre = texto(p.nombre, 80)
  return {
    slug: slugificar(p.slug || nombre) || `patrocinador-${i}`,
    nombre,
    logo: rutaImagen(p.logo),
    foto: rutaImagen(p.foto),
    tagline: texto(p.tagline, 140),
    web: /^https?:\/\//i.test(texto(p.web, 300)) ? texto(p.web, 300) : '',
    webTexto: texto(p.webTexto, 120),
    color: /^#[0-9a-f]{3,8}$/i.test(texto(p.color, 9)) ? texto(p.color, 9) : '',
    descripcion: texto(p.descripcion, 600),
    parrafos: Array.isArray(p.parrafos)
      ? p.parrafos.map((t) => texto(t, LIMITE_PARRAFO)).filter(Boolean).slice(0, 8)
      : [],
  }
}

/**
 * Borra las imágenes subidas que ya no usa nadie.
 *
 * Se hace DESPUÉS de guardar y mirando las dos listas a la vez: si solo se
 * mirara la que se está editando, cambiar una noticia borraría la foto de un
 * patrocinador que apuntase al mismo fichero.
 */
function limpiarHuerfanas(antes, despues) {
  const usadas = new Set()
  for (const lista of [despues.noticias, despues.patrocinadores]) {
    for (const el of lista) {
      for (const campo of ['img', 'logo', 'foto']) {
        if (el[campo]) usadas.add(el[campo])
      }
    }
  }
  const previas = new Set()
  for (const lista of [antes.noticias, antes.patrocinadores]) {
    for (const el of lista) {
      for (const campo of ['img', 'logo', 'foto']) {
        if (el[campo]?.startsWith('/subidas/')) previas.add(el[campo])
      }
    }
  }
  for (const ruta of previas) {
    if (!usadas.has(ruta)) borrarImagen(ruta)
  }
}

/** Lo guardado, y si está vacío la semilla: así se edita sobre lo que se ve. */
function estadoActual() {
  const guardado = leer()
  const base = semilla()
  return {
    noticias: guardado.noticias.length ? guardado.noticias : base.noticias,
    patrocinadores: guardado.patrocinadores.length ? guardado.patrocinadores : base.patrocinadores,
  }
}

export default async function handler(req, res) {
  // La ruta llega como /api/panel/loquesea
  const accion = (req.params?.accion || req.url.split('/').filter(Boolean).pop() || '').split('?')[0]
  const seguro = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https'

  if (!configurado()) {
    // Sin PANEL_ACCESOS y PANEL_SECRETO el panel no existe.
    return res.status(404).json({ ok: false, error: 'No encontrado' })
  }

  // ---- entrar: lo único que no pide cookie ----
  if (accion === 'entrar') {
    if (req.method !== 'POST') return res.status(404).json({ ok: false })
    const cuerpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
    const nombre = quienEs(texto(cuerpo.acceso, 200))
    if (!nombre) {
      console.warn('Panel: intento de acceso con token no válido')
      // se tarda un poco a propósito, para que probar tokens a lo bruto salga caro
      await new Promise((r) => setTimeout(r, 700))
      return res.status(404).json({ ok: false, error: 'No encontrado' })
    }
    ponerCookie(res, nombre, seguro)
    console.log(`Panel: entra ${nombre}`)
    return res.status(200).json({ ok: true, nombre })
  }

  const quien = sesion(req)
  if (!quien) return res.status(404).json({ ok: false, error: 'No encontrado' })

  if (accion === 'salir') {
    borrarCookie(res)
    return res.status(200).json({ ok: true })
  }

  if (accion === 'sesion') {
    return res.status(200).json({
      ok: true,
      nombre: quien,
      persistente: esPersistente(),
      limiteImagen: TAMANO_MAXIMO,
      tiposImagen: TIPOS_ACEPTADOS,
      ...estadoActual(),
    })
  }

  // ---- subir una imagen ----
  if (accion === 'imagen') {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Solo POST' })
    const tipo = (req.headers['content-type'] || '').split(';')[0].trim()
    if (!TIPOS_ACEPTADOS.includes(tipo)) {
      return res.status(400).json({ ok: false, error: 'Formato no admitido. Usa JPG, PNG, WebP o AVIF.' })
    }
    if (!Buffer.isBuffer(req.body) || !req.body.length) {
      return res.status(400).json({ ok: false, error: 'No llegó ninguna imagen.' })
    }
    try {
      const ruta = guardarImagen(req.body, tipo, texto(req.headers['x-nombre'], 120))
      console.log(`Panel: ${quien} sube ${ruta}`)
      return res.status(200).json({ ok: true, ruta })
    } catch (e) {
      return res.status(400).json({ ok: false, error: e.message })
    }
  }

  // ---- guardar listas ----
  if (accion === 'noticias' || accion === 'patrocinadores') {
    if (req.method !== 'PUT') return res.status(405).json({ ok: false, error: 'Solo PUT' })
    const cuerpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
    const entrada = cuerpo[accion]
    if (!Array.isArray(entrada)) {
      return res.status(400).json({ ok: false, error: `Falta la lista de ${accion}.` })
    }
    if (entrada.length > 200) {
      return res.status(400).json({ ok: false, error: 'Demasiados elementos.' })
    }

    const antes = estadoActual()
    const limpia = accion === 'noticias' ? limpiaNoticia : limpiaPatrocinador
    const despues = { ...antes, [accion]: entrada.map(limpia) }

    try {
      escribir(despues)
      limpiarHuerfanas(antes, despues)
    } catch (e) {
      console.error('Panel: no se pudo guardar', e.message)
      return res.status(500).json({ ok: false, error: 'No se pudo guardar en el disco.' })
    }

    console.log(`Panel: ${quien} guarda ${accion} (${despues[accion].length})`)
    return res.status(200).json({ ok: true, [accion]: despues[accion] })
  }

  return res.status(404).json({ ok: false, error: 'No encontrado' })
}

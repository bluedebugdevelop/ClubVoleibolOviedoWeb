// ==========================================================================
// API del panel de administración.
//
//   (la entrada es común y vive en /api/acceso)
//   GET  /api/panel/sesion                      → quién soy y estado del disco
//   POST /api/panel/salir                       → borra la cookie
//   PUT  /api/panel/noticias        { noticias }
//   PUT  /api/panel/patrocinadores  { patrocinadores }
//   PUT  /api/panel/equipos         { equipos }
//   PUT  /api/panel/fotos           { fotos }
//   POST /api/panel/imagen          (bytes de la imagen) → { ruta }
//
//   GET  /api/panel/usuarios                    → cuentas del club
//   POST /api/panel/usuarios        { nombre }   → alta, devuelve la clave UNA vez
//   POST /api/panel/usuario-baja    { id }       → dar de baja una cuenta
//   GET  /api/panel/peticiones                   → bandeja de peticiones
//   POST /api/panel/peticion-estado { id, estado }
//
// Todo lo que no sea `entrar` exige cookie válida DE ADMINISTRACIÓN. Desde que
// existe el área del club hay cookies válidas que no lo son, y el reparto de
// permisos se juega entero en la línea de `sesionAdmin` de abajo.
//
// Lo que llega se pasa por una lista blanca de campos: lo que el panel manda
// acaba pintado en la web, así que no se guarda un objeto tal cual venga del
// navegador.
//
// Las respuestas cuando no hay permiso son 404, no 401: quien husmee no debe
// poder distinguir "esto existe pero no puedes" de "esto no existe". La única
// excepción es el propio `entrar`, que sí distingue "credenciales mal" de
// "estás bloqueado": quien está escribiendo su contraseña necesita saberlo.
// ==========================================================================

import {
  borrarImagen,
  esPersistente,
  escribir,
  escribirPrivado,
  ESTADOS_PETICION as ESTADOS,
  guardarImagen,
  leer,
  leerPrivado,
  LISTAS,
  MAX_CUENTAS,
  TAMANO_MAXIMO,
  TIPOS_ACEPTADOS,
} from './_almacen.js'
import {
  borrarCookie,
  claveAleatoria,
  configurado,
  hashear,
  sesionAdmin,
} from './_acceso.js'
import { semilla } from './contenido.js'
import { FOTOS_SITIO } from '../src/data/fotosSitio.js'

// Las claves de foto que existen. Lo que llegue con otra clave se tira: esta
// lista la fija el código, no el panel, porque cada clave tiene que estar usada
// en alguna página para que sirva de algo.
const CLAVES_FOTO = new Set(FOTOS_SITIO.map((f) => f.clave))

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

/** Una cuenta del club tal como puede salir del servidor: sin su huella. */
const sinHuella = ({ huella: _huella, ...resto }) => resto

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

/* Una foto de sección es solo la clave del sitio donde va y la ruta de la
   imagen. Sin ruta se guarda igual, con la cadena vacía: eso significa "vuelve
   a la que trae el código por defecto", que es como se deshace un cambio. */
const limpiaFoto = (f) => ({ clave: texto(f?.clave, 40), ruta: rutaImagen(f?.ruta) })

/* Un equipo lleva dentro TODO lo suyo: lo de la tarjeta (nombre, foto,
   categoría) y lo de su ficha (cabecera, datos, plantilla, cuerpo técnico).
   Las sublistas se recortan a un tamaño sensato para que un envío raro no deje
   una ficha con diez mil jugadores. */
const limpiaPareja = (d) => ({ label: texto(d?.label, 60), valor: texto(d?.valor, 120) })

const limpiaJugador = (j) => ({
  // el dorsal es texto a propósito: hay equipos de base sin dorsal asignado
  numero: texto(j?.numero ?? '', 4),
  nombre: texto(j?.nombre, 80),
  posicion: texto(j?.posicion, 40),
})

const limpiaTecnico = (t) => ({ nombre: texto(t?.nombre, 80), rol: texto(t?.rol, 60) })

const lista = (v, limpia, tope) =>
  Array.isArray(v) ? v.map(limpia).filter((x) => Object.values(x).some(Boolean)).slice(0, tope) : []

function limpiaEquipo(e, i) {
  const nombre = texto(e.nombre, 80)
  return {
    slug: slugificar(e.slug || nombre) || `equipo-${i}`,
    // solo dos sitios donde puede colgar una ficha; cualquier otra cosa, cantera
    zona: e.zona === 'nacional' ? 'nacional' : 'cantera',
    enPortada: e.enPortada === true,
    nombre,
    categoria: texto(e.categoria, 60),
    liga: texto(e.liga, 80),
    img: rutaImagen(e.img),
    // sin texto alternativo escrito se pone uno: la foto tiene que ser legible
    // para un lector de pantalla aunque al club se le olvide rellenarlo
    alt: texto(e.alt, 160) || (nombre ? `Equipo ${nombre} del CV Oviedo` : ''),
    resumen: texto(e.resumen, 120),
    crumb: texto(e.crumb, 80) || nombre,
    kicker: texto(e.kicker, 140),
    sub: texto(e.sub, 400),
    headerImg: rutaImagen(e.headerImg),
    headerFoco: foco(e.headerFoco),
    datos: lista(e.datos, limpiaPareja, 8),
    squad: lista(e.squad, limpiaJugador, 40),
    staff: lista(e.staff, limpiaTecnico, 12),
    join: {
      title: texto(e.join?.title, 120),
      text: texto(e.join?.text, 400),
    },
  }
}

// Todos los campos de cualquier lista que guardan la ruta de una imagen. Se
// miran todos en todas las listas: sobra con que el campo no exista.
const CAMPOS_IMAGEN = ['img', 'logo', 'foto', 'headerImg', 'ruta']

function rutasUsadas(estado, soloSubidas) {
  const salida = new Set()
  for (const clave of LISTAS) {
    for (const el of estado[clave] || []) {
      for (const campo of CAMPOS_IMAGEN) {
        const r = el[campo]
        if (r && (!soloSubidas || r.startsWith('/subidas/'))) salida.add(r)
      }
    }
  }
  return salida
}

/**
 * Borra las imágenes subidas que ya no usa nadie.
 *
 * Se hace DESPUÉS de guardar y mirando TODAS las listas a la vez: si solo se
 * mirara la que se está editando, cambiar una noticia borraría la foto de un
 * patrocinador o de un equipo que apuntase al mismo fichero.
 */
function limpiarHuerfanas(antes, despues) {
  const usadas = rutasUsadas(despues, false)
  for (const ruta of rutasUsadas(antes, true)) {
    if (!usadas.has(ruta)) borrarImagen(ruta)
  }
}

/** Lo guardado, y si está vacío la semilla: así se edita sobre lo que se ve. */
function estadoActual() {
  const guardado = leer()
  const base = semilla()
  return Object.fromEntries(
    LISTAS.map((k) => [k, guardado[k].length ? guardado[k] : base[k]]),
  )
}

const LIMPIADORES = {
  noticias: limpiaNoticia,
  patrocinadores: limpiaPatrocinador,
  equipos: limpiaEquipo,
  fotos: limpiaFoto,
}

export default async function handler(req, res) {
  // La ruta llega como /api/panel/loquesea
  const accion = (req.params?.accion || req.url.split('/').filter(Boolean).pop() || '').split('?')[0]

  if (!configurado()) {
    // Sin PANEL_CLAVE_HASH y PANEL_SECRETO el panel no existe.
    return res.status(404).json({ ok: false, error: 'No encontrado' })
  }

  /* Aquí estaba el formulario de entrada del panel. Se fue el 16-08-2026:
     ahora la puerta es única y vive en api/acceso.js, que mira la cuenta y
     decide si manda al panel o al área del club. Dos sitios donde comprobar
     una contraseña son dos sitios que revisar cada vez. */

  /* 401, no 404: ahora el panel se anuncia con un candado en la barra, así que
     esconderlo ya no aporta nada y confundir "no existe" con "no has entrado"
     solo complica el mensaje que ve quien está usándolo. El 404 se reserva para
     cuando el panel NO está montado (arriba), que entonces sí es verdad.

     `sesionAdmin` y no `sesion`: desde que existe el área del club hay cookies
     válidas que NO son de administración. Comprobar solo que hay sesión daría a
     cualquier entrenador el panel entero. Este es EL control del reparto de
     permisos; si algún día se cambia por `sesion`, se abre de par en par. */
  const quien = sesionAdmin(req)
  if (!quien) return res.status(401).json({ ok: false, error: 'Hay que iniciar sesión.' })

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
  if (LISTAS.includes(accion)) {
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
    let limpia = entrada.map(LIMPIADORES[accion])
    if (accion === 'fotos') {
      // solo claves que alguna página use de verdad, y una sola vez cada una
      const vistas = new Set()
      limpia = limpia.filter(
        (f) => CLAVES_FOTO.has(f.clave) && !vistas.has(f.clave) && vistas.add(f.clave),
      )
    }
    const despues = { ...antes, [accion]: limpia }

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

  // ---- cuentas del club ----
  if (accion === 'usuarios') {
    const privado = leerPrivado()

    if (req.method === 'GET') {
      // sin la huella de la contraseña: no tiene por qué salir del servidor
      return res.status(200).json({ ok: true, usuarios: privado.usuarios.map(sinHuella) })
    }
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Solo GET o POST' })

    const cuerpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
    const nombre = texto(cuerpo.nombre, 60)
    if (nombre.length < 2) {
      return res.status(400).json({ ok: false, error: 'Falta el nombre de la persona.' })
    }
    if (privado.usuarios.filter((u) => u.activo).length >= MAX_CUENTAS) {
      return res.status(400).json({ ok: false, error: `No caben más de ${MAX_CUENTAS} cuentas activas.` })
    }

    /* El identificador con el que entra sale del nombre: "Marta Gil" → "marta.gil".
       Si ya existe, se le pega un número. Es más fácil de dictar que un correo. */
    const base = slugificar(nombre).replace(/-/g, '.') || 'cuenta'
    const usados = new Set(privado.usuarios.map((u) => u.id))
    let id = base
    for (let i = 2; usados.has(id); i += 1) id = `${base}${i}`

    const clave = claveAleatoria()
    privado.usuarios.push({
      id,
      nombre,
      huella: hashear(clave),
      activo: true,
      creada: new Date().toISOString(),
    })

    try {
      escribirPrivado(privado)
    } catch (e) {
      console.error('Panel: no se pudo crear la cuenta', e.message)
      return res.status(500).json({ ok: false, error: 'No se pudo guardar en el disco.' })
    }

    console.log(`Panel: ${quien} crea la cuenta de club ${id}`)
    /* La contraseña se devuelve AQUÍ Y SOLO AQUÍ: lo guardado es su huella, así
       que ni Diego puede volver a verla. Si se pierde, se da de baja la cuenta y
       se crea otra. */
    return res.status(200).json({ ok: true, clave, usuario: sinHuella(privado.usuarios.at(-1)) })
  }

  if (accion === 'usuario-baja') {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Solo POST' })
    const cuerpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
    const id = texto(cuerpo.id, 60)

    const privado = leerPrivado()
    const cuenta = privado.usuarios.find((u) => u.id === id)
    if (!cuenta) return res.status(404).json({ ok: false, error: 'Esa cuenta no existe.' })

    /* Se marca inactiva, no se borra: sus peticiones antiguas siguen diciendo
       quién las mandó, y así se ve que la cuenta existió. */
    cuenta.activo = false
    cuenta.baja = new Date().toISOString()

    try {
      escribirPrivado(privado)
    } catch (e) {
      console.error('Panel: no se pudo dar de baja', e.message)
      return res.status(500).json({ ok: false, error: 'No se pudo guardar en el disco.' })
    }

    console.log(`Panel: ${quien} da de baja la cuenta de club ${id}`)
    return res.status(200).json({ ok: true, usuarios: privado.usuarios.map(sinHuella) })
  }

  // ---- bandeja de peticiones ----
  if (accion === 'peticiones') {
    if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Solo GET' })
    return res.status(200).json({ ok: true, peticiones: leerPrivado().peticiones })
  }

  if (accion === 'peticion-estado') {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Solo POST' })
    const cuerpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
    const id = texto(cuerpo.id, 60)
    const estado = ESTADOS.includes(cuerpo.estado) ? cuerpo.estado : ''
    if (!estado) return res.status(400).json({ ok: false, error: 'Estado no válido.' })

    const privado = leerPrivado()
    const peticion = privado.peticiones.find((p) => p.id === id)
    if (!peticion) return res.status(404).json({ ok: false, error: 'Esa petición no existe.' })

    peticion.estado = estado
    peticion.cerrada = estado === 'nueva' ? '' : new Date().toISOString()

    /* Al cerrarla se van sus fotos. Son fotos de cantera, muchas de menores: no
       tienen por qué quedarse en el volumen para siempre una vez publicadas o
       descartadas. Las rutas se conservan solo como rastro de qué hubo. */
    if (estado !== 'nueva' && !peticion.fotosBorradas) {
      peticion.fotos.forEach(borrarImagen)
      peticion.fotosBorradas = true
    }

    try {
      escribirPrivado(privado)
    } catch (e) {
      console.error('Panel: no se pudo cambiar el estado', e.message)
      return res.status(500).json({ ok: false, error: 'No se pudo guardar en el disco.' })
    }

    console.log(`Panel: ${quien} marca la petición ${id} como ${estado}`)
    return res.status(200).json({ ok: true, peticiones: privado.peticiones })
  }

  return res.status(404).json({ ok: false, error: 'No encontrado' })
}

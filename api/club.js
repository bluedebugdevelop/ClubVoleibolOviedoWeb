// ==========================================================================
// API del área del club: donde entrenadores y delegados piden que se publique
// algo en redes, en vez de mandárselo a Diego por WhatsApp.
//
//   POST /api/club/entrar    { usuario, clave } → deja la cookie firmada
//   GET  /api/club/sesion                       → quién soy y los límites
//   POST /api/club/salir                        → borra la cookie
//   POST /api/club/imagen    (bytes) → { ruta }
//   POST /api/club/peticion  { texto, prioridad, paraCuando, equipo, fotos }
//   GET  /api/club/mias                         → lo que ha mandado esta cuenta
//
// LO QUE ESTE ROL **NO** PUEDE HACER: nada del panel. Ni noticias, ni
// patrocinadores, ni equipos, ni fotos del sitio. Solo lo de aquí. El corte está
// en `api/panel.js`, que exige `sesionAdmin`.
//
// Las cuentas las crea Diego desde el panel y viven en el almacén privado, no
// en variables de entorno: son varias y cambian cada temporada.
// ==========================================================================

import {
  escribirPrivado,
  guardarImagen,
  leerPrivado,
  TAMANO_MAXIMO,
  TIPOS_ACEPTADOS,
} from './_almacen.js'
import {
  apuntaFallo,
  bloqueadoHasta,
  borrarCookie,
  claveCoincide,
  configurado,
  MAX_INTENTOS,
  olvidaFallos,
  ponerCookie,
  quienLlama,
  sesion,
} from './_acceso.js'
import { avisarPeticion } from './_telegram.js'

const PRIORIDADES = ['alta', 'normal', 'baja']

/** Topes. Sin esto, una cuenta filtrada llena el volumen en una tarde. */
const MAX_FOTOS = 6
const MAX_TEXTO = 1200
const MAX_PENDIENTES = 15 // peticiones sin cerrar por cuenta
const MAX_POR_HORA = 10

const texto = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/** Solo rutas que hayamos generado nosotros al subir. */
const rutaSubida = (v) => {
  const s = texto(v, 300)
  return s.startsWith('/subidas/') ? s : ''
}

/** Una fecha `YYYY-MM-DD` de hoy en adelante, o cadena vacía. */
function fecha(v) {
  const s = texto(v, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return ''
  const d = new Date(`${s}T00:00:00`)
  if (Number.isNaN(d.getTime())) return ''
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  // una fecha pasada casi siempre es un dedazo; se ignora en vez de guardarla
  return d >= hoy ? s : ''
}

/**
 * La cuenta que hay detrás de la cookie, o `null`.
 *
 * Se busca en el almacén CADA VEZ, no se fía de la cookie: una cuenta dada de
 * baja conserva su cookie firmada hasta que caduca (30 días), y sin esta
 * comprobación seguiría entrando un mes después de irse del club.
 */
function cuentaDeLaSesion(req) {
  const s = sesion(req)
  if (!s || s.rol !== 'club') return null
  const cuenta = leerPrivado().usuarios.find((u) => u.id === s.nombre)
  return cuenta && cuenta.activo ? cuenta : null
}

export default async function handler(req, res) {
  const accion = (req.params?.accion || req.url.split('/').filter(Boolean).pop() || '').split('?')[0]
  const seguro = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https'

  // Sin PANEL_SECRETO no se firma ninguna cookie: el área no existe.
  if (!configurado()) return res.status(404).json({ ok: false, error: 'No encontrado' })

  // ---- entrar: lo único que no pide cookie ----
  if (accion === 'entrar') {
    if (req.method !== 'POST') return res.status(404).json({ ok: false })

    const ip = quienLlama(req)
    const espera = bloqueadoHasta(ip)
    if (espera > 0) {
      const minutos = Math.ceil(espera / 60000)
      return res.status(429).json({
        ok: false,
        error: `Demasiados intentos fallidos (${MAX_INTENTOS}). Vuelve a probar dentro de ${minutos} min.`,
      })
    }

    const cuerpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
    const id = texto(cuerpo.usuario, 60).toLowerCase()
    const cuenta = leerPrivado().usuarios.find((u) => u.id === id && u.activo)

    /* Se comprueba la contraseña AUNQUE la cuenta no exista, contra una huella
       de mentira. Si se saliera antes, el tiempo de respuesta diría si el
       usuario es bueno, y se podrían ir descubriendo cuentas una a una. */
    const huella = cuenta?.huella || 'scrypt$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAA'
    const claveOk = claveCoincide(cuerpo.clave, huella)

    if (!cuenta || !claveOk) {
      const quedan = apuntaFallo(ip)
      console.warn(`Club: acceso fallido (${id || 'sin usuario'}) desde ${ip}`)
      return res.status(401).json({
        ok: false,
        error: 'Usuario o contraseña incorrectos.',
        quedan: quedan <= 2 ? Math.max(0, quedan) : undefined,
      })
    }

    olvidaFallos(ip)
    ponerCookie(res, cuenta.id, seguro, 'club')
    console.log(`Club: entra ${cuenta.id} desde ${ip}`)
    return res.status(200).json({ ok: true, nombre: cuenta.nombre })
  }

  const cuenta = cuentaDeLaSesion(req)
  if (!cuenta) return res.status(401).json({ ok: false, error: 'Hay que iniciar sesión.' })

  if (accion === 'salir') {
    borrarCookie(res)
    return res.status(200).json({ ok: true })
  }

  if (accion === 'sesion') {
    return res.status(200).json({
      ok: true,
      nombre: cuenta.nombre,
      maxFotos: MAX_FOTOS,
      maxTexto: MAX_TEXTO,
      limiteImagen: TAMANO_MAXIMO,
      tiposImagen: TIPOS_ACEPTADOS,
    })
  }

  if (accion === 'mias') {
    if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Solo GET' })
    const mias = leerPrivado()
      .peticiones.filter((p) => p.autor === cuenta.id)
      .slice(-20)
      .reverse()
    return res.status(200).json({ ok: true, peticiones: mias })
  }

  // ---- subir una foto ----
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
      console.log(`Club: ${cuenta.id} sube ${ruta}`)
      return res.status(200).json({ ok: true, ruta })
    } catch (e) {
      return res.status(400).json({ ok: false, error: e.message })
    }
  }

  // ---- dejar una petición ----
  if (accion === 'peticion') {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Solo POST' })
    const cuerpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})

    const cuerpoTexto = texto(cuerpo.texto, MAX_TEXTO)
    if (cuerpoTexto.length < 10) {
      return res.status(400).json({ ok: false, error: 'Cuéntame un poco más de qué va la publicación.' })
    }

    const fotos = (Array.isArray(cuerpo.fotos) ? cuerpo.fotos : [])
      .map(rutaSubida)
      .filter(Boolean)
      .slice(0, MAX_FOTOS)

    const privado = leerPrivado()

    const pendientes = privado.peticiones.filter(
      (p) => p.autor === cuenta.id && p.estado === 'nueva',
    ).length
    if (pendientes >= MAX_PENDIENTES) {
      return res.status(429).json({
        ok: false,
        error: `Tienes ${pendientes} peticiones sin atender. Espera a que se publiquen antes de mandar más.`,
      })
    }

    const haceUnaHora = Date.now() - 60 * 60 * 1000
    const recientes = privado.peticiones.filter(
      (p) => p.autor === cuenta.id && new Date(p.creada).getTime() > haceUnaHora,
    ).length
    if (recientes >= MAX_POR_HORA) {
      return res.status(429).json({ ok: false, error: 'Has mandado muchas seguidas. Prueba dentro de un rato.' })
    }

    const peticion = {
      id: `p-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      autor: cuenta.id,
      autorNombre: cuenta.nombre,
      creada: new Date().toISOString(),
      texto: cuerpoTexto,
      prioridad: PRIORIDADES.includes(cuerpo.prioridad) ? cuerpo.prioridad : 'normal',
      paraCuando: fecha(cuerpo.paraCuando),
      equipo: texto(cuerpo.equipo, 60),
      fotos,
      estado: 'nueva',
      cerrada: '',
      fotosBorradas: false,
    }

    privado.peticiones.push(peticion)
    try {
      escribirPrivado(privado)
    } catch (e) {
      console.error('Club: no se pudo guardar la petición', e.message)
      return res.status(500).json({ ok: false, error: 'No se pudo guardar. Inténtalo otra vez.' })
    }

    console.log(`Club: ${cuenta.id} deja la petición ${peticion.id} (${peticion.prioridad})`)

    /* Después de guardar y sin esperarlo: el aviso es una comodidad, no parte
       de la operación. Si Telegram está caído, la petición ya está a salvo. */
    const sitio = `${seguro ? 'https' : req.protocol}://${req.headers.host}`
    avisarPeticion(peticion, sitio)

    return res.status(200).json({ ok: true, peticion })
  }

  return res.status(404).json({ ok: false, error: 'No encontrado' })
}

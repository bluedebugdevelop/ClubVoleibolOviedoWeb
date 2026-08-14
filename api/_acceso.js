// ==========================================================================
// Quién puede tocar qué.
//
// Hay DOS roles y comparten esta maquinaria (ver `ROLES`, más abajo):
//   · admin — Diego. Una sola cuenta, la de las variables de entorno.
//   · club  — entrenadores y delegados. Sus cuentas viven en el almacén
//             privado, las crea el admin, y solo sirven para dejar peticiones
//             de publicación.
//
// El área del club también necesita PANEL_SECRETO: sin él no se firma ninguna
// cookie, así que sin panel configurado tampoco hay área del club.
//
// La cuenta de administración, con usuario y contraseña:
//
//   PANEL_USUARIO=admin
//   PANEL_CLAVE_HASH=scrypt$<sal en base64url>$<hash en base64url>
//   PANEL_SECRETO=<cadena larga y aleatoria, para firmar la cookie>
//
// La contraseña NO se guarda en ningún sitio, ni siquiera en las variables de
// Railway: lo que se guarda es su huella scrypt, de la que no se puede volver
// atrás. El hash se genera con `node scripts/clave.mjs` (ver ese fichero).
//
// scrypt y no SHA: está pensado a propósito para ser lento y comer memoria, así
// que probar millones de contraseñas sale carísimo. Node lo trae de serie, no
// hace falta ninguna dependencia.
//
// La cookie de sesión va firmada con HMAC usando PANEL_SECRETO, es HttpOnly (el
// JavaScript de la página no puede leerla) y SameSite=Strict (no viaja desde
// otra web, lo que corta los ataques de tipo CSRF). Dura 30 días.
//
// Cambiar PANEL_SECRETO cierra la sesión en todos los dispositivos a la vez:
// es la forma de echar a alguien que se dejó la sesión abierta en un ordenador
// que no controlamos.
// ==========================================================================

import crypto from 'node:crypto'

const COOKIE = 'cvo_panel'
const DIAS = 30

// Parámetros de scrypt. N=2^15 tarda ~100 ms por intento en un servidor
// modesto: ni se nota al entrar, y hace inviable probar a lo bruto.
const SCRYPT = { N: 32768, r: 8, p: 1, keylen: 64, maxmem: 64 * 1024 * 1024 }

export const usuario = () => (process.env.PANEL_USUARIO || 'admin').trim()

const claveHash = () => (process.env.PANEL_CLAVE_HASH || '').trim()

function secreto() {
  // Sin secreto propio no se firma nada: es preferible que el panel quede
  // cerrado a que acepte cookies que cualquiera podría fabricar.
  return process.env.PANEL_SECRETO || ''
}

/** ¿Está el panel montado? Sin las tres variables, no existe. */
export function configurado() {
  return /^scrypt\$[\w-]+\$[\w-]+$/.test(claveHash()) && secreto().length >= 16
}

/** Comparación en tiempo constante: no filtra cuántos caracteres se acertaron. */
function iguales(a, b) {
  const A = Buffer.from(String(a))
  const B = Buffer.from(String(b))
  if (A.length !== B.length) return false
  return crypto.timingSafeEqual(A, B)
}

/** Huella de una contraseña, en el formato que se guarda en PANEL_CLAVE_HASH. */
export function hashear(clave, sal = crypto.randomBytes(16)) {
  const hash = crypto.scryptSync(clave.normalize('NFKC'), sal, SCRYPT.keylen, SCRYPT)
  return `scrypt$${sal.toString('base64url')}$${hash.toString('base64url')}`
}

/**
 * ¿Son correctos usuario y contraseña?
 *
 * Se comprueban SIEMPRE los dos, aunque el usuario ya falle: si se saliera
 * antes, un atacante notaría por lo que tarda cuándo ha acertado el usuario.
 */
export function credencialesValidas(nombre, clave) {
  if (!configurado()) return false
  const [, sal64] = claveHash().split('$')

  let sal
  try {
    sal = Buffer.from(sal64, 'base64url')
  } catch {
    return false
  }

  let calculado
  try {
    calculado = hashear(String(clave ?? ''), sal)
  } catch {
    return false
  }

  const claveOk = iguales(calculado, claveHash())
  const usuarioOk = iguales(String(nombre ?? '').trim().toLowerCase(), usuario().toLowerCase())
  return claveOk && usuarioOk
}

/**
 * ¿Coinciden una contraseña y una huella guardada?
 *
 * Lo de arriba compara contra `PANEL_CLAVE_HASH`, que es una variable de
 * entorno. Las cuentas del club guardan su huella en el almacén, así que
 * necesitan comparar contra un valor cualquiera. La cuenta la busca quien
 * llame; aquí no se toca el disco a propósito, para que este fichero siga sin
 * depender de dónde se guarden las cosas.
 */
export function claveCoincide(clave, guardado) {
  const huella = String(guardado || '')
  if (!/^scrypt\$[\w-]+\$[\w-]+$/.test(huella)) return false

  const [, sal64] = huella.split('$')
  let sal
  try {
    sal = Buffer.from(sal64, 'base64url')
  } catch {
    return false
  }

  let calculado
  try {
    calculado = hashear(String(clave ?? ''), sal)
  } catch {
    return false
  }
  return iguales(calculado, huella)
}

/**
 * Contraseña para una cuenta nueva del club.
 *
 * Se genera aquí y se le enseña a Diego UNA vez, al crearla: lo que se guarda
 * es la huella, así que ni él ni nadie puede volver a verla después. Si se
 * pierde, se genera otra.
 *
 * Sin `l` ni `1` ni `O` ni `0`: esto se dicta por teléfono o se copia de una
 * pantalla, y esos cuatro caracteres son los que hacen volver a llamar.
 */
export function claveAleatoria(largo = 12) {
  const abc = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.randomBytes(largo)
  let salida = ''
  for (let i = 0; i < largo; i += 1) salida += abc[bytes[i] % abc.length]
  return salida
}

function firma(datos) {
  return crypto.createHmac('sha256', secreto()).update(datos).digest('base64url')
}

// --------------------------------------------------------------------------
// Dos roles, una sola cookie.
//
//   admin — Diego. Entra al panel y lo toca todo.
//   club  — entrenadores y delegados. SOLO pueden dejar peticiones de
//           publicación: ni ven el panel ni tocan el contenido de la web.
//
// El rol viaja DENTRO de la firma. Si fuera por fuera (una cookie aparte, o un
// campo sin firmar), cualquiera con una sesión de club se ascendería a admin
// editando su propio navegador.
// --------------------------------------------------------------------------
export const ROLES = ['admin', 'club']

export function crearCookie(nombre, rol = 'admin') {
  const caduca = Date.now() + DIAS * 24 * 60 * 60 * 1000
  const datos =
    `${Buffer.from(rol).toString('base64url')}.` +
    `${Buffer.from(nombre).toString('base64url')}.${caduca}`
  return `${datos}.${firma(datos)}`
}

/**
 * Quién viene en la cookie: `{ rol, nombre }`, o `null` si no vale o caducó.
 *
 * Que el rol sea `club` NO significa que la cuenta siga existiendo: eso lo
 * comprueba `api/club.js` contra la lista de usuarios, porque aquí no se toca
 * el almacén. Una cuenta dada de baja conserva su cookie firmada hasta que
 * caduca; el que corta el paso es ese segundo control.
 */
export function leerCookie(valor) {
  if (!valor || !configurado()) return null
  const partes = String(valor).split('.')

  // Formato viejo, sin rol: `nombre.caduca.sello`. Se sigue aceptando para no
  // echar a quien tuviera el panel abierto al desplegar esto. Siempre es admin,
  // porque cuando se firmó no existía otro rol.
  if (partes.length === 3) {
    const [nombre64, caduca, sello] = partes
    if (!iguales(sello, firma(`${nombre64}.${caduca}`))) return null
    if (Number(caduca) < Date.now()) return null
    const nombre = Buffer.from(nombre64, 'base64url').toString()
    return nombre.toLowerCase() === usuario().toLowerCase() ? { rol: 'admin', nombre } : null
  }

  if (partes.length !== 4) return null
  const [rol64, nombre64, caduca, sello] = partes
  if (!iguales(sello, firma(`${rol64}.${nombre64}.${caduca}`))) return null
  if (Number(caduca) < Date.now()) return null

  const rol = Buffer.from(rol64, 'base64url').toString()
  if (!ROLES.includes(rol)) return null
  const nombre = Buffer.from(nombre64, 'base64url').toString()

  // si se cambia PANEL_USUARIO, las cookies del anterior dejan de valer
  if (rol === 'admin' && nombre.toLowerCase() !== usuario().toLowerCase()) return null
  return { rol, nombre }
}

/** Cookies de la petición, sin dependencias extra. */
export function cookies(req) {
  const bruto = req.headers.cookie || ''
  const salida = {}
  for (const trozo of bruto.split(';')) {
    const i = trozo.indexOf('=')
    if (i < 0) continue
    salida[trozo.slice(0, i).trim()] = decodeURIComponent(trozo.slice(i + 1).trim())
  }
  return salida
}

/** Quién hace la petición: `{rol, nombre}`, o `null` si no es nadie. */
export function sesion(req) {
  return leerCookie(cookies(req)[COOKIE])
}

/** Atajo para las rutas del panel: solo devuelve nombre si es admin. */
export function sesionAdmin(req) {
  const s = sesion(req)
  return s && s.rol === 'admin' ? s.nombre : null
}

export function ponerCookie(res, nombre, seguro, rol = 'admin') {
  const trozos = [
    `${COOKIE}=${crearCookie(nombre, rol)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${DIAS * 24 * 60 * 60}`,
  ]
  if (seguro) trozos.push('Secure')
  res.setHeader('Set-Cookie', trozos.join('; '))
}

export function borrarCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`)
}

// --------------------------------------------------------------------------
// Freno contra la fuerza bruta.
//
// Ahora el usuario es adivinable ("admin"), así que lo único que separa a un
// atacante del panel es la contraseña. Se cuenta cuántas veces falla cada IP y
// se le va cerrando la puerta: cinco intentos seguidos y a esperar.
//
// Vive en memoria, no en disco: al reiniciar el servidor se olvida. Es lo justo
// para un sitio de un club, y evita montar una base de datos para esto. Si
// alguien reinicia el servidor a voluntad para saltárselo, ya tiene acceso a
// cosas peores que el panel.
// --------------------------------------------------------------------------
const intentos = new Map()
const MAX_INTENTOS = 5
const CASTIGO = 15 * 60 * 1000 // 15 minutos

export function quienLlama(req) {
  // Railway va detrás de un proxy, así que la IP real viene en la cabecera.
  const reenviada = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
  return reenviada || req.socket?.remoteAddress || 'desconocida'
}

/** Milisegundos que le quedan de castigo a esta IP; 0 si puede intentarlo. */
export function bloqueadoHasta(ip) {
  const r = intentos.get(ip)
  if (!r || r.fallos < MAX_INTENTOS) return 0
  return Math.max(0, r.hasta - Date.now())
}

export function apuntaFallo(ip) {
  const r = intentos.get(ip) || { fallos: 0, hasta: 0 }
  r.fallos += 1
  r.hasta = Date.now() + CASTIGO
  intentos.set(ip, r)

  // Limpieza perezosa: sin esto el Map crecería sin fin con IPs de paso.
  if (intentos.size > 500) {
    const ahora = Date.now()
    for (const [k, v] of intentos) if (v.hasta < ahora) intentos.delete(k)
  }
  return MAX_INTENTOS - r.fallos
}

export function olvidaFallos(ip) {
  intentos.delete(ip)
}

export { COOKIE, MAX_INTENTOS }

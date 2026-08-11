// ==========================================================================
// Quién puede tocar el panel.
//
// El club no quiere pantalla de inicio de sesión en la web: se le da acceso a
// dos o tres personas "a mano" y punto. Eso se hace así:
//
//   1. Cada persona tiene su propio token, en la variable PANEL_ACCESOS:
//        PANEL_ACCESOS="adrian:t0k3n-largo,diego:otro-t0k3n,vitor:otro-mas"
//   2. Se le pasa UNA vez su enlace:  https://…/panel?acceso=t0k3n-largo
//   3. El servidor comprueba el token, deja una cookie firmada de 90 días y
//      quita el token de la URL. A partir de ahí entra en /panel y ya está.
//
// Por qué un token por persona y no una clave común: se puede quitar el acceso
// a uno solo (borrando su línea) sin cambiarle el enlace a los demás, y en el
// registro del servidor queda quién publicó cada cosa.
//
// La cookie va firmada con HMAC usando PANEL_SECRETO, es HttpOnly (el
// JavaScript de la página no puede leerla) y SameSite=Strict (no viaja desde
// otra web, lo que corta los ataques de tipo CSRF).
//
// AVISO honesto: sin pantalla de login, quien consiga el enlace entra. No hay
// segundo factor ni contraseña que recordar. Es la contrapartida de lo que se
// pidió; si algún día se filtra un token, se cambia esa línea de PANEL_ACCESOS
// y ese acceso muere.
// ==========================================================================

import crypto from 'node:crypto'

const COOKIE = 'cvo_panel'
const DIAS = 90

/** [{ nombre, token }] a partir de PANEL_ACCESOS. */
export function accesos() {
  return (process.env.PANEL_ACCESOS || '')
    .split(',')
    .map((par) => par.trim())
    .filter(Boolean)
    .map((par) => {
      const i = par.indexOf(':')
      if (i < 0) return null
      const nombre = par.slice(0, i).trim()
      const token = par.slice(i + 1).trim()
      return nombre && token ? { nombre, token } : null
    })
    .filter(Boolean)
}

function secreto() {
  // Sin secreto propio no se firma nada: es preferible que el panel quede
  // cerrado a que acepte cookies que cualquiera podría fabricar.
  return process.env.PANEL_SECRETO || ''
}

export function configurado() {
  return accesos().length > 0 && secreto().length >= 16
}

/** Comparación en tiempo constante: no filtra cuántos caracteres se acertaron. */
function iguales(a, b) {
  const A = Buffer.from(String(a))
  const B = Buffer.from(String(b))
  if (A.length !== B.length) return false
  return crypto.timingSafeEqual(A, B)
}

/** ¿A quién corresponde este token? `null` si a nadie. */
export function quienEs(token) {
  if (!token) return null
  for (const a of accesos()) {
    if (iguales(a.token, token)) return a.nombre
  }
  return null
}

function firma(datos) {
  return crypto.createHmac('sha256', secreto()).update(datos).digest('base64url')
}

export function crearCookie(nombre) {
  const caduca = Date.now() + DIAS * 24 * 60 * 60 * 1000
  const datos = `${Buffer.from(nombre).toString('base64url')}.${caduca}`
  return `${datos}.${firma(datos)}`
}

/** Nombre de quien viene en la cookie, o `null` si no vale o ha caducado. */
export function leerCookie(valor) {
  if (!valor || !configurado()) return null
  const partes = String(valor).split('.')
  if (partes.length !== 3) return null
  const [nombre64, caduca, sello] = partes
  if (!iguales(sello, firma(`${nombre64}.${caduca}`))) return null
  if (Number(caduca) < Date.now()) return null
  const nombre = Buffer.from(nombre64, 'base64url').toString()
  // que siga en la lista: al borrar a alguien de PANEL_ACCESOS su cookie deja
  // de valer al momento, sin esperar a que caduque
  return accesos().some((a) => a.nombre === nombre) ? nombre : null
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

/** Quién hace la petición, o `null` si no es nadie con permiso. */
export function sesion(req) {
  return leerCookie(cookies(req)[COOKIE])
}

export function ponerCookie(res, nombre, seguro) {
  const trozos = [
    `${COOKIE}=${crearCookie(nombre)}`,
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

export { COOKIE }

// ==========================================================================
// La puerta única.
//
//   GET  /api/acceso           → ¿hay sesión? { rol, nombre, destino }
//   POST /api/acceso           { usuario, clave } → entra y dice a dónde ir
//
// Antes había dos puertas: `/panel/entrar` para Diego y `/club/entrar` para los
// entrenadores. En cuanto se usó de verdad pasó lo previsible (16-08-2026): una
// cuenta del club se probó en el panel, el panel la rechazó —correctamente— y
// desde fuera eso se ve como «la cuenta no funciona».
//
// Ahora se escribe usuario y contraseña en un solo sitio y es el SERVIDOR quien
// decide a dónde va cada uno. Nadie tiene que saber qué tipo de cuenta tiene.
//
// Las dos comprobaciones se hacen SIEMPRE, aunque la primera acierte: si se
// saliera antes, lo que tarda la respuesta diría de qué tipo es la cuenta que se
// acaba de probar. Son dos scrypt, unos 200 ms; al entrar no se nota y a quien
// pruebe a lo bruto le cuesta el doble.
// ==========================================================================

import {
  apuntaFallo,
  bloqueadoHasta,
  claveCoincide,
  configurado,
  credencialesValidas,
  MAX_INTENTOS,
  ponerCookie,
  olvidaFallos,
  quienLlama,
  sesion,
  usuario,
} from './_acceso.js'
import { leerPrivado } from './_almacen.js'
import { cuentaDeLaSesion } from './club.js'

/** A dónde manda cada rol. */
const DESTINO = { admin: '/panel', club: '/club' }

/* Una huella que no puede coincidir con nada, para gastar el mismo tiempo
   cuando el usuario no existe. Sin esto, un usuario inventado contesta al
   instante y uno real tarda lo que tarda scrypt: así se van descubriendo
   cuentas una a una. */
const HUELLA_FALSA = 'scrypt$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAA'

export default async function handler(req, res) {
  if (!configurado()) return res.status(404).json({ ok: false, error: 'No encontrado' })

  // ---- ¿ya hay sesión? ----
  if (req.method === 'GET') {
    const s = sesion(req)
    if (!s) return res.status(401).json({ ok: false })

    /* Para el rol club no basta la cookie: la cuenta puede estar dada de baja
       y su cookie seguir firmada hasta 30 días. */
    if (s.rol === 'club') {
      const cuenta = cuentaDeLaSesion(req)
      if (!cuenta) return res.status(401).json({ ok: false })
      return res.status(200).json({ ok: true, rol: 'club', nombre: cuenta.nombre, destino: DESTINO.club })
    }
    return res.status(200).json({ ok: true, rol: 'admin', nombre: s.nombre, destino: DESTINO.admin })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ ok: false, error: 'Solo GET o POST' })
  }

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
  const nombre = typeof cuerpo.usuario === 'string' ? cuerpo.usuario.trim().slice(0, 60) : ''
  const clave = cuerpo.clave
  const seguro = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https'

  // Las dos, siempre, en este orden y sin cortocircuito.
  const esAdmin = credencialesValidas(nombre, clave)
  const cuenta = leerPrivado().usuarios.find((u) => u.id === nombre.toLowerCase() && u.activo)
  const esClub = claveCoincide(clave, cuenta?.huella || HUELLA_FALSA) && Boolean(cuenta)

  if (esAdmin) {
    olvidaFallos(ip)
    ponerCookie(res, usuario(), seguro, 'admin')
    console.log(`Acceso: entra ${usuario()} (admin) desde ${ip}`)
    return res.status(200).json({ ok: true, rol: 'admin', nombre: usuario(), destino: DESTINO.admin })
  }

  if (esClub) {
    olvidaFallos(ip)
    ponerCookie(res, cuenta.id, seguro, 'club')
    console.log(`Acceso: entra ${cuenta.id} (club) desde ${ip}`)
    return res.status(200).json({ ok: true, rol: 'club', nombre: cuenta.nombre, destino: DESTINO.club })
  }

  const quedan = apuntaFallo(ip)
  console.warn(`Acceso: fallo de ${nombre || 'sin usuario'} desde ${ip}`)
  return res.status(401).json({
    ok: false,
    error: 'Usuario o contraseña incorrectos.',
    quedan: quedan <= 2 ? Math.max(0, quedan) : undefined,
  })
}

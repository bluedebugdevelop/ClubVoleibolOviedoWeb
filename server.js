// ==========================================================================
// Servidor de producción (Railway).
//
// El sitio es un SPA de Vite: en Vercel bastaba con subir `dist/` y las
// funciones de `api/` se desplegaban solas. Railway no hace ninguna de las dos
// cosas: corre un contenedor y espera que algo escuche en `process.env.PORT`.
// Este fichero es ese algo.
//
//   - sirve `dist/` como estático
//   - monta `api/inscripcion.js` y `api/patrocinio.js` como rutas normales
//     (los handlers ya tenían la firma (req, res) de Express, no hubo que
//     tocarlos; siguen valiendo si algún día se vuelve a Vercel)
//   - devuelve `index.html` para cualquier otra ruta, que es lo que antes
//     hacía el `rewrites` de vercel.json
//   - repite las cabeceras de seguridad que ponía vercel.json
//
// Variables de entorno: las mismas de siempre (RESEND_API_KEY, etc.), ahora en
// Railway → Variables en vez de en el panel de Vercel.
// ==========================================================================

import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import inscripcion from './api/inscripcion.js'
import patrocinio from './api/patrocinio.js'
import contacto from './api/contacto.js'
import contenido from './api/contenido.js'
import competicion from './api/competicion.js'
import panel from './api/panel.js'
import club from './api/club.js'
import acceso from './api/acceso.js'
import resumen from './api/resumen.js'
import { SUBIDAS, TIPOS_ACEPTADOS, esPersistente } from './api/_almacen.js'
import { configurado as panelConfigurado, sesion, sesionAdmin } from './api/_acceso.js'
import { claveValida as claveDelRobot } from './api/resumen.js'

const raiz = path.dirname(fileURLToPath(import.meta.url))
const dist = path.join(raiz, 'dist')

const app = express()

app.disable('x-powered-by')
// Railway mete un proxy delante; sin esto req.protocol y la IP del cliente
// serían las del proxy, y el control de origen de los formularios compara
// contra el host de verdad.
app.set('trust proxy', 1)


/* ---- Content-Security-Policy ----

   La que faltaba. Hoy no hay por dónde colar un script —cero
   `dangerouslySetInnerHTML` en src/ y React escapa solo—, pero por esta web pasa
   texto escrito en tres sitios que NO son el código: el panel, el área del club
   y el robot semanal. La CSP es la red que hay debajo de eso.

   De dónde sale cada permiso, para que no se toque a ciegas:
     script-src   solo lo nuestro. El JSON-LD de index.html es `application/ld+json`,
                  que el navegador NO ejecuta, así que no necesita permiso.
     style-src    'unsafe-inline' porque el tipo de letra viene de Google Fonts y
                  algún estilo va incrustado. No abre XSS: un atacante no llega a
                  ejecutar nada por pintar CSS.
     font-src     fonts.gstatic.com, que es de donde Google Fonts sirve el .woff2.
     img-src      blob: lo necesita el recortador de fotos del panel
                  (src/components/RecorteImagen.jsx, URL.createObjectURL).
     frame-src    el mapa de Google incrustado en /contacto.
     connect-src  'self': todo el fetch de la web va a /api/*, nada fuera.
     frame-ancestors  hace lo mismo que X-Frame-Options, que ya solo entienden
                  los navegadores viejos.

   La página de aprobación de `api/resumen.js` lleva un <script> incrustado y se
   pone SU PROPIA CSP con nonce; no depende de esta. */
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self'",
  "frame-src 'self' https://www.google.com",
  'upgrade-insecure-requests',
].join('; ')

// Las mismas cabeceras que declaraba vercel.json. Se ponen a mano en vez de
// tirar de helmet: son cinco líneas y no hace falta otra dependencia.
app.use((_req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.setHeader('Content-Security-Policy', CSP)
  next()
})

/* ---- un solo dominio para Google ----

   Railway deja la web servida en DOS sitios a la vez: el dominio del club y el
   suyo, clubvoleiboloviedoweb-production.up.railway.app. Para Google son dos
   webs con el mismo contenido, y puede acabar enseñando la fea en los
   resultados. La etiqueta `canonical` ya le dice cuál es la buena, pero un 301
   es más contundente: la de Railway deja de existir para el buscador.

   Solo actúa si DOMINIO_CANONICO está declarada. Si algún día el dominio del
   club diera problemas, se borra esa variable y se vuelve a entrar por el de
   Railway sin tocar código. */
const DOMINIO = (process.env.DOMINIO_CANONICO || '').trim().replace(/^https?:\/\//, '').replace(/\/$/, '')

if (DOMINIO) {
  app.use((req, res, siguiente) => {
    const host = (req.headers.host || '').split(':')[0]
    // localhost queda fuera: si no, no habría forma de probarlo en local
    const esLocal = host === 'localhost' || host === '127.0.0.1'
    if (!host || esLocal || host === DOMINIO) return siguiente()
    // solo lo que se navega; un POST redirigido pierde el cuerpo por el camino
    if (req.method !== 'GET' && req.method !== 'HEAD') return siguiente()
    return res.redirect(301, `https://${DOMINIO}${req.originalUrl}`)
  })
}


/* ---- permisos ANTES de tragarse el cuerpo ----

   `express.raw` de aquí abajo se come los 5 MB enteros en memoria y solo
   DESPUÉS llega el handler a mirar si hay sesión. O sea que cualquiera, sin
   cuenta, podía mandar 5 MB una y otra vez y hacérselos guardar para acabar
   recibiendo un 401. Comprobado el 09-09-2026: 5.000.000 de bytes subidos y
   luego el 401.

   Esta guarda usa las MISMAS funciones que el handler, no una copia: es un
   filtro previo, el control de verdad sigue estando dentro. */
const antesDeTragar = (puede) => (req, res, siguiente) => {
  // otro método no sube nada; el handler ya responde su 405 con la cabecera Allow
  if (req.method !== 'POST') return siguiente()
  if (puede(req)) return siguiente()
  return res.status(401).json({ ok: false, error: 'Hay que iniciar sesión.' })
}

const esAdmin = (req) => Boolean(sesionAdmin(req))
const esDelClub = (req) => sesion(req)?.rol === 'club'

// ---- panel de administración ----
// Va ANTES del express.json de abajo porque necesita otros límites: 32kb no dan
// para una lista de noticias, y una imagen no es JSON.
app.use('/api/panel/imagen', antesDeTragar(esAdmin), express.raw({ type: TIPOS_ACEPTADOS, limit: '5mb' }))
app.use('/api/panel', express.json({ limit: '1mb' }))
app.all('/api/panel/:accion', panel)

// ---- área del club: peticiones de publicación ----
// Mismo reparto de límites que el panel, pero el JSON va más corto: aquí no se
// manda una lista entera, solo una petición con sus rutas de foto.
app.use('/api/club/imagen', antesDeTragar(esDelClub), express.raw({ type: TIPOS_ACEPTADOS, limit: '5mb' }))
app.use('/api/club', express.json({ limit: '64kb' }))
app.all('/api/club/:accion', club)

// ---- la puerta única ----
// Un solo formulario para las dos áreas: el servidor mira la cuenta y dice a
// dónde va. Va aquí arriba, con los otros dos, porque comparte el express.json
// propio y no el de 32kb de los formularios públicos.
app.use('/api/acceso', express.json({ limit: '8kb' }))
app.all('/api/acceso', acceso)

// ---- la noticia semanal de Instagram ----
// El robot sube la foto por `/imagen` (bytes crudos, como el panel) y deja el
// texto por `/borrador`; el resto de rutas las abre Diego desde el enlace del
// aviso de Telegram. Va con los de arriba porque necesita sus propios límites.
app.use('/api/resumen/imagen', antesDeTragar(claveDelRobot), express.raw({ type: TIPOS_ACEPTADOS, limit: '5mb' }))
app.use('/api/resumen', express.json({ limit: '256kb' }))
app.all('/api/resumen/:accion', resumen)

// Las imágenes que sube el panel. Se sirven desde el volumen, no desde dist/,
// así que sobreviven a los despliegues igual que el JSON.
// `immutable` puede ponerse porque el nombre lleva un sufijo aleatorio: una
// imagen con el mismo nombre nunca cambia de contenido.
app.use('/subidas', express.static(SUBIDAS, { maxAge: '30d', immutable: true, fallthrough: true }))

// Los formularios mandan JSON y son cuatro campos: 32kb sobra de largo y evita
// que alguien intente colar un cuerpo enorme.
app.use(express.json({ limit: '32kb' }))

// `app.all` y no `app.post` a propósito: los handlers ya responden 405 con su
// cabecera Allow cuando les llega otro método, y así se conserva ese detalle
// en vez de acabar cayendo en el index.html de abajo.
app.all('/api/inscripcion', inscripcion)
app.all('/api/patrocinio', patrocinio)
app.all('/api/contacto', contacto)
app.all('/api/contenido', contenido)
// Los datos de las federaciones. La web los trae en el bundle; esto es para la
// app móvil, que no pasa por Vite.
app.all('/api/competicion', competicion)

// Vite mete el hash en el nombre de cada asset, así que se pueden cachear para
// siempre. El resto (favicon, imágenes de public/) con el valor por defecto.
app.use('/assets', express.static(path.join(dist, 'assets'), { maxAge: '1y', immutable: true }))
app.use(express.static(dist, { index: false }))

// Sustituto del rewrite de vercel.json: cualquier ruta que no sea un fichero
// existente la resuelve el router de React. Solo para GET/HEAD; un POST a una
// ruta que no existe es un error, no una página.
app.use((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(404).json({ ok: false, error: 'No encontrado' })
  }
  /* Una imagen que no está tiene que decir que no está. Sin esto, pedir una
     subida borrada devolvía el index.html con un 200: el navegador se comía una
     página entera creyendo que era un JPEG, y en las herramientas de red parecía
     que el fichero seguía ahí. Estas dos carpetas son ficheros, nunca rutas de
     la web, así que aquí no tienen nada que buscar. */
  if (req.path.startsWith('/subidas/') || req.path.startsWith('/media/')) {
    return res.status(404).type('txt').send('No encontrado')
  }
  res.sendFile(path.join(dist, 'index.html'))
})

const puerto = process.env.PORT || 3000
// 0.0.0.0 y no localhost: si escuchara solo en el loopback, Railway no vería
// el puerto abierto y el servicio se quedaría sin exponer.
app.listen(puerto, '0.0.0.0', () => {
  console.log(`cvo-web escuchando en el puerto ${puerto}`)
  if (!esPersistente()) {
    console.warn(
      'AVISO: no hay volumen montado. Lo que se publique desde el panel se ' +
        'perderá en el siguiente despliegue. Monta un Volume en /data.',
    )
  }
  /* Sin estas variables el panel responde 404 y el candado de la barra lleva a
     «página no encontrada». Visto desde fuera parece un fallo, así que aquí se
     dice en voz alta qué falta en vez de dejarlo a que alguien lo deduzca. */
  if (!panelConfigurado()) {
    console.warn(
      'AVISO: el panel está APAGADO. Faltan (o están mal) PANEL_CLAVE_HASH y/o ' +
        'PANEL_SECRETO. Genéralas con `node scripts/clave.mjs`. ' +
        'PANEL_CLAVE_HASH tiene la forma scrypt$<sal>$<hash> y PANEL_SECRETO ' +
        'necesita 16 caracteres como mínimo.',
    )
  }
})

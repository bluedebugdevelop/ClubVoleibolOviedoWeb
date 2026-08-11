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
import panel from './api/panel.js'
import { SUBIDAS, TIPOS_ACEPTADOS, esPersistente } from './api/_almacen.js'

const raiz = path.dirname(fileURLToPath(import.meta.url))
const dist = path.join(raiz, 'dist')

const app = express()

app.disable('x-powered-by')
// Railway mete un proxy delante; sin esto req.protocol y la IP del cliente
// serían las del proxy, y el control de origen de los formularios compara
// contra el host de verdad.
app.set('trust proxy', 1)

// Las mismas cabeceras que declaraba vercel.json. Se ponen a mano en vez de
// tirar de helmet: son cinco líneas y no hace falta otra dependencia.
app.use((_req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  next()
})

// ---- panel de administración ----
// Va ANTES del express.json de abajo porque necesita otros límites: 32kb no dan
// para una lista de noticias, y una imagen no es JSON.
app.use('/api/panel/imagen', express.raw({ type: TIPOS_ACEPTADOS, limit: '5mb' }))
app.use('/api/panel', express.json({ limit: '1mb' }))
app.all('/api/panel/:accion', panel)

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
})

// ==========================================================================
// Deja una noticia como BORRADOR en la web y devuelve el enlace para aprobarla.
//
//   node scripts/borrador.mjs <fichero.json>
//
// El fichero es una noticia tal cual la guarda el panel:
//
//   {
//     "noticia": { "categoria": "...", "fecha": "19 ago 2026", "titulo": "...",
//                  "resumen": "...", "img": "/media/...", "foco": "center 30%",
//                  "cuerpo": ["párrafo", "párrafo"],
//                  "galeria": [{ "ruta": "/media/...", "pie": "..." }] },
//     "fuentes": ["https://…"]        ← opcional, de dónde salió
//   }
//
// Variables: `SITIO` (por defecto el dominio del club) y `SITIO_CLAVE`, que es
// el mismo valor que `RESUMEN_SECRETO` en Railway.
//
// Esto NO publica: deja el borrador y escupe el enlace. Publicar es abrir ese
// enlace y darle al botón. Es el mismo camino que usa el resumen semanal
// (`scripts/resumen-semanal.mjs`), pero con el texto escrito a mano en vez de
// sacado de Instagram — que es como se usa mientras no haya token.
// ==========================================================================

import fs from 'node:fs'

const SITIO = (process.env.SITIO || 'https://clubvoleiboloviedo.com').replace(/\/$/, '')
const CLAVE = (process.env.SITIO_CLAVE || '').trim()

const fichero = process.argv[2]
if (!fichero) {
  console.error('Falta el fichero: node scripts/borrador.mjs <fichero.json>')
  process.exit(1)
}
if (!CLAVE) {
  console.error('Falta SITIO_CLAVE (el mismo valor que RESUMEN_SECRETO en Railway).')
  process.exit(1)
}

const datos = JSON.parse(fs.readFileSync(fichero, 'utf-8'))
const lista = Array.isArray(datos) ? datos : [datos]

for (const entrada of lista) {
  const r = await fetch(`${SITIO}/api/resumen/borrador`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-clave': CLAVE },
    body: JSON.stringify(entrada),
  })
  const respuesta = await r.json().catch(() => ({}))
  if (!respuesta.ok) {
    console.error(`No entró «${entrada.noticia?.titulo}»: ${respuesta.error || r.status}`)
    process.exit(1)
  }
  console.log(`${entrada.noticia.titulo}\n  ${respuesta.enlace}\n`)
}

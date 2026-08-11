// ==========================================================================
// Genera dist/sitemap.xml a partir de las rutas de src/App.jsx.
//
// Se ejecuta después de `vite build` (ver el script `build` de package.json),
// así que el fichero sale con las noticias, equipos y patrocinadores que haya
// en ese momento en `src/data/contenido.js`. Hacerlo a mano significaba
// olvidarse de actualizarlo cada vez que se añade una noticia.
//
// El sitemap NO hace que Google indexe: le dice qué páginas existen y cuándo
// se tocaron. Hay que darlo de alta una vez en Search Console.
// ==========================================================================

import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  equipos,
  noticias,
  patrocinadoresActuales,
  tieneFicha,
  productos,
  tiendaAbierta,
} from '../src/data/contenido.js'

const SITIO = 'https://clubvoleiboloviedo.com'
const raiz = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

// `prioridad` es orientativa y Google la ignora casi siempre; lo que sí usa es
// la lista de URLs. Se deja porque otros buscadores la miran.
const estaticas = [
  ['/', 1.0],
  ['/inscripciones', 0.9],
  ['/cantera', 0.8],
  ['/quienes-somos', 0.8],
  ['/calendario', 0.7],
  ['/noticias', 0.7],
  ['/patrocinar', 0.7],
  ['/patrocinadores', 0.6],
  ['/contacto', 0.6],
  ['/aviso-legal', 0.2],
  ['/privacidad', 0.2],
  ['/cookies', 0.2],
]

const rutas = [...estaticas]

// Un equipo por ficha: son las páginas que buscan los padres ("cadete femenino
// oviedo") y las que más tráfico de cola larga traen.
for (const slug of Object.keys(equipos)) rutas.push([`/equipos/${slug}`, 0.7])

// Solo las noticias con cuerpo: las demás no tienen página propia, el enlace
// se queda en el listado (ver `enlaceNoticia`).
for (const n of noticias) if (n.slug && n.cuerpo) rutas.push([`/noticias/${n.slug}`, 0.6])

// Igual con los patrocinadores: sin párrafos no hay ficha que enseñar.
for (const m of patrocinadoresActuales) {
  if (m.slug && tieneFicha(m)) rutas.push([`/patrocinadores/${m.slug}`, 0.4])
}

// La tienda está cerrada (`tiendaAbierta = false`): /tienda enseña un aviso y
// las fichas de producto redirigen. Mandarlas al sitemap sería enviar a Google
// a páginas vacías, así que solo entran cuando se abra.
if (tiendaAbierta) {
  rutas.push(['/tienda', 0.5])
  for (const p of productos) if (p.slug) rutas.push([`/tienda/${p.slug}`, 0.4])
}

const hoy = new Date().toISOString().slice(0, 10)

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rutas
  .map(
    ([ruta, prioridad]) =>
      `  <url>\n` +
      `    <loc>${SITIO}${ruta}</loc>\n` +
      `    <lastmod>${hoy}</lastmod>\n` +
      `    <priority>${prioridad.toFixed(1)}</priority>\n` +
      `  </url>`,
  )
  .join('\n')}
</urlset>
`

mkdirSync(path.join(raiz, 'dist'), { recursive: true })
writeFileSync(path.join(raiz, 'dist', 'sitemap.xml'), xml, 'utf8')
console.log(`sitemap.xml: ${rutas.length} URLs`)

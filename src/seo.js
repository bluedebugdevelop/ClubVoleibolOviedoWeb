// ==========================================================================
// Metadatos por página.
//
// El sitio es un SPA: `index.html` es el mismo fichero para las 17 rutas, así
// que sin esto Google indexaba todas con el mismo <title> y la misma
// description, y las trataba como duplicados. Este hook reescribe el <head> en
// cada navegación.
//
// Sin dependencias (nada de react-helmet): son cuatro etiquetas y el mismo
// criterio que en `server.js`, donde tampoco se metió helmet.
//
// Google renderiza el JS antes de indexar, así que ve el título ya reescrito.
// Si algún día hace falta que lo vea sin ejecutar JS (X/Twitter y WhatsApp NO
// ejecutan JS al generar la vista previa del enlace), habría que prerenderizar
// en el build o servir el <head> desde `server.js`.
// ==========================================================================

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export const SITIO = 'https://clubvoleiboloviedo.com'

// La description de reserva: la misma de `index.html`, para páginas que no
// pasen una propia.
const DESC_POR_DEFECTO =
  'Club Voleibol Oviedo, fundado en 1991. Equipos en Superliga 2 Masculino, ' +
  'Primera Nacional Femenina y una cantera de 9 equipos en el Polideportivo ' +
  'José Manuel Fuente, Colloto.'

function etiqueta(selector, crear) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = crear()
    document.head.appendChild(el)
  }
  return el
}

function meta(name, contenido) {
  etiqueta(`meta[name="${name}"]`, () => {
    const el = document.createElement('meta')
    el.setAttribute('name', name)
    return el
  }).setAttribute('content', contenido)
}

function og(property, contenido) {
  etiqueta(`meta[property="${property}"]`, () => {
    const el = document.createElement('meta')
    el.setAttribute('property', property)
    return el
  }).setAttribute('content', contenido)
}

/**
 * @param {object} opciones
 * @param {string} opciones.title    Título de la pestaña, sin el nombre del club.
 * @param {string} [opciones.description]
 * @param {string} [opciones.image]  Ruta absoluta del sitio (/media/…).
 * @param {boolean} [opciones.noindex] Para páginas que no deben salir en Google.
 */
export default function useSeo({ title, description, image, noindex = false }) {
  const { pathname } = useLocation()

  useEffect(() => {
    // La portada no repite el nombre: ya es "Club Voleibol Oviedo".
    const completo = pathname === '/' ? title : `${title} · Club Voleibol Oviedo`
    const desc = (description || DESC_POR_DEFECTO).replace(/\s+/g, ' ').trim().slice(0, 300)
    const url = SITIO + pathname
    const foto = SITIO + (image || '/media/hero-poster.jpg')

    document.title = completo
    meta('description', desc)
    // `max-image-preview:large` autoriza a Google a enseñar la foto grande al
    // lado del resultado. Sin ella el resultado sale sin imagen. Tiene que ir
    // igual que en `index.html`: esta línea pisa aquella cuando Google ejecuta
    // el JS, así que si solo se cambia una, la otra manda.
    meta(
      'robots',
      noindex
        ? 'noindex, follow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    )

    // Canonical: el sitio responde también en `…up.railway.app` y con `?utm_…`
    // pegado por las campañas. Sin esta línea, Google ve varias URLs con el
    // mismo contenido y reparte la autoridad entre ellas.
    etiqueta('link[rel="canonical"]', () => {
      const el = document.createElement('link')
      el.setAttribute('rel', 'canonical')
      return el
    }).setAttribute('href', url)

    og('og:title', completo)
    og('og:description', desc)
    og('og:url', url)
    og('og:image', foto)
    og('og:type', pathname.startsWith('/noticias/') ? 'article' : 'website')
    meta('twitter:title', completo)
    meta('twitter:description', desc)
    meta('twitter:image', foto)
  }, [pathname, title, description, image, noindex])
}

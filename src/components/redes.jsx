import { club } from '../data/contenido'

/* Las redes del club, en un sitio solo: las pintan la barra de arriba
   (`Nav.jsx`) y el pie (`Footer.jsx`), y antes estaban duplicadas en los dos
   con enlaces a "#".

   La lista NO se escribe aquí: sale de `club.redes` (contenido.js). Este módulo
   solo pone el icono y el nombre de cada una, y descarta las que no tengan
   enlace de verdad. Así, para añadir o quitar una red se toca un único sitio.

   Va aparte de Nav.jsx porque un fichero que exporta componentes y además
   constantes rompe el fast refresh de Vite. */

const ICONOS = {
  instagram: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  facebook: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 9h3V6h-3c-2 0-3.5 1.5-3.5 3.5V12H8v3h2.5v7h3v-7H16l.5-3h-3V9.8c0-.5.4-.8 1-.8z" />
    </svg>
  ),
  youtube: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.7-1.8C18.3 5 12 5 12 5s-6.3 0-7.9.5A2.5 2.5 0 0 0 2.4 7.3C2 8.8 2 12 2 12s0 3.2.4 4.7c.2.9.9 1.6 1.7 1.8 1.6.5 7.9.5 7.9.5s6.3 0 7.9-.5a2.5 2.5 0 0 0 1.7-1.8C22 15.2 22 12 22 12zM10 15V9l5.2 3z" />
    </svg>
  ),
}

const NOMBRES = { instagram: 'Instagram', facebook: 'Facebook', youtube: 'YouTube' }

export const redes = Object.entries(club.redes)
  .filter(([clave, url]) => url && url !== '#' && ICONOS[clave])
  .map(([clave, url]) => ({ clave, nombre: NOMBRES[clave] ?? clave, href: url, icono: ICONOS[clave] }))

import Crest from './Crest'
import { escudoDe, esEquipoDelClub } from '../data/competicion'

// Escudo de un equipo, al lado de su nombre (clasificación y partidos).
//
// Tres casos, por orden:
//   1. Es el club     → el escudo vectorial de la casa, que se ve nítido a
//                       cualquier tamaño (components/Crest.jsx).
//   2. Hay escudo     → el PNG que publica la RFEVB, ya descargado y encogido
//                       en public/media/escudos (ver scripts/lib/escudos.mjs).
//   3. No hay ninguno → un monograma con las iniciales. La federación asturiana
//                       no publica escudos, así que toda la cantera cae aquí, y
//                       un hueco vacío desalinearía las filas.
//
// El escudo es decoración: el nombre del equipo va escrito al lado, así que
// todos van marcados para que un lector de pantalla no los lea dos veces.

/* Palabras que no dicen nada de un club y estropearían las iniciales: casi
   todos empiezan por "CV" o "Club Voleibol". */
const RELLENO = /^(c\.?\s?v\.?|c\.?\s?d\.?|a\.?\s?d\.?|s\.?\s?d\.?|club|voleibol|volei|voley|de|del|la|el|los|las|y)$/i

/** "Río Duero Soria" → "RD". Una o dos letras, nunca más. */
function iniciales(nombre) {
  const palabras = String(nombre)
    .split(/[\s.·/-]+/)
    .filter((p) => p && !RELLENO.test(p))
  const utiles = palabras.length ? palabras : String(nombre).split(/\s+/).filter(Boolean)
  return utiles.slice(0, 2).map((p) => p[0]).join('').toUpperCase() || '?'
}

/* El color sale del propio nombre, así que un mismo club lo lleva siempre igual
   sin tener que guardarlo en ningún sitio. Tono cualquiera, pero saturación y
   luminosidad fijas: así ninguno se sale del tono sobrio del resto de la web. */
function tono(nombre) {
  let h = 0
  for (const c of String(nombre)) h = (h * 31 + c.codePointAt(0)) % 360
  return h
}

export default function EscudoEquipo({ nombre, escudo, className = '' }) {
  const clase = ['escudo', className].filter(Boolean).join(' ')
  const fichero = escudo ?? escudoDe(nombre)

  if (esEquipoDelClub(nombre)) {
    return (
      <span className={`${clase} escudo-cvo`} aria-hidden="true">
        <Crest />
      </span>
    )
  }

  if (fichero) {
    return <img className={clase} src={fichero} alt="" aria-hidden="true" loading="lazy" />
  }

  return (
    <span
      className={`${clase} escudo-mono`}
      style={{ '--mono': `hsl(${tono(nombre)} 42% 42%)` }}
      aria-hidden="true"
    >
      {iniciales(nombre)}
    </span>
  )
}

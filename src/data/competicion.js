// Adaptador entre los datos scrapeados de las federaciones y las formas que ya
// consumen las páginas. La idea es que `Calendario.jsx` no sepa de dónde salen
// los datos: recibe las mismas estructuras que antes venían de `contenido.js`.
//
// El JSON lo genera `npm run datos` (ver scripts/scrape.mjs). Si estuviera
// vacío —primera ejecución, o las dos federaciones caídas— `hayDatosReales` es
// false y la página tira de los datos de muestra de contenido.js.

import datos from './competicion.json'
import {
  jornadas as jornadasMuestra,
  clasificaciones as clasificacionesMuestra,
  competiciones as competicionesMuestra,
  equiposFiltro as equiposFiltroMuestra,
} from './contenido'

const EQUIPOS = Array.isArray(datos?.equipos) ? datos.equipos : []

export const hayDatosReales = EQUIPOS.length > 0
export const generado = datos?.generado ?? null
export const temporadaDatos = datos?.temporada ?? null

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
const MESES_LARGO = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

/** 'YYYY-MM-DDTHH:MM' → Date local (sin sorpresas de zona horaria). */
function aFecha(iso) {
  if (!iso) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(iso)
  if (!m) return null
  return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] ?? 0), +(m[5] ?? 0))
}

// ---------------------------------------------------------------------------
// Colores de competición.
//
// Se mantiene el criterio que ya había en contenido.js: los colores salen del
// logotipo oficial de cada liga (rojo para las nacionales masculinas, ámbar
// para las femeninas) y la cantera se queda con el azul del club.
// ---------------------------------------------------------------------------
const ROJO = { color: '#dd0a16', sobre: '#fff', tinte: '#fdeaeb', tinta: '#c00812' }
const AMBAR = { color: '#ffad00', sobre: '#3d2a00', tinte: '#fff4dd', tinta: '#9a6600' }
const AZUL = { color: '#1560bd', sobre: '#fff', tinte: '#eaf2fb', tinta: '#1560bd' }

function colores(equipo) {
  if (equipo.ente !== 'RFEVB') return AZUL
  return equipo.genero === 'Femenino' ? AMBAR : ROJO
}

/** ¿Es este el equipo del club dentro del partido? */
const esClub = (nombre, equipoClub) => {
  const n = String(nombre).toUpperCase()
  return n === String(equipoClub).toUpperCase() || /\bC\.?\s?V\.?\s+OVIEDO\b/.test(n)
}

/** Convierte un partido scrapeado al formato que pinta la página. */
function aPartido(p, equipo) {
  const d = aFecha(p.iso)
  const clubLocal = esClub(p.local, equipo.equipoClub)
  const jugado = p.setsLocal != null && p.setsVisitante != null

  let tipo = 'next'
  if (jugado) {
    const propios = clubLocal ? p.setsLocal : p.setsVisitante
    const ajenos = clubLocal ? p.setsVisitante : p.setsLocal
    tipo = propios > ajenos ? 'w' : 'l'
  }

  const detalle = [
    equipo.division || equipo.grupo,
    p.sede || null,
    p.hora || null,
  ].filter(Boolean).join(' · ')

  return {
    id: p.id,
    equipo: equipo.nombre,
    iso: p.iso,
    diaSemana: d ? DIAS[d.getDay()] : '',
    dia: d ? String(d.getDate()) : '',
    mes: d ? MESES[d.getMonth()] : '',
    rival: `${p.local} — ${p.visitante}`,
    detalle,
    resultado: jugado ? `${p.setsLocal}–${p.setsVisitante}` : null,
    parciales: p.parciales ?? [],
    tipo,
    local: clubLocal,
    retransmite: false, // las federaciones no publican enlaces de retransmisión
  }
}

/** Todos los partidos de todos los equipos, ya en formato de página. */
const TODOS_PARTIDOS = EQUIPOS.flatMap((e) => e.partidos.map((p) => aPartido(p, e)))

/** Agrupa por fin de semana y titula el bloque con las fechas que contiene. */
function agrupar(partidos) {
  const bloques = new Map()

  for (const p of partidos) {
    const d = aFecha(p.iso)
    if (!d) continue
    // clave = lunes de esa semana, así sábado y domingo caen juntos
    const lunes = new Date(d)
    lunes.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    const clave = lunes.toISOString().slice(0, 10)
    if (!bloques.has(clave)) bloques.set(clave, [])
    bloques.get(clave).push(p)
  }

  return [...bloques.entries()]
    .map(([clave, lista]) => {
      lista.sort((a, b) => String(a.iso).localeCompare(String(b.iso)))
      const fechas = [...new Set(lista.map((p) => aFecha(p.iso)?.getDate()).filter(Boolean))]
      const mes = aFecha(lista[0].iso)?.getMonth() ?? 0
      const dias = fechas.length > 1
        ? `${fechas.slice(0, -1).join(', ')} y ${fechas.at(-1)}`
        : `${fechas[0]}`
      return { id: `s-${clave}`, clave, titulo: `${dias} de ${MESES_LARGO[mes]}`, partidos: lista }
    })
    .sort((a, b) => a.clave.localeCompare(b.clave))
}

const HOY = new Date()
HOY.setHours(0, 0, 0, 0)

const futuros = TODOS_PARTIDOS.filter((p) => {
  const d = aFecha(p.iso)
  return d && d >= HOY
})
const pasados = TODOS_PARTIDOS.filter((p) => {
  const d = aFecha(p.iso)
  return d && d < HOY
})

/**
 * Bloques que ve la página: primero lo que viene (más cercano arriba) y después
 * lo ya jugado (más reciente arriba). Se limita para no volcar la temporada
 * entera de once equipos de golpe.
 */
export const jornadas = hayDatosReales
  ? [
      ...agrupar(futuros).slice(0, 3).map((b, i) => ({
        ...b,
        titulo: i === 0 ? `Próximos partidos · ${b.titulo}` : `Jornada · ${b.titulo}`,
      })),
      ...agrupar(pasados).reverse().slice(0, 4).map((b) => ({
        ...b,
        titulo: `Jugado · ${b.titulo}`,
      })),
    ]
  : jornadasMuestra

export const competiciones = hayDatosReales
  ? Object.fromEntries(
      EQUIPOS.map((e) => [
        e.nombre,
        {
          liga: e.division || e.grupo,
          grupo: e.grupo || '',
          ente: e.ente,
          nacional: e.ente === 'RFEVB',
          url: e.url,
          ...colores(e),
        },
      ]),
    )
  : competicionesMuestra

export const clasificaciones = hayDatosReales
  ? Object.fromEntries(
      EQUIPOS.filter((e) => e.clasificacion?.length).map((e) => [e.nombre, e.clasificacion]),
    )
  : clasificacionesMuestra

export const equiposFiltro = hayDatosReales
  ? ['Todos los equipos', ...EQUIPOS.map((e) => e.nombre)]
  : equiposFiltroMuestra

/** Equipos con clasificación, en orden: los que enseña el filtro "Todos". */
export const destacadosClasificacion = hayDatosReales
  ? EQUIPOS.filter((e) => e.ente === 'RFEVB' && e.clasificacion?.length).map((e) => e.nombre)
  : ['Superliga 2 Masculino', 'Primera Nacional Femenina']

export const equiposCompeticion = EQUIPOS

// ---------------------------------------------------------------------------
// Fichas de equipo (/equipos/:slug)
//
// Las páginas de los dos equipos nacionales existían antes que el scraper, así
// que su slug no coincide con el nombre que devuelven las federaciones. Se
// prueba una lista de nombres por orden: el primero que exista, gana. El
// masculino aparece dos veces porque en 2025/26 el equipo aún jugaba la
// Primera División Nacional; al empezar en Superliga 2 pasará a valer la
// primera opción sin tocar nada.
// ---------------------------------------------------------------------------
const ALIAS = {
  'superliga-2-masculino': [
    'Superliga Masculina 2',
    'Senior Masculino · 1ª Nacional',
    'Sénior Masculino · 1ª Nacional',
    'Senior Masculino',
  ],
  'primera-nacional-femenina': [
    'Primera División Femenina',
    'Primera Nacional Femenina',
    'Senior Femenino',
  ],
}

/** El equipo scrapeado que corresponde a una ficha, o null. */
export function equipoDeFicha(slug) {
  for (const nombre of ALIAS[slug] ?? [slug]) {
    const e = EQUIPOS.find((x) => x.nombre === nombre)
    if (e) return e
  }
  return null
}

/**
 * Partidos de una ficha de equipo: lo próximo primero y después lo último
 * jugado, de más reciente a más antiguo. Si no hay datos reales devuelve los
 * de muestra que trae la propia ficha.
 */
export function fixturesDeFicha(slug, porDefecto = []) {
  const equipo = equipoDeFicha(slug)
  if (!equipo) return porDefecto

  const partidos = equipo.partidos.map((p) => aPartido(p, equipo))
  const proximos = partidos
    .filter((p) => { const d = aFecha(p.iso); return d && d >= HOY })
    .slice(0, 2)
  const jugados = partidos
    .filter((p) => { const d = aFecha(p.iso); return d && d < HOY })
    .reverse()
    .slice(0, 6 - proximos.length)

  const lista = [...proximos, ...jugados]
  return lista.length ? lista : porDefecto
}

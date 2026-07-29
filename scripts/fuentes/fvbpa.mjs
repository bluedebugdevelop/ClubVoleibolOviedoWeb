// Federación de Voleibol del Principado de Asturias (fvbpa.com)
// -----------------------------------------------------------------------------
// Cubre TODOS los equipos de cantera y territoriales del club.
//
// La web es una app Rails con URLs muy predecibles:
//   /competiciones-{categoria}                         → ids de edición
//   /editions/{ed}/calendars                           → nombre + grupos
//   /editions/{ed}/calendars?tab=full_calendar&edition_group_id={g}
//                                                      → desplegable de equipos
//   ...&team_id={t}                                    → calendario de UN equipo
//   /editions/{ed}/calendars?tab=clasification&edition_group_id={g}
//                                                      → clasificación del grupo
//
// El descubrimiento es automático a propósito: cada temporada la federación
// crea ediciones nuevas con ids distintos, así que en vez de fijar los ids a
// mano recorremos las categorías y nos quedamos con los grupos donde aparece
// algún equipo del club. Así el scraper sobrevive al cambio de temporada sin
// tocar código.

import { bajar } from '../lib/http.mjs'
import { texto, todos, divs } from '../lib/html.mjs'

const BASE = 'https://www.fvbpa.com'

const CATEGORIAS = [
  'senior', 'junior', 'juvenil', 'cadete',
  'infantil', 'alevin', 'benjamin', 'minibenjamin',
]

const MESES = {
  ene: 1, feb: 2, mar: 3, abr: 4, may: 5, jun: 6,
  jul: 7, ago: 8, sep: 9, oct: 10, nov: 11, dic: 12,
}

const html = (url) => bajar(url, { charset: 'utf-8' })

/**
 * DESCANSA no es un equipo: es el hueco que deja el que descansa en los grupos
 * con un número impar de participantes. La federación lo trata como si jugara
 * —le apunta un 3-0 en el calendario y hasta le abre fila en la clasificación,
 * con 0 puntos y todos los sets en contra—, así que hay que descartarlo en los
 * dos sitios o la web enseña victorias inventadas y un último clasificado que
 * no existe.
 */
export function esRivalReal(nombre) {
  return !/^\s*(descansa|descanso|libre|bye|sin\s+rival)\s*$/i.test(String(nombre))
}

/** ¿Este nombre de equipo es del Club Voleibol Oviedo? */
export function esDelClub(nombre) {
  const n = nombre.toUpperCase()
  // "CV OVIEDO", "C.V. OVIEDO A", "CV OVIEDO B"… pero NO otros clubes de la
  // ciudad que también llevan "Oviedo" en el nombre (p. ej. universitarios).
  return /\bC\.?\s?V\.?\s+OVIEDO\b/.test(n) || /^OVIEDO\b/.test(n)
}

/**
 * "4 oct 09:45" → { iso: '2025-10-04T09:45', ... }
 * La federación no pone el año, así que se deduce de la temporada: de agosto en
 * adelante es el año de inicio; de enero a julio, el siguiente.
 */
function fecha(cadena, anioInicio) {
  const m = /^(\d{1,2})\s+([a-záéíóú]{3})\.?(?:\s+(\d{1,2}):(\d{2}))?/i.exec(cadena.trim())
  if (!m) return null
  const dia = Number(m[1])
  const mes = MESES[m[2].toLowerCase().slice(0, 3)]
  if (!mes) return null
  const anio = mes >= 8 ? anioInicio : anioInicio + 1
  const p = (n) => String(n).padStart(2, '0')

  // La federación escribe "00:00" cuando el horario no está fijado (partidos
  // de las ligas nacionales que ella solo registra a efectos de resultado).
  // Pintar "00:00" en la web haría creer que se juega a medianoche, así que se
  // trata como hora desconocida y la ficha se queda solo con el día.
  const hora = m[3] && !(m[3] === '00' && m[4] === '00') ? `${p(m[3])}:${m[4]}` : null

  return {
    iso: `${anio}-${p(mes)}-${p(dia)}` + (hora ? `T${hora}` : ''),
    hora,
  }
}

/** Parciales de un lado del marcador: los <div class="set …"> entre dos marcas. */
function sets(bloque, desde, hasta) {
  const i = bloque.indexOf(desde)
  const j = bloque.indexOf(hasta)
  if (i < 0 || j < 0) return []
  return todos(/class="set[^"]*"[^>]*>\s*(\d+)\s*</g, bloque.slice(i, j))
    .map((m) => Number(m[1]))
}

/** Partidos de una página de calendario. */
function partidos(pagina, anioInicio) {
  // Se parte por el marcador de cada partido en vez de casar un bloque con una
  // expresión regular: la versión con `(?=…|$)` exigía que la página terminara
  // justo detrás del último partido y, como no es así, se comía uno de cada
  // equipo (21 de 22 en la nacional masculina).
  //
  // El último trozo arrastra el pie de página, pero da igual: de cada bloque se
  // lee siempre la PRIMERA fecha, el primer equipo local, etc., que son los del
  // partido; lo que venga detrás no se mira.
  return pagina
    .split('<div class="day">')
    .slice(1)
    .map((b) => {
      const id = /live_match_(\d+)/.exec(b)?.[1]
      const local = divs(b, 'home_team')[0]
      const visitante = divs(b, 'visitor_team')[0]
      if (!local || !visitante) return null
      if (!esRivalReal(local) || !esRivalReal(visitante)) return null

      const parcialesLocal = sets(b, 'home_score', 'home_team')
      const parcialesVis = sets(b, 'visitor_score', 'visitor_team')
      // sets ganados = parciales en los que ese lado tiene más puntos.
      // Los 0-0 son placeholders de sets no jugados: no cuentan.
      let sl = 0
      let sv = 0
      parcialesLocal.forEach((p, i) => {
        const q = parcialesVis[i] ?? 0
        if (p === 0 && q === 0) return
        if (p > q) sl++
        else if (q > p) sv++
      })

      const f = fecha(divs(b, 'date')[0] ?? '', anioInicio)
      const estado = texto(/class="status"[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/.exec(b)?.[1] ?? '')
      const jugado = parcialesLocal.length > 0 && (sl > 0 || sv > 0)

      return {
        id: id ? `fvbpa-${id}` : `fvbpa-${local}-${visitante}-${f?.iso ?? ''}`,
        iso: f?.iso ?? null,
        hora: f?.hora ?? null,
        sede: divs(b, 'court_number')[0] || null,
        local,
        visitante,
        setsLocal: jugado ? sl : null,
        setsVisitante: jugado ? sv : null,
        parciales: jugado
          ? parcialesLocal
              .map((p, i) => [p, parcialesVis[i] ?? 0])
              .filter(([a, c]) => a || c)
              .map(([a, c]) => `${a}-${c}`)
          : [],
        estado: estado || null,
      }
    })
    .filter(Boolean)
}

/** Cabeceras <th> de una tabla, en texto. */
const cabeceras = (tabla) => todos(/<th[^>]*>([\s\S]*?)<\/th>/g, tabla).map((m) => texto(m[1]))

/** Clasificación de un grupo. */
function clasificacion(pagina) {
  // La tabla de clasificación se reconoce por llevar columnas Pts y J.
  //
  // No vale buscar "G3": las categorías pequeñas puntúan distinto y usan otras
  // columnas (el alevín lleva PG/PP en vez de G3/G2/P1/P0), así que exigir G3
  // dejaba esas clasificaciones fuera.
  const tabla = todos(/<table[\s\S]*?<\/table>/g, pagina)
    .map((m) => m[0])
    .find((t) => {
      const th = cabeceras(t)
      return th.includes('Pts') && th.includes('J')
    })
  if (!tabla) return []

  // Las columnas se localizan POR CABECERA, no por posición: la tabla empieza
  // con celdas sin título (el corazón de "equipo favorito", el puesto y el
  // nombre), así que los índices fijos no valen.
  const cabecera = cabeceras(tabla)
  const col = (nombre) => cabecera.indexOf(nombre)
  const iPts = col('Pts')
  if (iPts < 0) return []

  const esEntero = (s) => /^\d+$/.test(s)

  return todos(/<tr[^>]*>([\s\S]*?)<\/tr>/g, tabla)
    .map((m) => todos(/<td[^>]*>([\s\S]*?)<\/td>/g, m[1]).map((c) => texto(c[1])))
    .map((celdas) => {
      if (celdas.length <= iPts) return null

      // el equipo es la última celda con texto no numérico antes de Pts,
      // y el puesto, el último número entero que hay por delante de él
      let iEquipo = -1
      for (let i = iPts - 1; i >= 0; i--) {
        if (celdas[i] && !esEntero(celdas[i])) { iEquipo = i; break }
      }
      if (iEquipo < 0) return null

      let iPos = -1
      for (let i = iEquipo - 1; i >= 0; i--) {
        if (esEntero(celdas[i])) { iPos = i; break }
      }
      if (iPos < 0) return null
      if (!esRivalReal(celdas[iEquipo])) return null

      const n = (i) => (i < 0 || celdas[i] == null || celdas[i] === '' ? null : Number(celdas[i]))
      return {
        pos: Number(celdas[iPos]),
        equipo: celdas[iEquipo],
        pts: n(iPts),
        pj: n(col('J')),
        sf: n(col('SF')),
        sc: n(col('SC')),
        yo: esDelClub(celdas[iEquipo]),
      }
    })
    .filter(Boolean)
}

/**
 * Mapa `id de partido → número de jornada` de un grupo.
 *
 * El calendario completo lista los partidos seguidos, sin decir a qué jornada
 * pertenece cada uno; quien lo sabe es la vista por jornada (`&day=N`). Así que
 * se recorren las jornadas del grupo UNA vez y se apunta en qué jornada sale
 * cada id. Con eso, los partidos que ya tenemos del equipo quedan etiquetados
 * sin volver a pedirlos.
 */
async function jornadasDelGrupo(ed, gid) {
  const mapa = new Map()
  let portada
  try {
    portada = await html(`${BASE}/editions/${ed}/calendars?edition_group_id=${gid}`)
  } catch {
    return mapa
  }

  const dias = [...new Set(todos(/[?&]day=(\d+)/g, portada).map((m) => Number(m[1])))]
    .sort((a, b) => a - b)

  for (const dia of dias) {
    try {
      const p = await html(`${BASE}/editions/${ed}/calendars?edition_group_id=${gid}&day=${dia}`)
      for (const m of todos(/live_match_(\d+)/g, p)) {
        if (!mapa.has(m[1])) mapa.set(m[1], dia)
      }
    } catch {
      // si una jornada falla, los partidos de esa se quedan sin número
    }
  }
  return mapa
}

/** Ids de edición de todas las categorías. */
async function ediciones() {
  const ids = new Set()
  for (const cat of CATEGORIAS) {
    try {
      const p = await html(`${BASE}/competiciones-${cat}`)
      todos(/\/editions\/(\d+)\/calendars/g, p).forEach((m) => ids.add(m[1]))
    } catch {
      // una categoría caída no debe tumbar el resto
    }
  }
  return [...ids]
}

/** Metadatos y grupos de una edición. */
function meta(pagina) {
  const sel = /class="edition_group_selector[\s\S]*?<\/div>\s*<\/div>/.exec(pagina)?.[0] ?? pagina
  const grupos = []
  const vistos = new Set()
  for (const m of todos(/edition_group_id=(\d+)"[^>]*>([^<]{1,40})</g, sel)) {
    const [, gid, nombre] = m
    if (!vistos.has(gid) && nombre.trim()) {
      vistos.add(gid)
      grupos.push({ gid, nombre: texto(nombre) })
    }
  }
  if (!grupos.length) {
    const gid = /edition_group_id=(\d+)/.exec(pagina)?.[1]
    if (gid) grupos.push({ gid, nombre: 'Grupo único' })
  }
  return {
    categoria: divs(pagina, 'selected_age_category')[0] ?? '',
    genero: divs(pagina, 'selected_gender')[0] ?? '',
    division: texto(/class="title_fvbpa"[^>]*>([\s\S]*?)<\/h3>/.exec(pagina)?.[1] ?? ''),
    grupos,
  }
}

/**
 * Recorre toda la federación asturiana y devuelve una entrada por cada equipo
 * del club encontrado, con su calendario y la clasificación de su grupo.
 */
export async function scrapeFvbpa({ anioInicio, log = () => {} }) {
  const salida = []
  const eds = await ediciones()
  log(`  FVBPA: ${eds.length} ediciones que revisar`)

  for (const ed of eds) {
    let portada
    try {
      portada = await html(`${BASE}/editions/${ed}/calendars`)
    } catch (e) {
      log(`  ! edición ${ed}: ${e.message}`)
      continue
    }
    const { categoria, genero, division, grupos } = meta(portada)

    for (const { gid, nombre: grupo } of grupos) {
      const urlGrupo = `${BASE}/editions/${ed}/calendars?tab=full_calendar&edition_group_id=${gid}`
      let pagina
      try {
        pagina = await html(urlGrupo)
      } catch {
        continue
      }

      // equipos del club en este grupo, sacados del desplegable "Ver calendario
      // de un equipo..." (nos da el team_id, que es lo que permite pedir el
      // calendario ya filtrado en vez de tener que colar partidos a mano)
      const míos = todos(/team_id=(\d+)"[^>]*>([^<]+)</g, pagina)
        .map((m) => ({ tid: m[1], nombre: texto(m[2]) }))
        .filter((t) => esDelClub(t.nombre))

      if (!míos.length) continue

      let tabla = []
      try {
        tabla = clasificacion(
          await html(`${BASE}/editions/${ed}/calendars?tab=clasification&edition_group_id=${gid}`),
        )
      } catch {
        // sin clasificación (fases finales, cuadros) seguimos igual
      }

      // se calcula una sola vez por grupo y se reparte entre sus equipos
      const jornadaDe = await jornadasDelGrupo(ed, gid)

      for (const equipo of míos) {
        let cal
        try {
          cal = await html(`${urlGrupo}&team_id=${equipo.tid}`)
        } catch {
          continue
        }
        const lista = partidos(cal, anioInicio).map((p) => ({
          ...p,
          jornada: jornadaDe.get(String(p.id).replace(/^fvbpa-/, '')) ?? null,
          // la fase viaja con cada partido porque al unir liga regular y fase
          // final en un mismo equipo las jornadas vuelven a empezar por 1, y sin
          // saber de qué fase es cada una saldrían dos "Jornada 1" sueltas
          fase: grupo,
        }))
        if (!lista.length && !tabla.length) continue

        salida.push({
          fuente: 'FVBPA',
          ente: 'FVBPA',
          categoria,
          genero,
          division,
          grupo,
          equipoClub: equipo.nombre,
          url: `${urlGrupo}&team_id=${equipo.tid}`,
          partidos: lista,
          clasificacion: tabla,
        })
        log(`    · ${categoria} ${genero} — ${equipo.nombre} (${grupo}): ${lista.length} partidos`)
      }
    }
  }
  return salida
}

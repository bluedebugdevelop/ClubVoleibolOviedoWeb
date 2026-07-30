// Actualiza los datos de competición del club desde las dos federaciones.
//
//   npm run datos            → escribe src/data/competicion.json
//   npm run datos -- --seco  → solo enseña lo que encontraría, no escribe
//
// Se ejecuta a mano, desde GitHub Actions (.github/workflows/datos.yml) o en
// local antes de un despliegue. La web NO scrapea en caliente: lee el JSON ya
// generado, así la página carga instantánea y una caída de las federaciones no
// deja el calendario en blanco (se sigue viendo lo último bueno).

import { writeFile, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { scrapeFvbpa } from './fuentes/fvbpa.mjs'
import { scrapeRfevb } from './fuentes/rfevb.mjs'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const DESTINO = join(RAIZ, 'src', 'data', 'competicion.json')

const log = (...a) => console.log(...a)

/** Temporada deportiva vigente: de agosto a julio. */
function temporada(hoy = new Date()) {
  const inicio = hoy.getMonth() + 1 >= 8 ? hoy.getFullYear() : hoy.getFullYear() - 1
  return { inicio, etiqueta: `${inicio}/${String(inicio + 1).slice(2)}` }
}

const slug = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** Sufijo A/B del equipo, si lo lleva ("CV OVIEDO B" → "B"). */
const sufijo = (nombre) => /\b([AB])\s*$/.exec(nombre.toUpperCase())?.[1] ?? ''

/** Nombre presentable de un equipo del club. */
function nombrar(e) {
  if (e.ente === 'RFEVB') return e.division // "Superliga Masculina 2"
  const s = sufijo(e.equipoClub)
  return [e.categoria, e.genero, s].filter(Boolean).join(' ')
}

/** "Primera División Nacional" → "1ª Nacional" (para desempatar nombres). */
function abreviarDivision(d) {
  return String(d)
    .replace(/\bPrimera\b/i, '1ª')
    .replace(/\bSegunda\b/i, '2ª')
    .replace(/\bTercera\b/i, '3ª')
    .replace(/\bDivisión\s+(Masculina|Femenina)\b/i, 'División')
    .replace(/\bDivisión\b/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Une las entradas del mismo equipo que vienen partidas en varias fases
 * (liga regular + fase final son ediciones/grupos distintos en la FVBPA).
 */
function fusionar(entradas) {
  const porEquipo = new Map()

  for (const e of entradas) {
    const nombre = nombrar(e)
    // La división entra en la clave a propósito: el club puede tener DOS equipos
    // de la misma categoría y género en competiciones distintas (p. ej. sénior
    // masculino en Primera Nacional y otro en Segunda División). Sin ella se
    // fundirían en uno solo con los partidos de ambos mezclados. Las fases de
    // una misma competición (liga regular + fase final) sí comparten división,
    // así que esas se siguen uniendo, que es lo que queremos.
    const clave = slug(`${nombre}-${e.division}-${e.ente}`)
    const previo = porEquipo.get(clave)

    if (!previo) {
      porEquipo.set(clave, { ...e, clave, nombre, base: nombre, fases: [{ ...e }] })
      continue
    }
    previo.fases.push({ ...e })
    // partidos: unión sin duplicados
    const vistos = new Set(previo.partidos.map((p) => p.id))
    previo.partidos.push(...e.partidos.filter((p) => !vistos.has(p.id)))
  }

  // Si dos equipos distintos comparten nombre visible, se les añade la división
  // para poder distinguirlos en el filtro de la web.
  const cuenta = new Map()
  for (const eq of porEquipo.values()) cuenta.set(eq.base, (cuenta.get(eq.base) ?? 0) + 1)
  for (const eq of porEquipo.values()) {
    if (cuenta.get(eq.base) > 1) {
      const d = abreviarDivision(eq.division)
      if (d) eq.nombre = `${eq.base} · ${d}`
    }
    delete eq.base
  }

  for (const eq of porEquipo.values()) {
    eq.partidos.sort((a, b) => String(a.iso).localeCompare(String(b.iso)))

    // clasificación: la de la fase más reciente que incluya al club
    const conTabla = eq.fases
      .filter((f) => f.clasificacion?.some((r) => r.yo))
      .sort((a, b) => ultimaFecha(a) .localeCompare(ultimaFecha(b)))
    const elegida = conTabla.at(-1) ?? eq.fases.find((f) => f.clasificacion?.length)
    eq.clasificacion = elegida?.clasificacion ?? []
    eq.grupo = elegida?.grupo ?? eq.grupo
    eq.url = elegida?.url ?? eq.url

    delete eq.fases
  }
  return [...porEquipo.values()]
}

const ultimaFecha = (f) =>
  f.partidos.map((p) => p.iso ?? '').filter(Boolean).sort().at(-1) ?? ''

/** Orden de presentación: nacionales primero, luego de mayor a menor edad. */
const ORDEN = ['Sénior', 'Senior', 'Junior', 'Juvenil', 'Cadete', 'Infantil', 'Alevín', 'Benjamín', 'Minibenjamín']
function ordenar(a, b) {
  if (a.ente !== b.ente) return a.ente === 'RFEVB' ? -1 : 1
  // Entre los dos equipos nacionales manda el masculino, que es el primer
  // equipo del club (petición de Adrián, 2026-07-29). En la cantera se sigue
  // ordenando por nombre, donde el femenino cae antes por alfabeto.
  if (a.ente === 'RFEVB' && a.genero !== b.genero) return a.genero === 'Masculino' ? -1 : 1
  const ia = ORDEN.indexOf(a.categoria)
  const ib = ORDEN.indexOf(b.categoria)
  if (ia !== ib) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
  return a.nombre.localeCompare(b.nombre, 'es')
}

/**
 * Quita las competiciones nacionales que la FVBPA copia de la RFEVB.
 *
 * La federación asturiana replica las ligas nacionales en su web, pero con
 * retraso: jornadas sin meter y clasificaciones a medias. Cuando el mismo
 * equipo aparece en las dos, se conserva el de la RFEVB, que es la fuente
 * oficial y además trae los parciales de cada set. Si la RFEVB fallara, se
 * queda el asturiano y al menos hay datos.
 */
function sinDuplicadosNacionales(entradas, log = () => {}) {
  const generosEnRfevb = new Set(
    entradas.filter((e) => e.ente === 'RFEVB').map((e) => e.genero),
  )
  return entradas.filter((e) => {
    const esCopia =
      e.ente === 'FVBPA' &&
      /nacional/i.test(e.division ?? '') &&
      generosEnRfevb.has(e.genero)
    if (esCopia) {
      log(`  - se descarta la copia de la FVBPA: ${e.categoria} ${e.genero} — ${e.division}`)
    }
    return !esCopia
  })
}

async function main() {
  const seco = process.argv.includes('--seco')
  const t = temporada()
  log(`\nDatos de competición · temporada ${t.etiqueta}\n${'='.repeat(46)}`)

  const crudo = []

  log('\n[1/2] Federación Asturiana (FVBPA) — cantera y territorial')
  try {
    crudo.push(...(await scrapeFvbpa({ anioInicio: t.inicio, log })))
  } catch (e) {
    log(`  !! FVBPA falló entera: ${e.message}`)
  }

  log('\n[2/2] Federación Española (RFEVB) — categoría nacional')
  try {
    crudo.push(...(await scrapeRfevb({ log })))
  } catch (e) {
    log(`  !! RFEVB falló entera: ${e.message}`)
  }

  const equipos = fusionar(sinDuplicadosNacionales(crudo, log)).sort(ordenar)
  const partidos = equipos.reduce((n, e) => n + e.partidos.length, 0)

  log(`\n${'='.repeat(46)}`)
  log(`Equipos del club encontrados: ${equipos.length}`)
  log(`Partidos totales:             ${partidos}`)

  if (!equipos.length) {
    log('\nNo se encontró ni un equipo. No se toca el JSON existente.')
    process.exitCode = 1
    return
  }

  // Si una fuente que antes daba equipos ahora no da ninguno, NO se escribe.
  //
  // Pasó de verdad el 2026-07-29: desde GitHub Actions la RFEVB no respondió, y
  // como el resto sí, se guardó un JSON sin los dos equipos nacionales. Encima
  // al desaparecer estos volvió a colarse la copia atrasada que la FVBPA tiene
  // de la liga nacional. Un fallo de red de una fuente no puede empeorar los
  // datos que ya estaban bien: mejor dejar los de ayer y que el workflow falle
  // a la vista.
  const porFuente = (lista) => {
    const n = {}
    for (const e of lista) n[e.ente] = (n[e.ente] ?? 0) + 1
    return n
  }
  const ahora = porFuente(equipos)

  let previo = null
  try {
    previo = JSON.parse(await readFile(DESTINO, 'utf-8'))
  } catch {
    // no había JSON previo: primera ejecución, nada que comparar
  }

  if (previo?.equipos?.length) {
    const antes = porFuente(previo.equipos)
    const caidas = Object.keys(antes).filter((f) => !ahora[f])
    if (caidas.length) {
      log(`\n!! ${caidas.join(' y ')} no ha devuelto ni un equipo, y antes sí tenía.`)
      log('   Se conserva el JSON anterior para no empeorar los datos.')
      log(`   Antes: ${JSON.stringify(antes)} · ahora: ${JSON.stringify(ahora)}`)
      process.exitCode = 1
      return
    }
  }

  const salida = {
    generado: new Date().toISOString(),
    temporada: t.etiqueta,
    fuentes: {
      FVBPA: 'https://www.fvbpa.com',
      RFEVB: 'https://esvoley.es',
    },
    equipos,
  }

  if (seco) {
    log('\n--seco: no se escribe nada.')
    for (const e of equipos) {
      log(`  ${e.nombre.padEnd(26)} ${String(e.partidos.length).padStart(3)} part.  ` +
          `${e.clasificacion.length ? `clas. ${e.clasificacion.find((r) => r.yo)?.pos ?? '?'}º` : 'sin clasificación'}`)
    }
    return
  }

  // Y si el recuento cae en picado sin que ninguna fuente se haya ido del todo,
  // tampoco: más vale enseñar los datos de ayer que media web vacía.
  if (previo?.equipos?.length > equipos.length * 2) {
    log(`\n!! Antes había ${previo.equipos.length} equipos y ahora solo ${equipos.length}.`)
    log('   Parece un fallo de las federaciones: se conserva el JSON anterior.')
    process.exitCode = 1
    return
  }

  await writeFile(DESTINO, `${JSON.stringify(salida, null, 1)}\n`, 'utf-8')
  log(`\nEscrito ${DESTINO}`)
}

main().catch((e) => {
  console.error('\nError inesperado:', e)
  process.exitCode = 1
})

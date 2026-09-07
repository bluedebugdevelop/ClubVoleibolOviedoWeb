// Real Federación Española de Voleibol (esvoley.es)
// -----------------------------------------------------------------------------
// Cubre los equipos de categoría nacional: en 2026/27, Superliga Masculina 2
// (Grupo C) y Primera División Femenina (Grupo A).
//
//   https://esvoley.es/voleibol/competiciones-masculinas/superliga-masculina-2/grupo-c
//   https://esvoley.es/voleibol/competiciones-femeninas/primera-division-femenina/grupo-a
//
// Esas páginas no traen los datos en el HTML: montan la tabla en el navegador
// pidiéndolos a una API JSON, y lo único que llevan escrito es el id del grupo
// en un <input id="HiddenGrupoId">. Así que aquí se hace lo mismo:
//
//   página del grupo            → HiddenGrupoId (el id cambia cada temporada)
//   getJornadasCalendario       → jornadas y emparejamientos, SIN resultados
//   getClasificacionGrupo       → clasificación vigente
//   getPartidosByJornada        → resultados y parciales de una jornada
//
// El calendario completo se pide una sola vez por grupo y sirve para dos cosas:
// saber si el club juega ahí —y descartar el grupo sin gastar 22 peticiones si
// no— y quedarse con los nombres de equipo bien escritos, porque la
// clasificación y los resultados los devuelven EN MAYÚSCULAS.
//
// Nada de ids fijados: los grupos se descubren del menú de esvoley.es, que
// enlaza todos los de las competiciones sénior nacionales. Al cambiar de
// temporada, o si el club sube o baja de categoría, se le encuentra solo.

import { bajar, bajarJson } from '../lib/http.mjs'
import { texto, todos } from '../lib/html.mjs'
import { esDelClub, esRivalReal } from './fvbpa.mjs'

const WEB = 'https://esvoley.es'
const API = 'https://rfevb.fontventa.com/api/competiciones'

// Página desde la que se lee el menú. Vale cualquiera del sitio —el menú es el
// mismo en todas—, pero se usa la del primer equipo para que, si esvoley
// reorganizara el resto, al menos esta siga estando.
const SEMILLA = `${WEB}/voleibol/competiciones-masculinas/superliga-masculina-2/grupo-c/`

// Si el menú cambiara de forma y el descubrimiento no encontrara nada, se
// prueban al menos los dos grupos donde juega el club hoy. Es una red de
// seguridad, no la lista buena: lo normal es que el menú responda.
const RESPALDO = [
  '/voleibol/competiciones-masculinas/superliga-masculina-2/grupo-c',
  '/voleibol/competiciones-femeninas/primera-division-femenina/grupo-a',
]

/** Una llamada a la API de competiciones. Devuelve `content`, o null. */
async function api(ruta, params) {
  const url = `${API}/${ruta}?${new URLSearchParams(params)}`
  const r = await bajarJson(url, { referer: `${WEB}/` })
  // el mismo error viaja como `Error.HasError` o como `error.hasError` según
  // el endpoint que responda
  const err = r?.Error ?? r?.error
  if (err?.HasError ?? err?.hasError) {
    throw new Error(err.Message ?? err.message ?? 'error de la API')
  }
  return r?.content ?? null
}

/** Espacios de sobra fuera: la API los deja pegados a muchos nombres. */
const limpio = (s) => String(s ?? '').replace(/\s+/g, ' ').trim()

/** Clave para casar el mismo equipo escrito en mayúsculas y en minúsculas. */
const clave = (s) => limpio(s).toUpperCase()

const num = (v) => (v == null || v === '' ? null : Number(v))

const MENORES = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y', 'e', 'en'])

/**
 * Pabellones: unos vienen escritos como personas ("Polideportivo José Manuel
 * Fuente") y otros A GRITOS ("PABELLÓN MUNICIPAL KIKE BLÁS"), según quién los
 * diera de alta. Solo se retocan los que están enteros en mayúsculas, para no
 * estropear el que ya viene bien.
 */
function pabellon(s) {
  const n = limpio(s)
  if (!n || /[a-záéíóúüñ]/.test(n)) return n
  return n
    .split(' ')
    .map((w, i) => {
      // las siglas se quedan como están: "C.D.M." no es "C.d.m.", ni "CV" "Cv"
      if (w.includes('.') || (w.length <= 3 && !MENORES.has(w.toLowerCase()))) return w
      const b = w.toLowerCase()
      return i > 0 && MENORES.has(b) ? b : b.charAt(0).toUpperCase() + b.slice(1)
    })
    .join(' ')
}

/**
 * Grupos de las competiciones sénior nacionales, sacados del menú de esvoley.
 *
 * El menú enlaza todos los grupos de todas las categorías nacionales y, de
 * paso, lleva escrito el nombre bonito de cada competición ("Primera División
 * Femenina"), que la API solo da en mayúsculas y sin tildes.
 */
async function gruposNacionales(log) {
  let menu = ''
  try {
    menu = await bajar(SEMILLA)
  } catch (e) {
    log(`  ! no se pudo leer el menú de esvoley: ${e.message}`)
  }

  const RUTA = '\\/voleibol\\/competiciones-(?:masculinas|femeninas)\\/[a-z0-9-]+'

  // nombre presentable de cada competición
  const ligas = new Map()
  for (const m of todos(new RegExp(`href="(${RUTA})"[^>]*>([^<]{1,60})<`, 'g'), menu)) {
    const etiqueta = texto(m[2])
    // el menú repite el enlace de la competición como "Inicio" y como "Ver todo"
    if (!etiqueta || /^(inicio|ver todo)$/i.test(etiqueta)) continue
    if (!ligas.has(m[1])) ligas.set(m[1], etiqueta)
  }

  // un grupo por enlace; las ligas de grupo único cuelgan de "clasificacion"
  const enlaces = todos(
    new RegExp(`href="(${RUTA})\\/(grupo-[a-z0-9-]+|clasificacion)"[^>]*>([^<]{1,60})<`, 'g'),
    menu,
  ).map((m) => [`${m[1]}/${m[2]}`, m[1], texto(m[3])])

  for (const ruta of RESPALDO) {
    if (!enlaces.some(([r]) => r === ruta)) {
      enlaces.push([ruta, ruta.slice(0, ruta.lastIndexOf('/')), ''])
    }
  }

  const grupos = []
  const vistos = new Set()
  for (const [ruta, ligaRuta, etiqueta] of enlaces) {
    if (vistos.has(ruta)) continue
    vistos.add(ruta)
    grupos.push({
      liga: ligas.get(ligaRuta) ?? texto(ligaRuta.split('/').pop().replace(/-/g, ' ')),
      // "Clasificación" no es el nombre de un grupo: esas competiciones no los
      // tienen, van todas a una sola tabla
      grupo: /^grupo\b/i.test(etiqueta) ? etiqueta : 'Grupo único',
      genero: ligaRuta.includes('competiciones-femeninas') ? 'Femenino' : 'Masculino',
      url: `${WEB}${ruta}/`,
    })
  }
  return grupos
}

/** El id que la API usa para este grupo, leído de la página pública. */
async function idDeGrupo(url) {
  const pagina = await bajar(url)
  const id = /id="HiddenGrupoId"[^>]*value="(\d+)"/.exec(pagina)?.[1]
  return id && id !== '0' ? id : null
}

/** "03/10/2026" + "16:30" → { iso: '2026-10-03T16:30', hora: '16:30' } */
function fecha(dia, hora) {
  const d = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(limpio(dia))
  if (!d) return { iso: null, hora: null }
  const p = (n) => String(n).padStart(2, '0')

  // "0:00" es horario sin fijar, no un partido a medianoche (la FVBPA hace lo
  // mismo con "00:00"). Se deja el día y la hora en blanco.
  const h = /^(\d{1,2}):(\d{2})$/.exec(limpio(hora))
  const reloj = h && !(Number(h[1]) === 0 && h[2] === '00') ? `${p(h[1])}:${h[2]}` : null

  return { iso: `${d[3]}-${p(d[2])}-${p(d[1])}${reloj ? `T${reloj}` : ''}`, hora: reloj }
}

/** Parciales de un partido. Los sets no jugados vienen como 0-0: se saltan. */
function parciales(p) {
  const sets = []
  for (let i = 1; i <= 5; i++) {
    const l = Number(p[`puntos_local_juego_${i}`]) || 0
    const v = Number(p[`puntos_visitante_juego_${i}`]) || 0
    if (l === 0 && v === 0) continue
    sets.push(`${l}-${v}`)
  }
  return sets
}

/** Un partido de la API al formato del JSON del club. */
function aPartido(p, jornada, bonito) {
  const local = bonito(p.equipo_local)
  const visitante = bonito(p.equipo_visitante)
  if (!esRivalReal(local) || !esRivalReal(visitante)) return null

  const sl = Number(p.sets_local) || 0
  const sv = Number(p.sets_visitante) || 0
  // `finalizado` viene a true también en los descansos y en partidos aún sin
  // acta, así que lo que decide es que haya sets anotados.
  const jugado = sl + sv > 0
  const { iso, hora } = fecha(p.fecha, p.hora)

  return {
    id: `rfevb-${p.id}`,
    iso,
    hora,
    sede: pabellon(p.pabellon) || pabellon(p.pista) || null,
    local,
    visitante,
    setsLocal: jugado ? sl : null,
    setsVisitante: jugado ? sv : null,
    parciales: jugado ? parciales(p) : [],
    estado: p.esAplazado ? 'Aplazado' : jugado ? 'Finalizado' : null,
    jornada: num(jornada),
  }
}

/** La clasificación de la API al formato del JSON del club. */
function aClasificacion(filas, bonito) {
  return (filas ?? [])
    .map((f) => {
      const equipo = bonito(f.nombre)
      if (!esRivalReal(equipo)) return null
      return {
        pos: Number(f.posicion),
        equipo,
        pts: num(f.puntos),
        pj: num(f.jugados),
        sf: num(f.sets_a_favor),
        sc: num(f.sets_en_contra),
        yo: esDelClub(equipo),
        // El escudo del club, que la API sirve aparte. Aquí solo se anota de
        // dónde bajarlo: `lib/escudos.mjs` lo cambia por la ruta del fichero ya
        // descargado en public/media/escudos.
        escudoUrl: limpio(f.imagen) || null,
      }
    })
    .filter(Boolean)
}

/**
 * Escudos de los equipos de un grupo: `{ 'CV Oviedo': 'https://…' }`.
 *
 * Lo usa `npm run escudos` para completar un JSON ya generado sin rescrapear la
 * temporada entera: una sola petición por grupo.
 */
export async function escudosDeGrupo(id) {
  let filas
  try {
    filas = await api('getClasificacionGrupo', { grupoId: id })
  } catch {
    return {}
  }
  const mapa = {}
  for (const f of filas ?? []) {
    const nombre = limpio(f.nombre)
    const imagen = limpio(f.imagen)
    if (nombre && imagen) mapa[clave(nombre)] = imagen
  }
  return mapa
}

/**
 * Recorre las competiciones nacionales y devuelve una entrada por cada grupo
 * donde juegue el club, con TODO el calendario y la clasificación vigente.
 */
export async function scrapeRfevb({ log = () => {} } = {}) {
  const salida = []
  const grupos = await gruposNacionales(log)
  log(`  RFEVB: ${grupos.length} grupos nacionales que revisar`)

  for (const { liga, grupo, genero, url } of grupos) {
    let id
    try {
      id = await idDeGrupo(url)
    } catch (e) {
      log(`  ! ${liga} ${grupo}: ${e.message}`)
      continue
    }
    if (!id) continue

    // Una sola petición decide si merece la pena seguir con este grupo, y de
    // paso trae los nombres de equipo bien escritos.
    let calendario
    try {
      calendario = await api('getJornadasCalendario', { grupoId: id })
    } catch (e) {
      log(`  ! ${liga} ${grupo} (id ${id}): ${e.message}`)
      continue
    }
    if (!Array.isArray(calendario) || !calendario.length) continue

    const nombres = new Map()
    for (const j of calendario) {
      for (const p of j.partidos ?? []) {
        for (const n of [p.equipo_local, p.equipo_visitante]) {
          if (!nombres.has(clave(n))) nombres.set(clave(n), limpio(n))
        }
      }
    }
    const bonito = (n) => nombres.get(clave(n)) ?? limpio(n)

    if (![...nombres.values()].some(esDelClub)) continue // el club no juega aquí

    let tabla = []
    try {
      tabla = aClasificacion(await api('getClasificacionGrupo', { grupoId: id }), bonito)
    } catch (e) {
      log(`  ! ${liga} ${grupo}: sin clasificación (${e.message})`)
    }

    const partidos = []
    for (const j of calendario) {
      let lista
      try {
        lista = await api('getPartidosByJornada', { jornadaId: j.id })
      } catch {
        // una jornada que falle no debe tumbar el grupo entero: se pierde su
        // resultado hasta la próxima pasada y el resto del calendario se queda
        continue
      }
      for (const p of lista ?? []) {
        const partido = aPartido(p, j.numero, bonito)
        if (partido) partidos.push(partido)
      }
    }

    const míos = partidos.filter((p) => esDelClub(p.local) || esDelClub(p.visitante))
    const equipoClub =
      tabla.find((f) => f.yo)?.equipo ??
      [...nombres.values()].find(esDelClub) ??
      'CV Oviedo'

    salida.push({
      fuente: 'RFEVB',
      ente: 'RFEVB',
      categoria: 'Sénior',
      genero,
      division: liga,
      grupo,
      equipoClub,
      url,
      idGrupo: id,
      // solo los partidos del club: el grupo entero no interesa en la web
      partidos: míos.map((p) => ({ ...p, fase: grupo })),
      clasificacion: tabla,
    })
    log(`    · ${liga} ${grupo} (id ${id}) — ${equipoClub}: ${míos.length} partidos`)
  }

  return salida
}

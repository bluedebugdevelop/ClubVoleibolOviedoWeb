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

const CRUDOS = Array.isArray(datos?.equipos) ? datos.equipos : []

export const hayDatosReales = CRUDOS.length > 0
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

// ---------------------------------------------------------------------------
// Ajustes de presentación
//
// El sénior masculino jugó 2025/26 en Primera División Nacional, pero la
// temporada que viene compite en Superliga 2. Los datos de la pasada están
// solo de prueba mientras las federaciones no publican la nueva, así que el
// equipo se enseña ya con el nombre y el rojo de la categoría en la que va a
// jugar (decisión de Adrián, 2026-07-29).
//
// El equipo se localiza por su competición, no por el nombre generado: cuando
// empiece la temporada, el scraper lo encontrará en la RFEVB, este apaño dejará
// de casar y el equipo pasará a llamarse Superliga 2 por la vía normal, sin
// tener que acordarse de venir a borrar nada.
// ---------------------------------------------------------------------------
const PRESENTACION = [
  {
    // vale tanto para la Primera División Masculina de la RFEVB (la fuente
    // buena) como para la copia de la FVBPA, por si algún día hay que tirar de
    // ella
    casa: (e) =>
      e.genero === 'Masculino' &&
      /primera\s+divisi[oó]n\s+(masculina|nacional)/i.test(e.division ?? ''),
    nombre: 'Superliga 2 Masculina',
    nacional: true,
    paleta: ROJO,
  },
]

/** Equipos ya con los ajustes de presentación aplicados. */
const EQUIPOS = CRUDOS.map((e) => {
  const ajuste = PRESENTACION.find((p) => p.casa(e))
  return {
    ...e,
    nombre: ajuste?.nombre ?? e.nombre,
    // se guarda de dónde salen de verdad los datos, para poder decirlo debajo
    // del titular de la clasificación sin fingir que son de otra competición
    competicionReal: e.division,
    ajustado: Boolean(ajuste),
    esNacional: ajuste?.nacional ?? e.ente === 'RFEVB',
    paleta: ajuste?.paleta ?? colores(e),
  }
})

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
    jornada: p.jornada ?? null,
    fase: p.fase ?? null,
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
    // Los dos equipos por separado y el pabellón. La página no los usa —le basta
    // con `rival` y `detalle`—, pero el JSON-LD de /calendario sí: un
    // SportsEvent tiene que decir quién juega contra quién y dónde.
    equipoLocal: p.local,
    equipoVisitante: p.visitante,
    sede: p.sede ?? null,
  }
}

/** Todos los partidos de todos los equipos, ya en formato de página. */
const TODOS_PARTIDOS = EQUIPOS.flatMap((e) => e.partidos.map((p) => aPartido(p, e)))

const porFecha = (a, b) => String(a.iso).localeCompare(String(b.iso))

/** "11 y 12 de abril" a partir de los partidos de un bloque. */
function etiquetaFechas(lista) {
  const dias = [...new Set(lista.map((p) => aFecha(p.iso)?.getDate()).filter(Boolean))]
  if (!dias.length) return 'fecha por confirmar'
  const mes = aFecha(lista[0].iso)?.getMonth() ?? 0
  const texto = dias.length > 1
    ? `${dias.slice(0, -1).join(', ')} y ${dias.at(-1)}`
    : `${dias[0]}`
  return `${texto} de ${MESES_LARGO[mes]}`
}

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
      lista.sort(porFecha)
      return { id: `s-${clave}`, clave, titulo: etiquetaFechas(lista), partidos: lista }
    })
    .sort((a, b) => a.clave.localeCompare(b.clave))
}

/**
 * Agrupa los partidos de UN equipo por jornada, en orden de calendario.
 *
 * Cuando se mira un equipo suelto interesa la temporada entera y ordenada, no
 * los últimos fines de semana: es la forma natural de repasar cómo ha ido.
 *
 * La jornada por sí sola no identifica un bloque: al unir la liga regular con
 * la fase final, la numeración vuelve a empezar por 1 y saldrían dos "Jornada
 * 1". Por eso la clave lleva también la fase, y esta se nombra cuando el equipo
 * ha jugado más de una.
 *
 * Se ordena por fase y, dentro de cada una, por número de jornada, NO por
 * fecha: en la cantera es normal adelantar o aplazar partidos, y ordenar por
 * fecha dejaba el selector con "Jornada 4, Jornada 11, Jornada 3…", que parece
 * roto. Los huecos que se ven (falta la 2, la 9…) son las jornadas en las que
 * el equipo descansaba.
 */
function agruparPorJornada(partidos) {
  const fases = new Set(partidos.map((p) => p.fase).filter(Boolean))
  const variasFases = fases.size > 1
  const grupos = new Map()

  for (const p of partidos) {
    const clave = `${p.fase ?? ''}|${p.jornada ?? ''}`
    if (!grupos.has(clave)) grupos.set(clave, [])
    grupos.get(clave).push(p)
  }

  // las fases se ordenan por cuándo empezaron: la liga regular antes que su
  // fase final, sin depender de cómo se llamen
  const inicioFase = new Map()
  for (const p of partidos) {
    const previo = inicioFase.get(p.fase)
    if (!previo || String(p.iso) < previo) inicioFase.set(p.fase, String(p.iso))
  }

  return [...grupos.values()]
    .map((lista) => {
      lista.sort(porFecha)
      const { jornada, fase } = lista[0]
      const nombre = jornada != null ? `Jornada ${jornada}` : 'Otros partidos'
      const etiqueta = variasFases && fase ? `${fase} · ${nombre}` : nombre
      return {
        id: `b-${fase ?? 'x'}-${jornada ?? 'x'}`.replace(/\s+/g, '_'),
        jornada,
        fase,
        etiqueta,
        titulo: `${etiqueta} · ${etiquetaFechas(lista)}`,
        partidos: lista,
      }
    })
    .sort((a, b) => {
      const fa = inicioFase.get(a.fase) ?? ''
      const fb = inicioFase.get(b.fase) ?? ''
      if (fa !== fb) return fa.localeCompare(fb)
      // sin número de jornada, al final
      if (a.jornada == null) return 1
      if (b.jornada == null) return -1
      return a.jornada - b.jornada
    })
}

const HOY = new Date()
HOY.setHours(0, 0, 0, 0)

/**
 * Bloques que ve la página: primero lo que viene (más cercano arriba) y después
 * lo ya jugado (más reciente arriba). Se limita para no volcar la temporada
 * entera de doce equipos de golpe.
 */
function bloques(lista) {
  return [
    ...agrupar(lista.filter((p) => { const d = aFecha(p.iso); return d && d >= HOY }))
      .slice(0, 3)
      .map((b, i) => ({
        ...b,
        titulo: i === 0 ? `Próximos partidos · ${b.titulo}` : `Jornada · ${b.titulo}`,
      })),
    ...agrupar(lista.filter((p) => { const d = aFecha(p.iso); return d && d < HOY }))
      .reverse()
      .slice(0, 4)
      .map((b) => ({ ...b, titulo: `Jugado · ${b.titulo}` })),
  ]
}

export const jornadas = hayDatosReales ? bloques(TODOS_PARTIDOS) : jornadasMuestra

/**
 * Los partidos que aún no se han jugado, del más cercano al más lejano.
 *
 * Solo lo usa el JSON-LD de `Calendario.jsx`: Google entiende un partido futuro
 * como un evento y puede enseñarlo con su fecha en los resultados, mientras que
 * uno ya jugado no le sirve de nada. Se corta en doce para no volcar la
 * temporada entera de doce equipos dentro del <head>.
 *
 * NO BASTA CON MIRAR LA FECHA. Las federaciones publican el calendario sin año
 * y `scrape.mjs` le pone el de la temporada que toca por el mes de hoy: en
 * agosto de 2026, los partidos de la temporada PASADA salieron fechados en
 * octubre de 2026 y en 2027, con su resultado final ya puesto. Eran 150, y
 * declararlos como eventos era anunciarle a Google partidos que ya se jugaron.
 *
 * Por eso el filtro exige las dos cosas: fecha por venir Y sin resultado. Un
 * partido futuro con marcador es un dato equivocado, no un evento. Mientras la
 * FVBPA y la RFEVB no publiquen el calendario nuevo, esta lista está vacía y la
 * página no declara ningún evento, que es exactamente lo que debe pasar.
 */
export const proximosPartidos = hayDatosReales
  ? [
      // El mismo partido llega dos veces cuando lo publican las dos
      // competiciones en las que aparece un equipo, y comparte `id`. Sin quitar
      // el repetido, Google vería dos eventos idénticos el mismo día.
      ...new Map(
        TODOS_PARTIDOS
          .filter((p) => {
            if (p.resultado) return false
            const d = aFecha(p.iso)
            return d && d >= HOY
          })
          .sort(porFecha)
          .map((p) => [p.id, p]),
      ).values(),
    ].slice(0, 12)
  : []

/** Partidos de un equipo (o de todo el club si no se pasa ninguno). */
const partidosDe = (equipo) =>
  equipo ? TODOS_PARTIDOS.filter((p) => p.equipo === equipo) : TODOS_PARTIDOS

/**
 * Reparte los partidos de un equipo entre ida y vuelta.
 *
 * En una liga a doble vuelta la ida es la primera mitad de las jornadas: con 22
 * jornadas, de la 1 a la 11. La cuenta se hace sobre la fase con más partidos
 * (la liga regular), y todo lo que venga después —segunda vuelta, fases
 * finales, partidos sin jornada— cae en la vuelta, que es donde el calendario
 * lo coloca.
 */
function mitad(partido, corte, faseRegular) {
  if (partido.fase !== faseRegular || partido.jornada == null) return 'vuelta'
  return partido.jornada <= corte ? 'ida' : 'vuelta'
}

function reparto(equipo) {
  const lista = partidosDe(equipo)
  if (!lista.length) return null

  const porFase = new Map()
  for (const p of lista) porFase.set(p.fase, (porFase.get(p.fase) ?? 0) + 1)
  const faseRegular = [...porFase.entries()].sort((a, b) => b[1] - a[1])[0][0]

  const jornadas = lista
    .filter((p) => p.fase === faseRegular && p.jornada != null)
    .map((p) => p.jornada)
  if (!jornadas.length) return null

  const corte = Math.ceil(Math.max(...jornadas) / 2)
  return { corte, faseRegular }
}

/**
 * Mitades con partidos de un equipo: `[{ id, etiqueta, n }]`.
 * Vacío si no tiene sentido separarlas (no hay partidos en las dos).
 */
export function mitadesDe(equipo) {
  if (!hayDatosReales || !equipo) return []
  const r = reparto(equipo)
  if (!r) return []

  const lista = partidosDe(equipo)
  const ida = lista.filter((p) => mitad(p, r.corte, r.faseRegular) === 'ida').length
  const vuelta = lista.length - ida
  if (!ida || !vuelta) return []

  return [
    { id: 'ida', etiqueta: 'Ida', n: ida },
    { id: 'vuelta', etiqueta: 'Vuelta', n: vuelta },
  ]
}

/**
 * Bloques que pinta la página.
 *
 * - Sin equipo: los últimos fines de semana de todo el club. Agrupar por
 *   jornada no valdría aquí, porque la jornada 5 de cada competición cae en
 *   fechas distintas.
 * - Con equipo: la temporada COMPLETA de ese equipo, jornada a jornada. Antes
 *   se reutilizaba la vista por fines de semana y se quedaba en los últimos
 *   cinco partidos; al mirar un equipo se quiere ver todo lo que lleva jugado.
 * - Con equipo y mitad ('ida' o 'vuelta'): solo esa parte de la temporada.
 *
 * Se agrupa DESPUÉS de filtrar, no antes: cada equipo termina su temporada
 * cuando termina, y si se agrupara primero sobre el club entero, al elegir uno
 * que acabó antes que el resto no saldría ni un partido.
 */
export function bloquesDe(equipo, parte = null) {
  if (!hayDatosReales) {
    return jornadasMuestra
      .map((j) => ({
        ...j,
        partidos: j.partidos.filter((p) => !equipo || p.equipo === equipo || p.equipo.includes(equipo)),
      }))
      .filter((j) => j.partidos.length > 0)
  }

  if (!equipo) return bloques(TODOS_PARTIDOS)

  let lista = partidosDe(equipo)
  const r = parte ? reparto(equipo) : null
  if (r) lista = lista.filter((p) => mitad(p, r.corte, r.faseRegular) === parte)

  return agruparPorJornada(lista)
}

export const competiciones = hayDatosReales
  ? Object.fromEntries(
      EQUIPOS.map((e) => [
        e.nombre,
        {
          // en los equipos ajustados el titular es la categoría en la que van a
          // jugar, y debajo se dice de qué competición salen los datos
          liga: e.ajustado ? e.nombre : e.division || e.grupo,
          grupo: e.ajustado ? e.competicionReal : e.grupo || '',
          ente: e.ente,
          nacional: e.esNacional,
          url: e.url,
          ...e.paleta,
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
  ? EQUIPOS.filter((e) => e.esNacional && e.clasificacion?.length).map((e) => e.nombre)
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
    'Superliga 2 Masculina',
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

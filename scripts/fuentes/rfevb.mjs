// Real Federación Española de Voleibol (esvoley.es + intranet.rfevb.com)
// -----------------------------------------------------------------------------
// Cubre los dos equipos de categoría nacional: Superliga Masculina 2 y Primera
// División Femenina (la "Primera Nacional Femenina").
//
// esvoley.es no publica los datos en el HTML: cada página de grupo trae un
// script con `var auxCampeonato = '9975'` y pide los datos a la intranet:
//   …/webservices/rfevbcom/competiciones/jornadasCampeonato.php?IdCampeonato=N
//        → JSON [{Jornada, Fecha}] con todas las jornadas
//   …/rfevbcom/includes-html/competiciones/clasificacion321-conEncuentros-datos.php
//        ?IdCampeonato=N&Jornada=J
//        → HTML con los RESULTADOS de esa jornada y la CLASIFICACIÓN tras ella
//
// Se descubre el IdCampeonato leyendo la página pública, en vez de fijarlo, para
// que al cambiar de temporada (y de id) no haya que tocar nada.
//
// CUIDADO: la intranet declara `charset=UTF-8` pero sirve ISO-8859-1. Ver
// lib/http.mjs — por eso estas llamadas pasan charset: 'latin1'.

import { bajar } from '../lib/http.mjs'
import { texto, todos, filas } from '../lib/html.mjs'
import { esDelClub, esRivalReal } from './fvbpa.mjs'

const WS = 'https://intranet.rfevb.com/webservices/rfevbcom/competiciones/jornadasCampeonato.php'
const DATOS =
  'https://intranet.rfevb.com/rfevbcom/includes-html/competiciones/clasificacion321-conEncuentros-datos.php'
const REF = 'https://esvoley.es/'

// Grupos donde puede estar el club. Se prueban todos y se conservan solo
// aquellos donde aparece de verdad, así que sobra con que la lista sea amplia.
export const GRUPOS_NACIONALES = [
  ['Superliga Masculina 2', 'Grupo A', 'https://esvoley.es/voleibol/competiciones-masculinas/superliga-masculina-2/grupo-a/'],
  ['Superliga Masculina 2', 'Grupo B', 'https://esvoley.es/voleibol/competiciones-masculinas/superliga-masculina-2/grupo-b/'],
  ['Superliga Masculina 2', 'Grupo C', 'https://esvoley.es/voleibol/competiciones-masculinas/superliga-masculina-2/grupo-c/'],
  ['Primera División Femenina', 'Grupo A', 'https://esvoley.es/voleibol/competiciones-femeninas/primera-division-femenina/grupo-a/'],
  ['Primera División Femenina', 'Grupo B', 'https://esvoley.es/voleibol/competiciones-femeninas/primera-division-femenina/grupo-b/'],
  ['Primera División Femenina', 'Grupo C (asc.)', 'https://esvoley.es/voleibol/competiciones-femeninas/primera-division-femenina/grupo-c-sub-ascenso/'],
  ['Primera División Femenina', 'Grupo C (desc.)', 'https://esvoley.es/voleibol/competiciones-femeninas/primera-division-femenina/grupo-c-sub-descenso/'],
  ['Primera División Femenina', 'Grupo D', 'https://esvoley.es/voleibol/competiciones-femeninas/primera-division-femenina/grupo-d/'],
  // Por si algún equipo acaba en Superliga 2 Femenina en vez de Primera
  ['Superliga 2 Femenina', 'Grupo A', 'https://esvoley.es/voleibol/competiciones-femeninas/superliga-2-femenina/grupo-a/'],
  ['Superliga 2 Femenina', 'Grupo B', 'https://esvoley.es/voleibol/competiciones-femeninas/superliga-2-femenina/grupo-b/'],
]

/** dd/mm/yy (HH:MM) → { iso, hora } */
function fecha(cadena) {
  const m = /(\d{2})\/(\d{2})\/(\d{2,4})(?:\s*\((\d{1,2}):(\d{2})\))?/.exec(cadena ?? '')
  if (!m) return { iso: null, hora: null }
  const anio = m[3].length === 2 ? `20${m[3]}` : m[3]
  const hora = m[4] ? `${m[4].padStart(2, '0')}:${m[5]}` : null
  return { iso: `${anio}-${m[2]}-${m[1]}` + (hora ? `T${hora}` : ''), hora }
}

/** Resultados (partidos) de una jornada. */
function partidosDeJornada(pagina, jornada) {
  const tabla = todos(/<table[\s\S]*?<\/table>/g, pagina)
    .map((m) => m[0])
    .find((t) => /RESULTADOS/i.test(texto(t)))
  if (!tabla) return []

  return filas(tabla)
    .map((c) => {
      if (c.length < 3) return null
      // "13. Getxo Etorki - CV Oviedo"
      const enfrentamiento = /^\s*(?:\d+\.\s*)?(.+?)\s+-\s+(.+?)\s*$/.exec(c[0])
      if (!enfrentamiento) return null
      const [, local, visitante] = enfrentamiento
      if (!esRivalReal(local) || !esRivalReal(visitante)) return null

      // "3 - 1 (25-16/23-25/25-23/25-12/0-0)"
      const marcador = /(\d+)\s*-\s*(\d+)\s*(?:\(([^)]*)\))?/.exec(c[2] ?? '')
      const jugado = Boolean(marcador) && (Number(marcador[1]) || Number(marcador[2]))
      const { iso, hora } = fecha(c[1])

      return {
        id: `rfevb-${jornada}-${local}-${visitante}`.replace(/\s+/g, '_'),
        iso,
        hora,
        sede: null,
        local: local.trim(),
        visitante: visitante.trim(),
        setsLocal: jugado ? Number(marcador[1]) : null,
        setsVisitante: jugado ? Number(marcador[2]) : null,
        parciales: jugado && marcador[3]
          ? marcador[3].split('/').map((s) => s.trim()).filter((s) => s && s !== '0-0')
          : [],
        estado: jugado ? 'Finalizado' : null,
        jornada: Number(jornada),
      }
    })
    .filter(Boolean)
}

/** Clasificación tras una jornada. */
function clasificacion(pagina) {
  const tabla = todos(/<table[\s\S]*?<\/table>/g, pagina)
    .map((m) => m[0])
    .find((t) => /CLASIFICACI/i.test(texto(t)))
  if (!tabla) return []

  return filas(tabla)
    .map((c) => {
      if (c.length < 5) return null
      // "1. Sestao" (el logo va como <img>, que texto() ya ha quitado)
      const m = /^\s*(\d+)\.\s*(.+?)\s*$/.exec(c[0] ?? '')
      if (!m) return null
      if (!esRivalReal(m[2])) return null
      const n = (i) => (c[i] == null || c[i] === '' ? null : Number(c[i]))
      return {
        pos: Number(m[1]),
        equipo: m[2],
        pts: n(1),
        pj: n(2),
        sf: n(7),
        sc: n(8),
        yo: esDelClub(m[2]),
      }
    })
    .filter(Boolean)
}

/**
 * Recorre las competiciones nacionales y devuelve una entrada por cada grupo
 * donde juegue el club, con TODO el calendario y la clasificación vigente.
 */
export async function scrapeRfevb({ log = () => {} } = {}) {
  const salida = []

  for (const [liga, grupo, url] of GRUPOS_NACIONALES) {
    let id
    try {
      const pagina = await bajar(url, { charset: 'utf-8' })
      id = /auxCampeonato\s*=\s*'(\d+)'/.exec(pagina)?.[1]
    } catch (e) {
      log(`  ! ${liga} ${grupo}: ${e.message}`)
      continue
    }
    if (!id) continue

    let jornadas
    try {
      jornadas = JSON.parse(await bajar(`${WS}?IdCampeonato=${id}`, { referer: REF }))
    } catch {
      continue
    }
    if (!Array.isArray(jornadas) || !jornadas.length) continue

    const partidos = []
    let tabla = []

    for (const { Jornada } of jornadas) {
      let pagina
      try {
        pagina = await bajar(`${DATOS}?IdCampeonato=${id}&Jornada=${Jornada}`, {
          charset: 'latin1', // la intranet miente en la cabecera; ver lib/http.mjs
          referer: REF,
        })
      } catch {
        continue
      }
      partidos.push(...partidosDeJornada(pagina, Jornada))
      // nos quedamos con la última clasificación que traiga datos: es la vigente
      const t = clasificacion(pagina)
      if (t.length) tabla = t
    }

    if (!tabla.some((f) => f.yo) && !partidos.some((p) => esDelClub(p.local) || esDelClub(p.visitante))) {
      continue // el club no juega en este grupo
    }

    const equipoClub =
      tabla.find((f) => f.yo)?.equipo ??
      partidos.map((p) => [p.local, p.visitante]).flat().find(esDelClub) ??
      'CV Oviedo'

    salida.push({
      fuente: 'RFEVB',
      ente: 'RFEVB',
      categoria: 'Sénior',
      genero: liga.toLowerCase().includes('femenina') ? 'Femenino' : 'Masculino',
      division: liga,
      grupo,
      equipoClub,
      url,
      idCampeonato: id,
      // solo los partidos del club: el grupo entero no interesa en la web
      partidos: partidos
        .filter((p) => esDelClub(p.local) || esDelClub(p.visitante))
        .map((p) => ({ ...p, fase: grupo })),
      clasificacion: tabla,
    })
    log(`    · ${liga} ${grupo} (id ${id}) — ${equipoClub}: ${salida.at(-1).partidos.length} partidos`)
  }

  return salida
}

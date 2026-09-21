// ==========================================================================
// La competición, leída de Postgres y devuelta con la forma de siempre.
//
// La app ya sabe leer `/api/competicion`: `clave`, `equipoClub`, `partidos`
// con su `iso`, `clasificacion` con su `yo`. Cambiar ESE contrato obligaría a
// publicar una versión nueva en las dos tiendas y a esperar a que la instalara
// todo el club. Así que lo que cambia es de dónde salen los datos, no cómo se
// ven: la app se pone al día sin enterarse.
//
// Por eso aquí se reconstruye el formato del JSON en vez de devolver las filas
// tal cual. Las columnas de la base están normalizadas —`cuando` es un
// timestamp, `hora_confirmada` es un booleano— y el JSON las tenía fundidas en
// una cadena `iso` donde «sin hora» se codificaba como medianoche. Se vuelve a
// esa forma a conciencia, en un solo sitio, y se documenta como lo que es:
// compatibilidad, no diseño.
// ==========================================================================

import { filas } from './_bd.js'

const dos = (n) => String(n).padStart(2, '0')

/**
 * Un timestamp de la base al 'YYYY-MM-DDTHH:MM' que espera la app.
 *
 * En hora local del servidor, como lo escribió el raspador. Sin hora
 * confirmada se devuelve solo el día: la app ya sabe leer eso como «hora por
 * confirmar», y es lo que evita pintar partidos de madrugada.
 */
function aIso(fecha, horaConfirmada) {
  const f = new Date(fecha)
  const dia = `${f.getFullYear()}-${dos(f.getMonth() + 1)}-${dos(f.getDate())}`
  return horaConfirmada ? `${dia}T${dos(f.getHours())}:${dos(f.getMinutes())}` : dia
}

const aPartido = (p) => ({
  id: String(p.id).includes(':') ? String(p.id).split(':').slice(1).join(':') : String(p.id),
  iso: aIso(p.cuando, p.hora_confirmada),
  hora: p.hora_confirmada ? aIso(p.cuando, true).slice(11) : null,
  sede: p.sede,
  local: p.local,
  visitante: p.visitante,
  setsLocal: p.sets_local,
  setsVisitante: p.sets_visitante,
  parciales: p.parciales ?? [],
  estado: p.estado,
  jornada: p.jornada,
  fase: p.fase,
})

const aFila = (f) => ({
  pos: f.pos,
  equipo: f.equipo,
  pts: f.pts,
  pj: f.pj,
  sf: f.sf,
  sc: f.sc,
  yo: f.es_club,
})

const aEquipo = (c, partidos, clasificacion) => ({
  clave: c.clave,
  nombre: c.nombre,
  categoria: c.categoria,
  genero: c.genero,
  division: c.division,
  grupo: c.grupo,
  ente: c.ente,
  equipoClub: c.equipo_club,
  url: c.url,
  partidos,
  clasificacion,
})

/** La cabecera que acompaña a cualquier respuesta. */
async function cabecera() {
  const c = await filas(
    `SELECT max(actualizado_en) AS generado, min(temporada) AS temporada FROM competiciones`,
  )
  return {
    generado: c[0]?.generado ? new Date(c[0].generado).toISOString() : null,
    temporada: c[0]?.temporada ?? null,
    fuentes: { FVBPA: 'https://www.fvbpa.com', RFEVB: 'https://esvoley.es' },
  }
}

/** ¿Hay algo que servir? Con la base vacía se cae al JSON del repositorio. */
export async function hayCompeticion() {
  const r = await filas('SELECT count(*)::int n FROM competiciones')
  return (r[0]?.n ?? 0) > 0
}

export async function unaCompeticion(clave) {
  const c = await filas('SELECT * FROM competiciones WHERE clave = $1', [clave])
  if (c.length === 0) return null

  const partidos = await filas(
    'SELECT * FROM partidos WHERE competicion = $1 ORDER BY cuando, id',
    [clave],
  )
  const tabla = await filas(
    'SELECT * FROM clasificacion WHERE competicion = $1 ORDER BY pos',
    [clave],
  )

  return {
    ...(await cabecera()),
    equipo: aEquipo(c[0], partidos.map(aPartido), tabla.map(aFila)),
  }
}

/** El índice: sin partidos, solo cuántos hay. Es lo que pide el panel de altas. */
export async function indiceCompeticion() {
  const c = await filas(`
    SELECT c.*, (SELECT count(*)::int FROM partidos p WHERE p.competicion = c.clave) AS cuantos
    FROM competiciones c ORDER BY c.ente, c.nombre`)

  return {
    ...(await cabecera()),
    equipos: c.map((x) => ({
      clave: x.clave,
      nombre: x.nombre,
      categoria: x.categoria,
      genero: x.genero,
      division: x.division,
      grupo: x.grupo,
      ente: x.ente,
      url: x.url,
      partidos: x.cuantos,
    })),
  }
}

/** Todo, para quien lo quiera entero. */
export async function todaLaCompeticion() {
  const c = await filas('SELECT * FROM competiciones ORDER BY ente, nombre')
  const partidos = await filas('SELECT * FROM partidos ORDER BY cuando, id')
  const tabla = await filas('SELECT * FROM clasificacion ORDER BY competicion, pos')

  // Se agrupa en memoria en vez de con una consulta por competición: son dos
  // competiciones y cuarenta y cuatro partidos, y así es UNA ida a la base.
  const porClave = (lista) => {
    const m = new Map()
    for (const x of lista) {
      if (!m.has(x.competicion)) m.set(x.competicion, [])
      m.get(x.competicion).push(x)
    }
    return m
  }
  const ps = porClave(partidos)
  const ts = porClave(tabla)

  return {
    ...(await cabecera()),
    equipos: c.map((x) =>
      aEquipo(x, (ps.get(x.clave) ?? []).map(aPartido), (ts.get(x.clave) ?? []).map(aFila)),
    ),
  }
}

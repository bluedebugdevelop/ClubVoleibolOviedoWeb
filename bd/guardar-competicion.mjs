// ==========================================================================
// Deja en Postgres lo que ha traído el raspador.
//
// Se llama desde `scripts/scrape.mjs` con exactamente el mismo objeto que se
// escribe en `src/data/competicion.json`. Los dos destinos conviven a
// propósito durante la mudanza:
//
//   · El JSON sigue existiendo porque la web lo lleva DENTRO del bundle y
//     seguirá pintando el calendario aunque la base esté caída.
//   · La base es lo que lee la app, y lo que deja de exigir un despliegue para
//     que un cambio de horario de la federación llegue al móvil de nadie.
//
// Cuando la web también lea de la base, el JSON pasa a ser solo la red de
// seguridad y se puede dejar de commitear.
//
// POR QUÉ SE BORRA Y SE VUELVE A METER
// Los partidos y la clasificación de una competición se reemplazan enteros en
// cada pasada, dentro de una transacción. Es lo correcto aquí y no una
// pereza: la federación no manda «cambios», manda el estado actual, y un
// partido puede desaparecer de su calendario (una jornada que se reorganiza,
// un equipo que se retira). Yendo fila a fila con UPSERT esos partidos
// fantasma se quedarían para siempre, y son justo los que harían que alguien
// se presentara a un partido que ya no existe.
//
// Las COMPETICIONES no se borran: un equipo del club apunta a su clave, y
// borrarla le dejaría sin calendario cada vez que corre el raspador.
// ==========================================================================

import { enTransaccion, hayBd } from '../api/_bd.js'

/** 'YYYY-MM-DDTHH:MM' → Date en hora local, como hace la app. */
function aFecha(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(String(iso ?? ''))
  if (!m) return null
  return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] ?? 0), +(m[5] ?? 0))
}

/**
 * ¿Trae hora de verdad?
 *
 * Las dos federaciones publican el partido antes de fijar la hora y entonces
 * mandan medianoche. Pintarlo como «00:00» hace pensar que se juega de
 * madrugada, así que lo que se guarda es que la hora NO está confirmada.
 */
const horaConfirmada = (iso) => /T\d{2}:\d{2}/.test(String(iso ?? '')) && !String(iso).endsWith('T00:00')

export async function guardarCompeticion(salida) {
  if (!hayBd()) return { ok: false, motivo: 'sin DATABASE_URL' }

  const equipos = salida?.equipos ?? []
  if (equipos.length === 0) return { ok: false, motivo: 'el raspado no trae equipos' }

  let partidos = 0
  // Competiciones cuyo calendario se ha dejado como estaba: ver más abajo.
  const conservadas = []

  await enTransaccion(async (bd) => {
    const registro = await bd.query(
      'INSERT INTO raspados (competiciones) VALUES ($1) RETURNING id',
      [equipos.length],
    )
    const raspadoId = registro.rows[0].id

    for (const e of equipos) {
      await bd.query(
        `INSERT INTO competiciones (clave, nombre, categoria, genero, division, grupo,
                                    ente, url, equipo_club, temporada, actualizado_en)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, now())
         ON CONFLICT (clave) DO UPDATE SET
           nombre = EXCLUDED.nombre, categoria = EXCLUDED.categoria, genero = EXCLUDED.genero,
           division = EXCLUDED.division, grupo = EXCLUDED.grupo, ente = EXCLUDED.ente,
           url = EXCLUDED.url, equipo_club = EXCLUDED.equipo_club,
           temporada = EXCLUDED.temporada, actualizado_en = now()`,
        [e.clave, e.nombre, e.categoria, e.genero, e.division, e.grupo ?? null,
         e.ente, e.url ?? null, e.equipoClub, salida.temporada ?? ''],
      )

      /* Un raspado VACÍO no borra un calendario que sí estaba.

         Reemplazar entero es lo correcto cuando la federación manda datos;
         cuando manda cero partidos casi nunca significa «esta liga ya no
         tiene calendario», significa que la página estaba en obras, que el id
         del grupo ha cambiado de temporada o que contestó un error con un 200.
         Ya pasó una vez y dejó la competición nacional sin un solo partido.

         Así que si llega vacío y hay algo guardado, se conserva lo guardado y
         se anota. Un calendario de ayer es mucho mejor que ninguno: lo peor
         que hace es enseñar un horario viejo, mientras que quedarse sin nada
         borra el partido del sábado de la pantalla de todo el club. */
      const entrantes = (e.partidos ?? []).length
      if (entrantes === 0) {
        const previos = await bd.query(
          'SELECT count(*)::int n FROM partidos WHERE competicion = $1', [e.clave])
        if (previos.rows[0].n > 0) {
          conservadas.push({ clave: e.clave, partidos: previos.rows[0].n })
          continue
        }
      }

      await bd.query('DELETE FROM partidos WHERE competicion = $1', [e.clave])
      await bd.query('DELETE FROM clasificacion WHERE competicion = $1', [e.clave])

      for (const p of e.partidos ?? []) {
        const cuando = aFecha(p.iso)
        // Un partido sin fecha legible no se puede colocar en ningún
        // calendario; se descarta en vez de guardar una fila inútil.
        if (!cuando) continue
        await bd.query(
          `INSERT INTO partidos (id, competicion, jornada, fase, cuando, hora_confirmada,
                                 sede, local, visitante, sets_local, sets_visitante,
                                 parciales, estado, actualizado_en)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, now())`,
          // El id de la federación solo es único dentro de su competición: dos
          // ligas distintas repiten el 1. La clave va delante.
          [`${e.clave}:${p.id}`, e.clave, p.jornada ?? null, p.fase ?? null,
           cuando, horaConfirmada(p.iso), p.sede ?? null, p.local, p.visitante,
           p.setsLocal ?? null, p.setsVisitante ?? null, p.parciales ?? [], p.estado ?? null],
        )
        partidos++
      }

      for (const f of e.clasificacion ?? []) {
        await bd.query(
          `INSERT INTO clasificacion (competicion, pos, equipo, pts, pj, sf, sc, es_club)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [e.clave, f.pos, f.equipo, f.pts ?? 0, f.pj ?? 0, f.sf ?? 0, f.sc ?? 0, f.yo === true],
        )
      }
    }

    await bd.query(
      `UPDATE raspados SET terminado_en = now(), ok = true, partidos = $2,
         detalle = $3 WHERE id = $1`,
      [raspadoId, partidos,
       JSON.stringify({
         temporada: salida.temporada,
         claves: equipos.map((e) => e.clave),
         conservadas,
       })],
    )
  })

  return { ok: true, competiciones: equipos.length, partidos, conservadas }
}

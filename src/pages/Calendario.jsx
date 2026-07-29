import { useState } from 'react'
import PageHead from '../components/PageHead'
import Sponsors from '../components/Sponsors'
import { equiposFiltro, jornadas, competiciones, clasificaciones, retransmisiones } from '../data/contenido'

const TODOS = 'Todos los equipos'

/* con "Todos los equipos" no hay una sola clasificación que enseñar, así que
   se enseñan las dos nacionales, que son las que siguen la mayoría */
const NACIONALES = ['Superliga 2 Masculino', 'Primera Nacional Femenina']

function coincide(equipo, filtro) {
  if (filtro === TODOS) return true
  return equipo === filtro || equipo.includes(filtro)
}

/* los tres colores de la liga viajan como custom properties: así el CSS pinta
   badge, cabecera de tabla y fila del club sin saber de qué competición se
   trata. Ver `competiciones` en contenido.js para el origen de los colores. */
function tokens(equipo) {
  const c = competiciones[equipo]
  if (!c) return undefined
  return {
    '--liga': c.color,
    '--liga-sobre': c.sobre,
    '--liga-tinte': c.tinte,
    '--liga-tinta': c.tinta ?? c.color,
  }
}

/* en la barra de filtros solo se tiñen las dos competiciones nacionales; los
   equipos de cantera se quedan con el azul marino de siempre al pulsarlos */
function esNacional(equipo) {
  return Boolean(competiciones[equipo]?.nacional)
}

function Clasificacion({ equipo }) {
  const comp = competiciones[equipo]
  const filas = clasificaciones[equipo]
  if (!comp || !filas) return null

  return (
    <div className="standing" style={tokens(equipo)}>
      <div className="standing-head">
        <b>{comp.liga}</b>
        <span>{comp.grupo} · {comp.ente}</span>
      </div>
      <table className="table liga">
        <thead>
          <tr>
            <th className="n">#</th>
            <th>{equipo}</th>
            <th className="n">PJ</th>
            <th className="n">Pts</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr className={f.yo ? 'me' : undefined} key={f.pos}>
              <td className="pos n">{f.pos}</td>
              <td>{f.equipo}</td>
              <td className="n">{f.pj}</td>
              <td className="n">{f.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Calendario() {
  const [filtro, setFiltro] = useState(TODOS)

  const jornadasFiltradas = jornadas
    .map((j) => ({ ...j, partidos: j.partidos.filter((p) => coincide(p.equipo, filtro)) }))
    .filter((j) => j.partidos.length > 0)

  const tablas = filtro === TODOS ? NACIONALES : [filtro]

  return (
    <>
      <PageHead
        crumbs={<>Inicio · Calendario y resultados</>}
        kicker="Temporada 2026/27"
        title="Calendario y resultados"
        sub="Todos los partidos del club, equipo por equipo. Los que se retransmiten llevan el enlace al canal de YouTube."
        bg="/media/pista-azul.jpg"
        foco="center 62%"
      />

      <section className="sec">
        <div className="filters">
          {equiposFiltro.map((eq) => (
            <button
              key={eq}
              type="button"
              className={esNacional(eq) ? 'liga' : undefined}
              aria-pressed={filtro === eq}
              style={esNacional(eq) ? tokens(eq) : undefined}
              onClick={() => setFiltro(eq)}
            >
              {eq}
            </button>
          ))}
        </div>

        <div className="twocol">
          <div>
            {jornadasFiltradas.length === 0 && (
              <p style={{ color: 'var(--dim)' }}>No hay partidos para este equipo en las últimas jornadas.</p>
            )}
            {jornadasFiltradas.map((j) => (
              <div className="round" key={j.id}>
                <h3>{j.titulo}</h3>
                <div className="fixtures wide">
                  {j.partidos.map((p) => (
                    <div className="fix" key={p.id} style={tokens(p.equipo)}>
                      <span className="d">
                        {p.diaSemana}
                        <b>{p.dia}</b>
                        {p.mes}
                      </span>
                      <span className="who">{p.equipo}</span>
                      <span className="t">
                        {p.rival}
                        <span>{p.detalle}</span>
                      </span>
                      {p.resultado ? (
                        <span className={`r ${p.tipo}`}>{p.resultado}</span>
                      ) : (
                        <span>
                          <span className="r next">{p.local ? 'Local' : 'Visitante'}</span>
                          {p.retransmite && <span className="r tv">Se retransmite ▸</span>}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <p style={{ fontSize: 13.5, color: 'var(--dim)' }}>
              Resultados, rivales y fechas son de muestra, a la espera de los datos reales de cada equipo.
            </p>
          </div>

          <div>
            <div className="sechead" style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 24 }}>{tablas.length > 1 ? 'Clasificaciones' : 'Clasificación'}</h2>
            </div>

            {tablas.map((eq) => (
              <Clasificacion key={eq} equipo={eq} />
            ))}

            <div className="sechead" style={{ margin: '34px 0 16px' }}>
              <h2 style={{ fontSize: 24 }}>Retransmisiones</h2>
            </div>
            <div className="streams">
              {/* PENDIENTE: enlaces reales a los vídeos de YouTube */}
              {retransmisiones.map((r) => (
                <a className="stream" href="#" key={r.titulo}>
                  <span className="play">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  <span>
                    <b>{r.titulo}</b>
                    <span>{r.detalle}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Sponsors />
    </>
  )
}

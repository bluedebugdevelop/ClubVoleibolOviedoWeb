import { Link, useParams } from 'react-router-dom'
import PageHead from '../components/PageHead'
import SectionHead from '../components/SectionHead'
import JoinCta from '../components/JoinCta'
import Sponsors from '../components/Sponsors'
import NoEncontrado from './NoEncontrado'
import { equipos } from '../data/contenido'
import { fixturesDeFicha } from '../data/competicion'

export default function Equipo() {
  const { slug } = useParams()
  const equipo = equipos[slug]

  if (!equipo) return <NoEncontrado />

  return (
    <>
      <PageHead
        crumbs={
          <>
            <Link to="/">Inicio</Link> · <Link to="/">Equipos</Link> · {equipo.crumb}
          </>
        }
        kicker={equipo.kicker}
        title={equipo.nombre}
        sub={equipo.sub}
        bg={equipo.headerImg}
        foco={equipo.headerFoco}
      />

      {/* La fila de cifras (jugadores · clasificación · victorias · puntos) se
          quitó a propósito el 2026-07-29: los datos siguen en `equipo.stats`
          por si vuelve, pero ninguna página los pinta. */}

      <section className="sec">
        <div className="layout">
          <div>
            <SectionHead title="Calendario y resultados" />
            <div className="fixtures">
              {/* datos reales de la federación; si aún no los hay, los de la ficha */}
              {fixturesDeFicha(slug, equipo.fixtures).map((f) => (
                <div className="fix" key={f.id}>
                  <span className="d">
                    {f.diaSemana}
                    <b>{f.dia}</b>
                    {f.mes}
                  </span>
                  <span className="t">
                    {f.rival}
                    <span>{f.detalle}</span>
                  </span>
                  {f.resultado ? (
                    <span className={`r ${f.tipo}`}>{f.resultado}</span>
                  ) : (
                    <span className="r next">Próximo</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="side">
            <h3>Cuerpo técnico</h3>
            <div className="staff">
              {equipo.staff.map((s) => (
                <div key={s.nombre}>
                  <span className="av">{s.iniciales}</span>
                  <span>
                    <b>{s.nombre}</b>
                    <i>{s.rol}</i>
                  </span>
                </div>
              ))}
            </div>
            <h3 style={{ borderTop: '1px solid var(--line)' }}>Datos</h3>
            {equipo.datos.map((d) => (
              <div className="row" key={d.label}>
                <span>{d.label}</span>
                <b>{d.valor}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="band">
        <section className="sec">
          <div className="sechead">
            <h2>Plantilla</h2>
            <span className="rule"></span>
            <span style={{ fontSize: 13, color: 'var(--dim)' }}>{equipo.squad.length} jugadores</span>
          </div>
          <div className="squad">
            {equipo.squad.map((p) => (
              <div className="pl" key={p.numero}>
                <div className="ph">
                  <span className="no">{p.numero}</span>
                  <span>?</span>
                </div>
                <b>{p.nombre}</b>
                <i>{p.posicion}</i>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 20, fontSize: 13.5, color: 'var(--dim)' }}>
            Los recuadros son marcadores: en cuanto haya fotos individuales de los jugadores, entran aquí sin tocar
            nada más.
          </p>
        </section>
      </div>

      <section className="sec">
        <SectionHead title="Galería" link="/noticias" linkText="Ver todas →" />
        <div className="gallery">
          {equipo.gallery.map((g) => (
            <div key={g.src}>
              <img src={g.src} alt={g.alt} />
            </div>
          ))}
        </div>
      </section>

      <JoinCta title={equipo.join.title} text={equipo.join.text} />

      <Sponsors />
    </>
  )
}

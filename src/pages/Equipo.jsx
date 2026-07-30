import { Link, useParams } from 'react-router-dom'
import PageHead from '../components/PageHead'
import SectionHead from '../components/SectionHead'
import JoinCta from '../components/JoinCta'
import Sponsors from '../components/Sponsors'
import NoEncontrado from './NoEncontrado'
import { equipos } from '../data/contenido'

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

      {/* El calendario y los resultados del equipo se quitaron de la ficha el
          2026-07-30 (decisión de Adrián): están todos en /calendario, donde
          además se pueden filtrar por ida y vuelta. */}

      <section className="sec">
        <div className="ficha-datos">
          {equipo.datos.map((d) => (
            <div key={d.label}>
              <span>{d.label}</span>
              <b>{d.valor}</b>
            </div>
          ))}
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

          {/* Mismas tarjetas que la plantilla: el cuerpo técnico es parte del
              equipo, así que se presenta igual. En el hueco de la foto van las
              iniciales, que es lo que hay hasta que existan los retratos. */}
          <div className="sechead" style={{ marginTop: 38 }}>
            <h2>Cuerpo técnico</h2>
            <span className="rule"></span>
            <span style={{ fontSize: 13, color: 'var(--dim)' }}>{equipo.staff.length} personas</span>
          </div>
          <div className="squad">
            {equipo.staff.map((s) => (
              <div className="pl" key={s.nombre}>
                <div className="ph">
                  <span>{s.iniciales}</span>
                </div>
                <b>{s.nombre}</b>
                <i>{s.rol}</i>
              </div>
            ))}
          </div>

          <p style={{ marginTop: 20, fontSize: 13.5, color: 'var(--dim)' }}>
            Los recuadros son marcadores: en cuanto haya fotos individuales, entran aquí sin tocar nada más.
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

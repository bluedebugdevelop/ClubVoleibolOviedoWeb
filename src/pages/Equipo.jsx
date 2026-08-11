import { Link, useParams } from 'react-router-dom'
import PageHead from '../components/PageHead'
import JoinCta from '../components/JoinCta'
import Sponsors from '../components/Sponsors'
import NoEncontrado from './NoEncontrado'
import Pendiente from '../components/Pendiente'
import { padreDe, inicialesDe } from '../data/contenido'
import { useEquipos } from '../data/contenidoContexto'

export default function Equipo() {
  const { slug } = useParams()
  const equipo = useEquipos().find((eq) => eq.slug === slug)

  if (!equipo) return <NoEncontrado />

  /* Los equipos nacionales cuelgan de la portada; los de base, de Cantera,
     que es de donde se llega a ellos. */
  const padre = padreDe(equipo)

  return (
    <>
      <PageHead
        crumbs={
          <>
            <Link to="/">Inicio</Link> · <Link to={padre.to}>{padre.label}</Link> · {equipo.crumb}
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
            {equipo.squad.length > 0 && (
              <span style={{ fontSize: 13, color: 'var(--dim)' }}>{equipo.squad.length} jugadores</span>
            )}
          </div>
          {equipo.squad.length > 0 ? (
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
          ) : (
            <Pendiente titulo="La plantilla todavía no está publicada">
              Estamos cerrando la lista de jugadores de la temporada 26/27. En cuanto esté, aparece aquí.
            </Pendiente>
          )}

          {/* Mismas tarjetas que la plantilla: el cuerpo técnico es parte del
              equipo, así que se presenta igual. En el hueco de la foto van las
              iniciales, que es lo que hay hasta que existan los retratos. */}
          <div className="sechead" style={{ marginTop: 38 }}>
            <h2>Cuerpo técnico</h2>
            <span className="rule"></span>
            {equipo.staff.length > 0 && (
              <span style={{ fontSize: 13, color: 'var(--dim)' }}>{equipo.staff.length} personas</span>
            )}
          </div>
          {equipo.staff.length > 0 ? (
            <div className="squad">
              {equipo.staff.map((s) => (
                <div className="pl" key={s.nombre}>
                  <div className="ph">
                    <span>{s.iniciales || inicialesDe(s.nombre)}</span>
                  </div>
                  <b>{s.nombre}</b>
                  <i>{s.rol}</i>
                </div>
              ))}
            </div>
          ) : (
            <Pendiente titulo="El cuerpo técnico todavía no está publicado">
              Falta confirmar quién dirige al equipo esta temporada.
            </Pendiente>
          )}

          {(equipo.squad.length > 0 || equipo.staff.length > 0) && (
            <p style={{ marginTop: 20, fontSize: 13.5, color: 'var(--dim)' }}>
              Los recuadros son marcadores: en cuanto haya fotos individuales, entran aquí sin tocar nada más.
            </p>
          )}
        </section>
      </div>

      <JoinCta title={equipo.join.title} text={equipo.join.text} />

      <Sponsors />
    </>
  )
}

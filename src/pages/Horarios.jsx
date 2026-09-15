import { Link } from 'react-router-dom'
import PageHead from '../components/PageHead'
import SectionHead from '../components/SectionHead'
import Pendiente from '../components/Pendiente'
import { club, equiposCantera, horariosTemporada, horariosPorEquipo } from '../data/contenido'
import { useEquipos, useFoto } from '../data/contenidoContexto'

/**
 * Nombre y categoría del equipo de un `slug`.
 *
 * Van por `useEquipos()` (lo que controla el panel) para que un cambio de
 * nombre ahí se refleje aquí sin tocar código. Si el panel no tiene ese slug
 * —no debería pasar, pero un horario no puede depender de que no pase—, cae a
 * la semilla de cantera; si tampoco está ahí, al slug a secas para no dejar la
 * fila en blanco.
 */
function equipoDe(slug, equipos) {
  const delPanel = equipos.find((e) => e.slug === slug)
  if (delPanel) return { nombre: delPanel.nombre, categoria: delPanel.categoria }
  const deCantera = equiposCantera.find((e) => e.slug === slug)
  if (deCantera) return { nombre: deCantera.nombre, categoria: deCantera.categoria }
  return { nombre: slug, categoria: '' }
}

export default function Horarios() {
  const equipos = useEquipos()
  const foto = useFoto('horarios')
  const grupos = horariosPorEquipo()

  const cantera = grupos.filter((g) => equiposCantera.some((e) => e.slug === g.slug))
  const nacionales = grupos.filter((g) => !equiposCantera.some((e) => e.slug === g.slug))

  // Equipos que sí controla el panel pero que no traen horario en el PDF del
  // club (hoy, el Sénior Masculino): se avisa en vez de dejarlos fuera sin más.
  const conHorario = new Set(grupos.map((g) => g.slug))
  const sinHorario = equipos.filter((e) => !conHorario.has(e.slug)).map((e) => e.nombre)

  return (
    <>
      <PageHead
        crumbs={<><Link to="/">Inicio</Link> · Horarios</>}
        kicker={`Temporada ${horariosTemporada.temporada}`}
        title="Horarios de entrenamiento"
        sub={`Todos los equipos entrenan en el ${club.sedeCorta}, ${club.localidad}.`}
        bg={foto}
        foco="center 40%"
      />

      <section className="sec">
        {grupos.length === 0 ? (
          <Pendiente titulo="Los horarios de la temporada nueva todavía no están publicados">
            Se publican en septiembre, cuando el club cierra el reparto del pabellón.
          </Pendiente>
        ) : (
          <>
            <SectionHead title="Cantera" />
            <ul className="horarios">
              {cantera.map((g) => {
                const eq = equipoDe(g.slug, equipos)
                return (
                  <li key={g.slug}>
                    <Link to={`/equipos/${g.slug}`} className="eq">
                      <b>{eq.nombre}</b>
                      <span>{eq.categoria}</span>
                    </Link>
                    <div className="ses">
                      {g.sesiones.map((s) => (
                        <span key={s.dias}>{s.dias} <i>{s.hora}</i></span>
                      ))}
                    </div>
                  </li>
                )
              })}
            </ul>

            <SectionHead title="Equipos nacionales" />
            <ul className="horarios">
              {nacionales.map((g) => {
                const eq = equipoDe(g.slug, equipos)
                return (
                  <li key={g.slug}>
                    <Link to={`/equipos/${g.slug}`} className="eq">
                      <b>{eq.nombre}</b>
                      <span>{eq.categoria}</span>
                    </Link>
                    <div className="ses">
                      {g.sesiones.map((s) => (
                        <span key={s.dias}>{s.dias} <i>{s.hora}</i></span>
                      ))}
                    </div>
                  </li>
                )
              })}
            </ul>

            {sinHorario.length > 0 && (
              <p className="letra-pequena">Sin horario confirmado todavía: {sinHorario.join(', ')}.</p>
            )}
          </>
        )}
      </section>

      <div className="band">
        <section className="sec">
          <div className="horarios-sede">
            <div>
              <b>{club.sedeCorta}</b>
              <span>{club.localidad}</span>
            </div>
            <Link className="btn" to="/contacto">Cómo llegar →</Link>
          </div>
        </section>
      </div>
    </>
  )
}

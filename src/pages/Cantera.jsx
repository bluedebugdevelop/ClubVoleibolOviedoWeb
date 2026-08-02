import { Link } from 'react-router-dom'
import PageHead from '../components/PageHead'
import Stats from '../components/Stats'
import SectionHead from '../components/SectionHead'
import JoinCta from '../components/JoinCta'
import Sponsors from '../components/Sponsors'
import Pendiente from '../components/Pendiente'
import {
  cifrasCantera,
  canteraFacts,
  canteraHorarios,
  canteraCuotas,
  canteraSedes,
  equiposCantera,
} from '../data/contenido'

/* Rehecha el 30-07-2026 (reunión con Vitor). Antes contaba la cantera por
   encima; ahora responde en este orden a lo que de verdad pregunta una familia
   antes de apuntar a un hijo: DÓNDE se entrena, CUÁNDO y CÓMO funciona
   (cuotas, qué incluye, cómo va la temporada). Los horarios y las cuotas aún
   no los tenemos: donde van, sale el aviso de "pendiente". */
export default function Cantera() {
  return (
    <>
      <PageHead
        crumbs={
          <>
            <Link to="/">Inicio</Link> · <Link to="/">Nuestros equipos</Link> · Cantera
          </>
        }
        kicker="Base y formación · Temporada 2026/27"
        title="Cantera"
        sub="Nueve equipos federados, desde alevín hasta júnior. Aquí es donde empieza todo el que hoy juega en el primer equipo."
        bg="/media/bloqueo.jpg"
        foco="center 45%"
      />

      <Stats items={cifrasCantera} />

      {/* ─────────── dónde ─────────── */}
      <section className="sec">
        <SectionHead title="Dónde se entrena" />
        <div className="intro-cols">
          <div>
            {canteraSedes.map((s) => (
              <div className="sede" key={s.nombre}>
                <h3>{s.nombre}</h3>
                <p className="dir">{s.direccion}</p>
                <p>{s.detalle}</p>
                <Link className="mas" to="/contacto">Cómo llegar →</Link>
              </div>
            ))}
          </div>
          <div className="facts">
            {canteraFacts.map((f) => (
              <div className="row" key={f.label}>
                <span>{f.label}</span>
                <b>{f.valor}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── cuándo ─────────── */}
      <div className="band">
        <section className="sec">
          <SectionHead title="Horarios por categoría" />
          {canteraHorarios.length > 0 ? (
            <div className="tabla-horarios">
              <table className="table">
                <thead>
                  <tr>
                    <th>Categoría</th>
                    <th>Días</th>
                    <th>Hora</th>
                    <th>Sede</th>
                  </tr>
                </thead>
                <tbody>
                  {canteraHorarios.map((h) => (
                    <tr key={h.categoria}>
                      <td><b>{h.categoria}</b></td>
                      <td>{h.dias}</td>
                      <td>{h.hora}</td>
                      <td>{h.sede}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Pendiente titulo="Los horarios de la 26/27 aún no están cerrados">
              Se reparten entre semana por la tarde y dependen de las horas de pista que asigne el
              polideportivo. En cuanto estén confirmados, se publican aquí categoría por categoría.
            </Pendiente>
          )}
        </section>
      </div>

      {/* ─────────── cómo funciona ─────────── */}
      <section className="sec">
        <SectionHead title="Cómo funciona" />
        <div className="como-va">
          <div>
            <h3>La temporada</h3>
            <p>
              Se compite en la Liga Asturiana de la Federación de Voleibol del Principado, con partidos casi todos
              los fines de semana entre octubre y mayo. Los entrenamientos empiezan en septiembre.
            </p>
          </div>
          <div>
            <h3>Qué equipo le toca</h3>
            <p>
              Lo asignamos nosotros por año de nacimiento y nivel: las bandas de edad las fija la federación. Si no
              tienes claro cuál le corresponde, lo miramos al apuntarle.
            </p>
          </div>
          <div>
            <h3>Qué hace falta</h3>
            <p>
              No hace falta saber jugar ni traer equipación: solo ropa cómoda y calzado deportivo. El material del
              club se entrega una vez formalizada la inscripción.
            </p>
          </div>
        </div>

        <div className="sechead" style={{ margin: '38px 0 16px' }}>
          <h2 style={{ fontSize: 24 }}>Cuotas</h2>
          <span className="rule"></span>
        </div>
        {canteraCuotas.length > 0 ? (
          <div className="facts">
            {canteraCuotas.map((c) => (
              <div className="row" key={c.concepto}>
                <span>
                  {c.concepto}
                  {c.detalle && <i className="detalle">{c.detalle}</i>}
                </span>
                <b>{c.importe}</b>
              </div>
            ))}
          </div>
        ) : (
          <Pendiente titulo="Las cuotas de la 26/27 aún no están cerradas">
            Falta confirmar el importe y qué incluye (ficha federativa, equipación y seguro deportivo). En cuanto
            la junta lo apruebe, se publica aquí desglosado.
          </Pendiente>
        )}
      </section>

      {/* ─────────── equipos ─────────── */}
      <div className="band">
        <section className="sec">
          <SectionHead title="Los nueve equipos" link="/calendario" linkText="Calendario y resultados →" />
          <div className="teams all">
            {equiposCantera.map((eq) => (
              <div className="team" key={eq.nombre}>
                <div className="ph">
                  <img src={eq.img} alt={eq.alt} />
                </div>
                <div className="ov"></div>
                <div className="txt">
                  <div className="cat">{eq.categoria}</div>
                  <h3>{eq.nombre}</h3>
                  <p>{eq.liga}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <JoinCta
        title="Apúntate a la cantera"
        text="Rellena el formulario y te decimos qué día y a qué hora entrena su grupo."
      />

      <Sponsors />
    </>
  )
}

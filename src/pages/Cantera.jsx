import { Link } from 'react-router-dom'
import PageHead from '../components/PageHead'
import Stats from '../components/Stats'
import SectionHead from '../components/SectionHead'
import JoinCta from '../components/JoinCta'
import Sponsors from '../components/Sponsors'
import { cifrasCantera, canteraFacts, equiposCantera } from '../data/contenido'

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

      <section className="sec">
        <div className="intro-cols">
          <div>
            <div className="sechead" style={{ marginBottom: 18 }}>
              <h2>Cómo funciona</h2>
            </div>
            <p>
              Todos los equipos entrenan en el Polideportivo José Manuel Fuente, en Colloto. Se compite en la Liga
              Asturiana de la Federación de Voleibol del Principado, con partidos casi todos los fines de semana
              entre octubre y mayo.
            </p>
            <p>
              No hace falta saber jugar ni traer equipación: se viene a un entrenamiento, se conoce al grupo, y a
              partir de ahí se habla.
            </p>
            <p>
              Si no tienes claro qué equipo le toca a tu hijo o hija, no te preocupes — lo asignamos nosotros por
              año de nacimiento y nivel.
            </p>
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

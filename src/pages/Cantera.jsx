import { Link } from 'react-router-dom'
import PageHead from '../components/PageHead'
import SectionHead from '../components/SectionHead'
import JoinCta from '../components/JoinCta'
import Sponsors from '../components/Sponsors'
import { equiposCantera } from '../data/contenido'

/* La página se quedó solo con los equipos (decisión de Adrián, 02-08-2026).
   Antes llevaba también las cifras de la cantera, la sede, los horarios por
   categoría, cómo funciona y las cuotas; se quitó todo eso. Los datos siguen
   en contenido.js —marcados como sin usar— por si vuelven. */

/* Cuántos equipos hay lo dice la propia lista, no un número escrito a mano: en
   dos días pasó de nueve a diez y de diez a once, y el titular se quedaba atrás.
   Si algún día pasan de veinte, sale la cifra en dígitos y ya está. */
const NUMEROS = [
  'cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
  'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho',
  'diecinueve', 'veinte',
]
const enLetra = (n) => NUMEROS[n] ?? String(n)

export default function Cantera() {
  const cuantos = enLetra(equiposCantera.length)

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
        sub={`${cuantos.charAt(0).toUpperCase()}${cuantos.slice(1)} equipos federados, desde alevín hasta el segundo sénior. Aquí es donde empieza todo el que hoy juega en el primer equipo.`}
        bg="/media/bloqueo.jpg"
        foco="center 45%"
      />

      <section className="sec">
        <SectionHead title={`Los ${cuantos} equipos`} link="/calendario" linkText="Calendario y resultados →" />
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

      <JoinCta
        title="Apúntate a la cantera"
        text="Rellena el formulario y te decimos qué día y a qué hora entrena su grupo."
      />

      <Sponsors />
    </>
  )
}

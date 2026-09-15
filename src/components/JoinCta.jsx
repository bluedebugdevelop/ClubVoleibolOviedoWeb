import { Link } from 'react-router-dom'
import { estadoPreinscripcion } from '../data/contenido'

export default function JoinCta({ title, text, cta = 'Ir a inscripciones →', id }) {
  // Decisión de Diego, 15-09-2026: el club ya no tiene plazas y el bloque
  // invitaba a apuntarse en todas las páginas que lo llevan.
  if (estadoPreinscripcion() === 'cerrada') return null

  return (
    <section className="join" id={id}>
      <div className="join-in">
        <div>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <Link className="btn" to="/inscripciones">{cta}</Link>
      </div>
    </section>
  )
}

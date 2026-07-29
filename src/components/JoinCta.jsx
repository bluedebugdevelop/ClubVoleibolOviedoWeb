import { Link } from 'react-router-dom'

export default function JoinCta({ title, text, cta = 'Ir a inscripciones →', id }) {
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

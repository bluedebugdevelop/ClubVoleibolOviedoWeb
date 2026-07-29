import { Link } from 'react-router-dom'
import PageHead from '../components/PageHead'
import SectionHead from '../components/SectionHead'
import JoinCta from '../components/JoinCta'
import Sponsors from '../components/Sponsors'
import { noticias, galeriaNoticias } from '../data/contenido'

export default function Noticias() {
  const [destacada, ...resto] = noticias

  return (
    <>
      <PageHead
        crumbs={<><Link to="/">Inicio</Link> · Noticias</>}
        kicker="Actualidad del club"
        title="Noticias"
        sub="Lo último de los 11 equipos del CV Oviedo: resultados, fichajes, pretemporada y vida de club."
        bg="/media/hero-remate.jpg"
        foco="center 38%"
      />

      <section className="sec">
        <Link className="destacada" to="/noticias">
          <div className="ph">
            <img src={destacada.img} alt={destacada.titulo} />
          </div>
          <div className="in">
            <div className="meta">
              <b>{destacada.categoria}</b>
              <span>{destacada.fecha}</span>
            </div>
            <h2>{destacada.titulo}</h2>
            <p>{destacada.resumen}</p>
          </div>
        </Link>

        <SectionHead title="Más noticias" />
        <div className="news-grid">
          {resto.map((n) => (
            <Link className="card" to="/noticias" key={n.id}>
              <div className="ph">
                <img src={n.img} alt={n.titulo} />
              </div>
              <div className="in">
                <div className="meta">
                  <b>{n.categoria}</b>
                  <span>{n.fecha}</span>
                </div>
                <h3>{n.titulo}</h3>
                <p>{n.resumen}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="band">
        <section className="sec">
          <SectionHead title="Galería" />
          <div className="gallery">
            {galeriaNoticias.map((g) => (
              <div key={g.src}>
                <img src={g.src} alt={g.alt} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <JoinCta
        title="¿Te apuntas?"
        text="Inscripciones abiertas para la temporada 26/27, desde los 8 años. Rellena el formulario y te decimos con qué equipo entrena."
      />

      <Sponsors />
    </>
  )
}

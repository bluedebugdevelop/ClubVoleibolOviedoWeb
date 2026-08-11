import { Link } from 'react-router-dom'
import PageHead from '../components/PageHead'
import SectionHead from '../components/SectionHead'
import JoinCta from '../components/JoinCta'
import Sponsors from '../components/Sponsors'
import { enlaceNoticia, estadoPreinscripcion, textoPreinscripcion } from '../data/contenido'
import { useNoticias, useFoto } from '../data/contenidoContexto'

export default function Noticias() {
  const foto = useFoto('noticias')
  const noticias = useNoticias()
  const [destacada, ...resto] = noticias

  return (
    <>
      <PageHead
        crumbs={<><Link to="/">Inicio</Link> · Noticias</>}
        kicker="Actualidad del club"
        title="Noticias"
        sub="Lo último de los 13 equipos del CV Oviedo: resultados, fichajes, pretemporada y vida de club."
        bg={foto}
        foco="center 38%"
      />

      <section className="sec">
        <Link className="destacada" to={enlaceNoticia(destacada)}>
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

        {/* con una sola noticia no hay "más": el titular «Más noticias» y su
            rejilla vacía dejaban un hueco raro debajo de la destacada */}
        {resto.length > 0 && (
          <>
            <SectionHead title="Más noticias" />
            <div className="news-grid">
              {resto.map((n) => (
                <Link className="card" to={enlaceNoticia(n)} key={n.id}>
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
          </>
        )}
      </section>

      <JoinCta
        title="¿Te apuntas?"
        text={textoPreinscripcion[estadoPreinscripcion()]}
      />

      <Sponsors />
    </>
  )
}

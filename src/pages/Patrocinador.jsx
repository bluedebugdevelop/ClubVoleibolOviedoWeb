import { Link, useParams } from 'react-router-dom'
import PageHead from '../components/PageHead'
import NoEncontrado from './NoEncontrado'
import { tieneFicha } from '../data/contenido'
import { usePatrocinadores } from '../data/contenidoContexto'

/* Ficha de un patrocinador: quién es, qué hace y su web. Sin nada de vender
   patrocinio — eso no vive en esta parte del sitio. */
export default function Patrocinador() {
  const { slug } = useParams()
  const patrocinadoresActuales = usePatrocinadores()
  const marca = patrocinadoresActuales.find((p) => p.slug === slug)

  // Sin texto escrito no hay ficha que enseñar: la marca existe, pero su URL no.
  if (!marca || !tieneFicha(marca)) return <NoEncontrado />

  const tokens = { '--marca': marca.color, '--marca-glow': marca.glow }

  return (
    <>
      <PageHead
        crumbs={
          <>
            <Link to="/">Inicio</Link> · <Link to="/patrocinadores">Patrocinadores</Link> · {marca.nombre}
          </>
        }
        kicker="Patrocinador del club"
        title={marca.nombre}
        sub={marca.tagline}
        bg={marca.foto}
        foco={marca.foco}
      />

      <section className="sec">
        <div className="ficha-marca" style={tokens}>
          <div className="aro grande">
            <img src={marca.logo} alt={marca.nombre} />
          </div>

          <div className="ficha-texto">
            {marca.parrafos.map((t) => (
              <p key={t.slice(0, 40)}>{t}</p>
            ))}

            {marca.web && (
              <a className="btn solid web" href={marca.web} target="_blank" rel="noopener noreferrer">
                {marca.webTexto} ↗
              </a>
            )}
          </div>
        </div>

        <p className="volver">
          <Link to="/patrocinadores">← Todos los patrocinadores</Link>
        </p>
      </section>
    </>
  )
}

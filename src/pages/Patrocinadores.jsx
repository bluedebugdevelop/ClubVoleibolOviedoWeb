import { Link } from 'react-router-dom'
import PageHead from '../components/PageHead'
import { patrocinadoresActuales } from '../data/contenido'

/* Esta página NO vende patrocinio (decisión de Diego, 2026-07-29): solo enseña
   quién acompaña al club. Cada marca lleva a su propia ficha. */
export default function Patrocinadores() {
  return (
    <>
      <PageHead
        crumbs={<><Link to="/">Inicio</Link> · Patrocinadores</>}
        kicker="Quienes nos acompañan"
        title="Patrocinadores"
        sub="Las marcas que acompañan al Club Voleibol Oviedo temporada tras temporada. Pincha en cualquiera para saber quiénes son."
        /* Nada de fotos de equipo fuera del apartado de equipos: aquí van fotos
           de juego o de celebración. celebracion.jpg no vale (es vertical, 1066x1600,
           y la banda la recortaba a un trozo de cuerpo); celebracion-manos.jpg sí,
           es apaisada. */
        bg="/media/celebracion-manos.jpg"
        foco="center 45%"
      />

      <section className="sec">
        <div className="marcas">
          {patrocinadoresActuales.map((p) => (
            <Link
              className="marca"
              key={p.slug}
              to={`/patrocinadores/${p.slug}`}
              style={{ '--marca': p.color, '--marca-glow': p.glow }}
            >
              <span className="aro">
                <img src={p.logo} alt={p.nombre} />
              </span>
              <b>{p.nombre}</b>
              <i>{p.tagline}</i>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}

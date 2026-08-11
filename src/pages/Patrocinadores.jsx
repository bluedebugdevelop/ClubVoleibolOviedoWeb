import { Link } from 'react-router-dom'
import PageHead from '../components/PageHead'
import { club, enlaceDePatrocinador } from '../data/contenido'
import { usePatrocinadores } from '../data/contenidoContexto'

/* Esta página NO vende patrocinio (decisión de Diego, 2026-07-29): solo enseña
   quién acompaña al club. Cada marca lleva a su ficha si la tiene y, si no,
   directamente a su propia web. */
export default function Patrocinadores() {
  const patrocinadoresActuales = usePatrocinadores()
  return (
    <>
      <PageHead
        crumbs={<><Link to="/">Inicio</Link> · Patrocinadores</>}
        kicker="Quienes nos acompañan"
        title="Patrocinadores"
        sub="Las marcas que acompañan al Club Voleibol Oviedo temporada tras temporada. Pincha en cualquiera para ir a su página."
        /* Nada de fotos de equipo fuera del apartado de equipos: aquí van fotos
           de juego o de celebración. celebracion.jpg no vale (es vertical, 1066x1600,
           y la banda la recortaba a un trozo de cuerpo); celebracion-manos.jpg sí,
           es apaisada. */
        bg="/media/celebracion-manos.jpg"
        foco="center 45%"
      />

      <section className="sec">
        <div className="marcas">
          {patrocinadoresActuales.map((p) => {
            const enlace = enlaceDePatrocinador(p)
            const estilo = { '--marca': p.color, '--marca-glow': p.glow }
            const dentro = (
              <>
                <span className="aro">
                  <img src={p.logo} alt={p.nombre} />
                </span>
                <b>{p.nombre}</b>
                <i>{p.tagline}</i>
              </>
            )

            // Sin web conocida la tarjeta se pinta igual pero no lleva a ningún
            // sitio, en vez de a una dirección inventada.
            if (!enlace) {
              return (
                <div className="marca" key={p.slug} style={estilo}>{dentro}</div>
              )
            }
            if (enlace.to) {
              return (
                <Link className="marca" key={p.slug} to={enlace.to} style={estilo}>{dentro}</Link>
              )
            }
            return (
              <a className="marca" key={p.slug} {...enlace} style={estilo}>{dentro}</a>
            )
          })}
        </div>

        {/* El club pidió el 08-08-2026 que su buzón de patrocinio se vea también
            aquí. Sigue sin venderse nada en esta página: solo el correo. */}
        <p className="pie-patrocinio">
          ¿Quieres acompañarnos la próxima temporada? Escríbenos a{' '}
          <a href={`mailto:${club.emailPatrocinio}`}>{club.emailPatrocinio}</a> o mira{' '}
          <Link to="/patrocinar">cómo colaborar con el club</Link>.
        </p>
      </section>
    </>
  )
}

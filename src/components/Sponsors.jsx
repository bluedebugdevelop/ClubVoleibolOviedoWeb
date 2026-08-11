import { Link } from 'react-router-dom'
import { enlaceDePatrocinador } from '../data/contenido'
import { usePatrocinadores } from '../data/contenidoContexto'

export default function Sponsors() {
  const patrocinadoresActuales = usePatrocinadores()
  return (
    <div className="sponsors">
      <div className="sponsors-in">
        <span className="lbl">Patrocinadores</span>
        {patrocinadoresActuales.map((p) => {
          const enlace = enlaceDePatrocinador(p)
          const logo = <img src={p.logo} alt={p.nombre} />

          // Sin web conocida el logo se pinta igual, pero sin enlace: es
          // preferible a mandar a la gente a un sitio inventado.
          if (!enlace) return <span key={p.slug} className="sin-enlace">{logo}</span>
          if (enlace.to) {
            return (
              <Link key={p.slug} to={enlace.to} aria-label={p.nombre}>{logo}</Link>
            )
          }
          return (
            <a key={p.slug} {...enlace} aria-label={`${p.nombre} (se abre en otra pestaña)`}>{logo}</a>
          )
        })}
        <Link className="more" to="/patrocinadores">Ver patrocinadores →</Link>
      </div>
    </div>
  )
}

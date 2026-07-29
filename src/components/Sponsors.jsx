import { Link } from 'react-router-dom'
import { patrocinadoresActuales } from '../data/contenido'

export default function Sponsors() {
  return (
    <div className="sponsors">
      <div className="sponsors-in">
        <span className="lbl">Patrocinadores</span>
        {patrocinadoresActuales.map((p) => (
          <Link key={p.slug} to={`/patrocinadores/${p.slug}`} aria-label={p.nombre}>
            <img src={p.logo} alt={p.nombre} />
          </Link>
        ))}
        <Link className="more" to="/patrocinadores">Ver patrocinadores →</Link>
      </div>
    </div>
  )
}

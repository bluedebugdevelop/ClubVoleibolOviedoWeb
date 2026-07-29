import { Link } from 'react-router-dom'
import Crest from '../components/Crest'

export default function NoEncontrado() {
  return (
    <div className="notfound">
      <Crest className="mark404" />
      <h1>Página no encontrada</h1>
      <p>Esta dirección no existe o se ha movido. Vuelve a la portada y sigue desde ahí.</p>
      <Link className="btn solid" to="/">Ir a inicio →</Link>
    </div>
  )
}

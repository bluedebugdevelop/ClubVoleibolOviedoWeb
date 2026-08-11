import { Link } from 'react-router-dom'
import useSeo from '../seo'
import Crest from '../components/Crest'

export default function NoEncontrado() {
  // `noindex` para que Google no se llene de 404s: el servidor devuelve el
  // index.html con estado 200 en cualquier ruta, así que sin esto una
  // dirección mal escrita entraría en el índice como una página más.
  useSeo({ title: 'Página no encontrada', noindex: true })

  return (
    <div className="notfound">
      <Crest className="mark404" />
      <h1>Página no encontrada</h1>
      <p>Esta dirección no existe o se ha movido. Vuelve a la portada y sigue desde ahí.</p>
      <Link className="btn solid" to="/">Ir a inicio →</Link>
    </div>
  )
}

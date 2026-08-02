import { Link } from 'react-router-dom'
import Crest from './Crest'
import { club } from '../data/contenido'

export default function Footer() {
  return (
    <footer>
      <div className="in">
        <Crest className="crest" />
        <div className="col">
          <b>Equipos</b>
          <Link to="/equipos/superliga-2-masculino">Superliga 2 Masculino</Link>
          <Link to="/equipos/primera-nacional-femenina">Primera Nacional Femenina</Link>
          <Link to="/equipos/senior-masculino">Sénior Masculino</Link>
          <Link to="/cantera">Cantera</Link>
          <Link to="/cantera">Todos los equipos</Link>
        </div>
        <div className="col">
          <b>Club</b>
          <Link to="/quienes-somos">Quiénes somos</Link>
          <Link to="/noticias">Noticias</Link>
          <Link to="/patrocinadores">Patrocinadores</Link>
          <Link to="/patrocinar">Patrocinar al club</Link>
          <Link to="/tienda">Tienda</Link>
          <Link to="/inscripciones">Inscripciones</Link>
        </div>
        <div className="col">
          <b>Contacto</b>
          <p>{club.email}</p>
          <p>{club.telefono}</p>
          <p>{club.sedeCorta}<br />{club.localidad}</p>
        </div>
        <div className="col">
          <b>Síguenos</b>
          {/* PENDIENTE: enlaces reales a las redes sociales del club */}
          <a href="#">Instagram</a>
          <a href="#">Facebook</a>
          <a href="#">YouTube</a>
        </div>
      </div>
      <div className="legal">
        <div>
          <span>© 2026 {club.nombre}</span>
          <Link to="/aviso-legal">Aviso legal</Link>
          <Link to="/privacidad">Privacidad</Link>
          <Link to="/cookies">Cookies</Link>
        </div>
      </div>
    </footer>
  )
}

import { Link } from 'react-router-dom'
import Crest from './Crest'
import { redes } from './redes'
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
          {/* el de patrocinio va aparte y etiquetado: si van los dos correos
              seguidos y sin etiqueta, una empresa escribe al que sea */}
          <p>Patrocinio: {club.emailPatrocinio}</p>
          {/* el teléfono no se publica en la web (03-08-2026) */}
          <p>{club.sedeCorta}<br />{club.localidad}</p>
        </div>
        <div className="col">
          <b>Síguenos</b>
          {/* misma lista que la barra de arriba: sale de `club.redes`, así que
              no hay que acordarse de tocar los dos sitios al añadir una red */}
          {redes.map((r) => (
            <a key={r.clave} href={r.href} target="_blank" rel="noreferrer">{r.nombre}</a>
          ))}
        </div>
      </div>
      <div className="legal">
        <div>
          <span>© 2026 {club.nombre}</span>
          <Link to="/aviso-legal">Aviso legal</Link>
          <Link to="/privacidad">Privacidad</Link>
          <Link to="/cookies">Cookies</Link>
          {/* PENDIENTE de confirmar: si el crédito lleva enlace a la web de
              BlueDebug, se cambia el <span> por un <a> y ya está. */}
          <span className="credito">Web desarrollada por <b>BlueDebug</b></span>
        </div>
      </div>
    </footer>
  )
}

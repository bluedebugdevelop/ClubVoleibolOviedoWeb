import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import Crest from './Crest'
import { redes } from './redes'
import { club } from '../data/contenido'

const equipos = [
  { to: '/equipos/superliga-2-masculino', texto: 'Superliga 2 Masculino' },
  { to: '/equipos/primera-nacional-femenina', texto: 'Primera Nacional Femenina' },
  // El segundo equipo sénior masculino NO va aquí: es la continuación de la
  // cantera para quien sale del júnior, así que vive en /cantera con el resto
  // de equipos de base (03-08-2026).
  { to: '/cantera', texto: 'Cantera' },
]

const secciones = [
  { to: '/calendario', texto: 'Calendario' },
  { to: '/noticias', texto: 'Noticias' },
  { to: '/quienes-somos', texto: 'Quiénes somos' },
  { to: '/patrocinadores', texto: 'Patrocinadores' },
  { to: '/tienda', texto: 'Tienda' },
]

/* Acceso del club. Discreto a propósito: un candado pequeño, en gris, al lado
   de las redes. No lleva texto porque no es para el visitante — quien tiene que
   entrar ya sabe lo que es, y al resto no le dice nada.

   Lleva a /acceso y no a /panel: es una puerta para dos sitios. Según la cuenta
   que se escriba, el servidor manda al panel o al área de peticiones, así que
   nadie tiene que acordarse de una dirección distinta a la del candado. */
function Candado() {
  return (
    <NavLink className="acceso-panel" to="/acceso" aria-label="Acceso del club" title="Acceso del club">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="10.5" width="16" height="11" rx="2" />
        <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
      </svg>
    </NavLink>
  )
}

export default function Nav() {
  const [abierto, setAbierto] = useState(false)
  const { pathname } = useLocation()

  /* al cambiar de página el cajón se cierra solo: si no, se queda abierto
     tapando la página nueva */
  useEffect(() => {
    setAbierto(false)
  }, [pathname])

  /* con el cajón abierto la página de detrás no debe poder desplazarse */
  useEffect(() => {
    document.body.classList.toggle('menu-abierto', abierto)
    return () => document.body.classList.remove('menu-abierto')
  }, [abierto])

  return (
    <div className="nav">
      <div className="nav-in">
        <NavLink className="brand" to="/">
          <Crest className="mark" />
          {/* "Oviedo" es parte del nombre, va al mismo tamaño que el resto; el
              año es lo único que se queda pequeño (decisión de Diego). */}
          <span>
            Club Voleibol
            <em>Oviedo<i>· {club.fundacion}</i></em>
          </span>
        </NavLink>

        <div className="links">
          <span className="drop">
            <span className="drop-label">Nuestros equipos</span>
            <span className="drop-menu">
              {equipos.map((e) => (
                <NavLink key={e.to} to={e.to}>{e.texto}</NavLink>
              ))}
            </span>
          </span>
          {secciones.map((s) => (
            <NavLink key={s.to} to={s.to}>{s.texto}</NavLink>
          ))}
        </div>

        <div className="right">
          <div className="social">
            {redes.map((r) => (
              <a key={r.clave} href={r.href} target="_blank" rel="noreferrer" aria-label={r.nombre}>{r.icono}</a>
            ))}
          </div>
          <Candado />
          <NavLink className="btn-cta alt" to="/patrocinar">Patrocinar</NavLink>
          <NavLink className="btn-cta" to="/inscripciones">Apúntate</NavLink>

          {/* solo se ve por debajo de 1000px, donde .links se oculta */}
          <button
            type="button"
            className="burger"
            aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={abierto}
            onClick={() => setAbierto((v) => !v)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {abierto && (
        <>
          <div className="mnav-veil" onClick={() => setAbierto(false)}></div>
          <nav className="mnav" aria-label="Menú principal">
            <b className="mnav-lbl">Nuestros equipos</b>
            {equipos.map((e) => (
              <NavLink key={e.to} to={e.to}>{e.texto}</NavLink>
            ))}
            <b className="mnav-lbl">El club</b>
            {secciones.map((s) => (
              <NavLink key={s.to} to={s.to}>{s.texto}</NavLink>
            ))}
            <NavLink to="/contacto">Contacto</NavLink>

            <div className="mnav-cta">
              <NavLink className="btn-cta alt" to="/patrocinar">Patrocinar</NavLink>
              <NavLink className="btn-cta" to="/inscripciones">Apúntate</NavLink>
            </div>

            <div className="mnav-social">
              {redes.map((r) => (
                <a key={r.clave} href={r.href} target="_blank" rel="noreferrer" aria-label={r.nombre}>{r.icono}</a>
              ))}
              {/* en el móvil las redes y el candado comparten fila: el candado
                  se distingue por ir en gris y sin círculo alrededor */}
              <Candado />
            </div>
          </nav>
        </>
      )}
    </div>
  )
}

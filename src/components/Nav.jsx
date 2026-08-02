import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import Crest from './Crest'
import { club } from '../data/contenido'

/* PENDIENTE: enlaces reales a las redes sociales del club */
const redes = [
  {
    nombre: 'Instagram',
    href: '#',
    icono: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    nombre: 'Facebook',
    href: '#',
    icono: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 9h3V6h-3c-2 0-3.5 1.5-3.5 3.5V12H8v3h2.5v7h3v-7H16l.5-3h-3V9.8c0-.5.4-.8 1-.8z" />
      </svg>
    ),
  },
  {
    nombre: 'YouTube',
    href: '#',
    icono: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.7-1.8C18.3 5 12 5 12 5s-6.3 0-7.9.5A2.5 2.5 0 0 0 2.4 7.3C2 8.8 2 12 2 12s0 3.2.4 4.7c.2.9.9 1.6 1.7 1.8 1.6.5 7.9.5 7.9.5s6.3 0 7.9-.5a2.5 2.5 0 0 0 1.7-1.8C22 15.2 22 12 22 12zM10 15V9l5.2 3z" />
      </svg>
    ),
  },
]

const equipos = [
  { to: '/equipos/superliga-2-masculino', texto: 'Superliga 2 Masculino' },
  { to: '/equipos/primera-nacional-femenina', texto: 'Primera Nacional Femenina' },
  // el segundo equipo sénior masculino: existía pero no estaba enlazado en
  // ningún sitio (reunión con Vitor, 30-07-2026)
  { to: '/equipos/senior-masculino', texto: 'Sénior Masculino' },
  { to: '/cantera', texto: 'Cantera' },
]

const secciones = [
  { to: '/calendario', texto: 'Calendario' },
  { to: '/noticias', texto: 'Noticias' },
  { to: '/quienes-somos', texto: 'Quiénes somos' },
  { to: '/patrocinadores', texto: 'Patrocinadores' },
  { to: '/tienda', texto: 'Tienda' },
]

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
              <a key={r.nombre} href={r.href} aria-label={r.nombre}>{r.icono}</a>
            ))}
          </div>
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
                <a key={r.nombre} href={r.href} aria-label={r.nombre}>{r.icono}</a>
              ))}
            </div>
          </nav>
        </>
      )}
    </div>
  )
}

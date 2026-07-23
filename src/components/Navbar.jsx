import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { CLUB } from '../data/content'

const LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/equipos', label: 'Equipos' },
  { to: '/noticias', label: 'Noticias' },
  { to: '/tienda', label: 'Tienda' },
  { to: '/quienes-somos', label: 'Quiénes somos' },
  { to: '/contacto', label: 'Contacto' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => setOpen(false), [location])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const linkClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
      isActive
        ? 'text-brand-500 bg-sky-100'
        : 'text-navy-900 hover:text-brand-500 hover:bg-ice-50'
    }`

  return (
    <header
      className={`sticky top-0 z-50 transition-shadow ${
        scrolled ? 'shadow-md bg-white/95 backdrop-blur' : 'bg-white'
      }`}
    >
      <nav className="container-cvo flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/images/logo.jpg"
            alt={CLUB.nombre}
            className="h-14 w-14 rounded-full object-cover ring-2 ring-sky-100 group-hover:ring-brand-400 transition"
          />
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="font-display font-extrabold text-navy-900 text-lg">
              Club Voleibol
            </span>
            <span className="font-display font-bold text-brand-500 text-sm tracking-widest uppercase">
              Oviedo
            </span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <button
          aria-label="Abrir menú"
          className="lg:hidden p-2 rounded-md text-navy-900 hover:bg-ice-50"
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="lg:hidden border-t border-sky-100 bg-white">
          <div className="container-cvo py-3 flex flex-col gap-1">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

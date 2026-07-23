import { Link } from 'react-router-dom'
import { CLUB, PATROCINADORES } from '../data/content'

function SocialIcon({ type }) {
  const paths = {
    instagram: 'M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2m0 3.6A6.2 6.2 0 1 0 18.2 12 6.2 6.2 0 0 0 12 5.8m0 10.2A4 4 0 1 1 16 12a4 4 0 0 1-4 4m6.4-10.6a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44',
    twitter: 'M18.9 1.2h3.7l-8 9.1L24 22.8h-7.4l-5.8-7.6-6.6 7.6H.5l8.6-9.8L0 1.2h7.6l5.2 6.9ZM17.6 20.6h2L6.5 3.3H4.3Z',
    facebook: 'M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.6 4.5-4.6 1.3 0 2.6.2 2.6.2v2.9h-1.5c-1.5 0-1.9.9-1.9 1.8V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12',
    youtube: 'M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8M9.6 15.6V8.4l6.3 3.6Z',
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={paths[type]} />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-sky-100 mt-20">
      {/* Patrocinadores */}
      <div className="border-b border-white/10">
        <div className="container-cvo py-10">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-sky-300 mb-6">
            Con el apoyo de nuestros patrocinadores
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {PATROCINADORES.map((p) => (
              <img
                key={p.nombre}
                src={p.imagen}
                alt={p.nombre}
                className="h-12 rounded opacity-80 hover:opacity-100 transition grayscale hover:grayscale-0"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="container-cvo py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <img src="/images/logo.jpg" alt={CLUB.nombre} className="h-12 w-12 rounded-full" />
            <span className="font-display font-extrabold text-white text-lg">{CLUB.nombre}</span>
          </div>
          <p className="text-sky-100/70 max-w-sm text-sm leading-relaxed">
            {CLUB.lema}. Club fundado en {CLUB.fundacion} en {CLUB.ciudad}, comprometido con el
            deporte base y la competición.
          </p>
          <div className="flex gap-3 mt-5">
            {Object.entries(CLUB.redes).map(([k, url]) => (
              <a
                key={k}
                href={url}
                target="_blank"
                rel="noreferrer"
                aria-label={k}
                className="h-10 w-10 grid place-items-center rounded-full bg-white/10 hover:bg-brand-500 text-white transition"
              >
                <SocialIcon type={k} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4">Enlaces</h4>
          <ul className="space-y-2 text-sm text-sky-100/70">
            <li><Link to="/equipos" className="hover:text-white transition">Equipos</Link></li>
            <li><Link to="/noticias" className="hover:text-white transition">Noticias</Link></li>
            <li><Link to="/tienda" className="hover:text-white transition">Tienda</Link></li>
            <li><Link to="/quienes-somos" className="hover:text-white transition">Quiénes somos</Link></li>
            <li><Link to="/contacto" className="hover:text-white transition">Contacto</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4">Contacto</h4>
          <ul className="space-y-2 text-sm text-sky-100/70">
            <li>{CLUB.direccion}</li>
            <li><a href={`mailto:${CLUB.email}`} className="hover:text-white transition">{CLUB.email}</a></li>
            <li>{CLUB.telefono}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-cvo py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-sky-100/50">
          <p>© {new Date().getFullYear()} {CLUB.nombre}. Todos los derechos reservados.</p>
          <p>Datos de prueba · Web de demostración</p>
        </div>
      </div>
    </footer>
  )
}

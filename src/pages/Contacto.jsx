import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHead from '../components/PageHead'
import SectionHead from '../components/SectionHead'
import { club } from '../data/contenido'

export default function Contacto() {
  const [enviado, setEnviado] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setEnviado(true)
  }

  return (
    <>
      <PageHead
        crumbs={<><Link to="/">Inicio</Link> · Contacto</>}
        kicker="Estamos en Colloto"
        title="Contacto"
        sub="Para patrocinios, prensa o cualquier duda sobre el club, puedes escribirnos, llamarnos o venir a vernos entrenar."
        bg="/media/pista-azul.jpg"
        foco="center 38%"
      />

      <section className="sec">
        <SectionHead title="Cómo llegar" />
        <div className="contact-grid">
          <div className="contact-info">
            <div className="row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 21s7-6.5 7-11a7 7 0 1 0-14 0c0 4.5 7 11 7 11z" />
                <circle cx="12" cy="10" r="2.6" />
              </svg>
              <span>
                <b>Sede</b>
                <span>{club.sede}</span>
              </span>
            </div>
            <div className="row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>
                <b>Teléfono</b>
                <span>{club.telefono}</span>
              </span>
            </div>
            <div className="row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16v16H4z" />
                <path d="m4 6 8 7 8-7" />
              </svg>
              <span>
                <b>Email</b>
                <span>{club.email}</span>
              </span>
            </div>
          </div>

          <div className="map-frame">
            <iframe
              title="Polideportivo José Manuel Fuente, Colloto"
              src="https://www.google.com/maps?q=Polideportivo+Jose+Manuel+Fuente,+Colloto,+Oviedo&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <div className="band">
        <section className="sec">
          <SectionHead title="Escríbenos" />
          <form className="form" onSubmit={handleSubmit}>
            {enviado && (
              <div className="notice">
                Gracias por escribir. Este formulario todavía no está conectado a ningún envío automático: por
                ahora, escribe directamente a {club.email}.
              </div>
            )}
            <div className="field">
              <label htmlFor="nombre">Nombre</label>
              <input id="nombre" name="nombre" type="text" required />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required />
            </div>
            <div className="field">
              <label htmlFor="mensaje">Mensaje</label>
              <textarea id="mensaje" name="mensaje" required />
            </div>
            <button className="btn solid" type="submit">Enviar mensaje →</button>
          </form>
        </section>
      </div>
    </>
  )
}

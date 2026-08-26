import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHead from '../components/PageHead'
import SectionHead from '../components/SectionHead'
import { IconoWhatsapp } from '../components/Whatsapp'
import { club } from '../data/contenido'
import { useFoto } from '../data/contenidoContexto'

const VACIO = {
  nombre: '',
  email: '',
  mensaje: '',
  web: '', // trampa para robots: oculta, una persona nunca la rellena
}

export default function Contacto() {
  const foto = useFoto('contacto')
  const [datos, setDatos] = useState(VACIO)
  const [consentimiento, setConsentimiento] = useState(false)
  const [estado, setEstado] = useState('inicial') // inicial · enviando · ok · sinConectar · error

  function cambia(e) {
    const { name, value } = e.target
    setDatos((d) => ({ ...d, [name]: value }))
  }

  /* Hasta el 12-08-2026 esto no enviaba nada: solo ponía un aviso diciendo que
     no estaba conectado. Ahora va a `/api/contacto`, con el mismo trato que los
     otros dos formularios — incluida la comprobación de que la respuesta es
     JSON: si el endpoint no estuviera desplegado, el servidor devolvería el
     index.html con estado 200 y diríamos «enviado» sin haber enviado nada. */
  async function handleSubmit(e) {
    e.preventDefault()
    setEstado('enviando')
    try {
      const r = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...datos, consentimiento }),
      })
      const esJson = (r.headers.get('content-type') || '').includes('application/json')
      const cuerpo = esJson ? await r.json().catch(() => ({})) : {}

      if (r.ok && cuerpo.ok === true) {
        setDatos(VACIO)
        setConsentimiento(false)
        setEstado('ok')
      } else if (!esJson || r.status === 404 || cuerpo.configurado === false) {
        setEstado('sinConectar')
      } else {
        setEstado('error')
      }
    } catch (err) {
      console.error('No se pudo contactar con /api/contacto:', err.message)
      setEstado('sinConectar')
    }
  }

  return (
    <>
      <PageHead
        crumbs={<><Link to="/">Inicio</Link> · Contacto</>}
        kicker="Estamos en Colloto"
        title="Contacto"
        sub="Para patrocinios, prensa o cualquier duda sobre el club, puedes escribirnos o venir a vernos entrenar."
        bg={foto}
        foco="center 42%"
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
            {/* el teléfono vuelve el 26-08-2026 y va con el icono de WhatsApp:
                las familias escriben por ahí antes que por correo */}
            <div className="row">
              <IconoWhatsapp size={18} />
              <span>
                <b>Teléfono y WhatsApp</b>
                <span>
                  <a className="wa" href={club.whatsapp} target="_blank" rel="noreferrer">{club.telefono}</a>
                </span>
              </span>
            </div>
            <div className="row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16v16H4z" />
                <path d="m4 6 8 7 8-7" />
              </svg>
              <span>
                <b>Email</b>
                <span><a href={`mailto:${club.email}`}>{club.email}</a></span>
              </span>
            </div>
            {/* buzón aparte para las empresas (07-08-2026): quien escribe por
                patrocinio no debe acabar en el correo general */}
            <div className="row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16v16H4z" />
                <path d="m4 6 8 7 8-7" />
              </svg>
              <span>
                <b>Patrocinio</b>
                <span><a href={`mailto:${club.emailPatrocinio}`}>{club.emailPatrocinio}</a></span>
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
            {estado === 'ok' && (
              <div className="notice bien">
                <b>Mensaje enviado.</b> Te respondemos en cuanto podamos.
              </div>
            )}
            {estado === 'sinConectar' && (
              <div className="notice aviso">
                <b>El envío automático no está disponible ahora mismo.</b> Para no hacerte perder el tiempo:
                escríbenos directamente a <a href={`mailto:${club.email}`}>{club.email}</a>.
              </div>
            )}
            {estado === 'error' && (
              <div className="notice aviso">
                No hemos podido enviar el mensaje. Inténtalo de nuevo en un momento o escríbenos a{' '}
                <a href={`mailto:${club.email}`}>{club.email}</a>.
              </div>
            )}

            <div className="field">
              <label htmlFor="nombre">Nombre *</label>
              <input id="nombre" name="nombre" type="text" value={datos.nombre} onChange={cambia}
                autoComplete="name" required />
            </div>
            <div className="field">
              <label htmlFor="email">Email *</label>
              <input id="email" name="email" type="email" value={datos.email} onChange={cambia}
                autoComplete="email" required />
            </div>
            <div className="field">
              <label htmlFor="mensaje">Mensaje *</label>
              <textarea id="mensaje" name="mensaje" value={datos.mensaje} onChange={cambia} required />
            </div>

            {/* trampa para robots: fuera de pantalla y fuera del tabulador */}
            <div className="trampa" aria-hidden="true">
              <label htmlFor="web">No rellenes este campo</label>
              <input id="web" name="web" type="text" tabIndex={-1} autoComplete="off"
                value={datos.web} onChange={cambia} />
            </div>

            <label className="consent">
              <input type="checkbox" checked={consentimiento} required
                onChange={(e) => setConsentimiento(e.target.checked)} />
              <span>
                Autorizo al Club Voleibol Oviedo a usar estos datos para responderme. No se usan para nada más ni
                se ceden a terceros. *
              </span>
            </label>

            <button className="btn solid" type="submit" disabled={estado === 'enviando'}>
              {estado === 'enviando' ? 'Enviando…' : 'Enviar mensaje →'}
            </button>
          </form>
        </section>
      </div>
    </>
  )
}

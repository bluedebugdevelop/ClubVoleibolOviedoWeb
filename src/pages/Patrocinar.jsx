import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHead from '../components/PageHead'
import SectionHead from '../components/SectionHead'
import Stats from '../components/Stats'
import { club, alcanceClub, porQuePatrocinar, contrapartidas, patrocinadoresActuales } from '../data/contenido'

/* Esta es la página que SÍ busca patrocinadores: la de /patrocinadores solo
   enseña las marcas que ya están. Aquí NO van precios ni niveles (decisión de
   Diego, 2026-07-29): se explica el club, qué se puede ofrecer, y lo concreto
   se habla por email.

   Ojo con el correo: esta página usa `club.emailPatrocinio`, no `club.email`.
   Es el único sitio del sitio que escribe al buzón de patrocinio. */

const VACIO = {
  empresa: '',
  contacto: '',
  telefono: '',
  email: '',
  web: '',
  mensaje: '',
  apodo: '', // trampa para robots: oculta, una persona nunca la rellena
}

export default function Patrocinar() {
  const [datos, setDatos] = useState(VACIO)
  const [consentimiento, setConsentimiento] = useState(false)
  const [estado, setEstado] = useState('inicial') // inicial · enviando · ok · sinConectar · error

  function cambia(e) {
    const { name, value } = e.target
    setDatos((d) => ({ ...d, [name]: value }))
  }

  async function envia(e) {
    e.preventDefault()
    setEstado('enviando')
    try {
      const r = await fetch('/api/patrocinio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...datos, consentimiento }),
      })
      // Si la función no está desplegada, el servidor devuelve el HTML del sitio
      // con estado 200. Sin esta comprobación diríamos "enviado" sin haber
      // enviado nada: solo se da por buena una respuesta JSON que diga ok.
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
      console.error('No se pudo contactar con /api/patrocinio:', err.message)
      setEstado('sinConectar')
    }
  }

  return (
    <>
      <PageHead
        crumbs={<><Link to="/">Inicio</Link> · Patrocinar</>}
        kicker="Temporada 2026/27"
        title="Patrocina al club"
        sub="Buscamos empresas de Oviedo y de Asturias que quieran acompañar al club esta temporada. Cuéntanos quién eres y lo hablamos."
        /* misma razón que en /patrocinadores: fotos de juego, no de equipo, y
           celebracion.jpg es vertical y aquí solo se veía un recorte sin sentido */
        bg="/media/plancha.jpg"
        foco="center 55%"
      />

      <Stats items={alcanceClub} />

      <section className="sec">
        <SectionHead title="Por qué patrocinarnos" />
        <div className="values">
          {porQuePatrocinar.map((p) => (
            <div className="value" key={p.titulo}>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="band">
        <section className="sec">
          <SectionHead title="Qué podemos ofrecerte" />
          <div className="checklist">
            <ul>
              {contrapartidas.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </section>
        {/* Aquí iba «No hay paquetes cerrados ni tarifas publicadas…». Se quitó
            el 03-08-2026: los niveles y los precios van en el dossier, no en la
            web. El bloque cierra con la lista de contrapartidas. */}
      </div>

      <section className="sec">
        <SectionHead title="Quienes ya nos acompañan" />
        <div className="marcas">
          {patrocinadoresActuales.map((p) => (
            <Link
              className="marca"
              key={p.slug}
              to={`/patrocinadores/${p.slug}`}
              style={{ '--marca': p.color, '--marca-glow': p.glow }}
            >
              <span className="aro">
                <img src={p.logo} alt={p.nombre} />
              </span>
              <b>{p.nombre}</b>
              <i>{p.tagline}</i>
            </Link>
          ))}
        </div>
      </section>

      <section className="sec" id="formulario">
        <SectionHead title="Hablemos" />

        <form className="form inscripcion" onSubmit={envia}>
          {estado === 'ok' && (
            <div className="notice bien">
              <b>Solicitud enviada.</b> Nos ponemos en contacto contigo para contarte las opciones y resolver
              cualquier duda.
            </div>
          )}
          {estado === 'sinConectar' && (
            <div className="notice aviso">
              <b>El envío automático todavía no está activado.</b> Para no hacerte perder el tiempo: escríbenos a{' '}
              <a href={`mailto:${club.emailPatrocinio}`}>{club.emailPatrocinio}</a> y lo hablamos igual.
            </div>
          )}
          {estado === 'error' && (
            <div className="notice aviso">
              No hemos podido enviar la solicitud. Inténtalo de nuevo en un momento o escríbenos a{' '}
              <a href={`mailto:${club.emailPatrocinio}`}>{club.emailPatrocinio}</a>.
            </div>
          )}

          <div className="campos">
            <div className="field ancho">
              <label htmlFor="empresa">Empresa o marca *</label>
              <input id="empresa" name="empresa" type="text" value={datos.empresa} onChange={cambia}
                autoComplete="organization" required />
            </div>

            <div className="field">
              <label htmlFor="contacto">Persona de contacto *</label>
              <input id="contacto" name="contacto" type="text" value={datos.contacto} onChange={cambia}
                autoComplete="name" required />
            </div>

            <div className="field">
              <label htmlFor="web">Web <span>(opcional)</span></label>
              <input id="web" name="web" type="text" value={datos.web} onChange={cambia}
                autoComplete="url" placeholder="tuempresa.com" />
            </div>

            <div className="field">
              <label htmlFor="telefono">Teléfono <span>(opcional)</span></label>
              <input id="telefono" name="telefono" type="tel" value={datos.telefono} onChange={cambia}
                autoComplete="tel" />
            </div>

            <div className="field">
              <label htmlFor="email">Email *</label>
              <input id="email" name="email" type="email" value={datos.email} onChange={cambia}
                autoComplete="email" required />
            </div>

            <div className="field ancho">
              <label htmlFor="mensaje">¿Qué tienes en mente? <span>(opcional)</span></label>
              <textarea id="mensaje" name="mensaje" value={datos.mensaje} onChange={cambia}
                placeholder="Qué te gustaría conseguir, si tienes ya alguna idea de contrapartida, si prefieres que te llamemos…" />
            </div>
          </div>

          {/* trampa para robots: fuera de pantalla y fuera del recorrido del tabulador */}
          <div className="trampa" aria-hidden="true">
            <label htmlFor="apodo">No rellenes este campo</label>
            <input id="apodo" name="apodo" type="text" tabIndex={-1} autoComplete="off"
              value={datos.apodo} onChange={cambia} />
          </div>

          <label className="consent">
            <input type="checkbox" checked={consentimiento} required
              onChange={(e) => setConsentimiento(e.target.checked)} />
            <span>
              Autorizo al Club Voleibol Oviedo a usar estos datos para ponerse en contacto conmigo. No se usan
              para nada más ni se ceden a terceros. *
            </span>
          </label>

          <button className="btn solid" type="submit" disabled={estado === 'enviando'}>
            {estado === 'enviando' ? 'Enviando…' : 'Enviar solicitud →'}
          </button>

          <p className="letra-pequena">
            * Campos obligatorios. También puedes escribir directamente a{' '}
            <a href={`mailto:${club.emailPatrocinio}`}>{club.emailPatrocinio}</a>.
          </p>
        </form>
      </section>
    </>
  )
}

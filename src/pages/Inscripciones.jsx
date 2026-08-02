import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHead from '../components/PageHead'
import SectionHead from '../components/SectionHead'
import {
  club,
  formularioInscripcionUrl,
  opcionesInscripcion,
  posicionesInscripcion,
} from '../data/contenido'

const VACIO = {
  jugador: '',
  nacimiento: '',
  tutor: '',
  telefono: '',
  email: '',
  equipo: opcionesInscripcion[0],
  posicion: posicionesInscripcion[0],
  comentarios: '',
  web: '', // trampa para robots: oculta, una persona nunca la rellena
}

export default function Inscripciones() {
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
      const r = await fetch('/api/inscripcion', {
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
        // el envío aún no está enchufado: en vez de tragarse la solicitud, se
        // le dan a la familia el teléfono y el correo del club
        setEstado('sinConectar')
      } else {
        setEstado('error')
      }
    } catch (err) {
      // sin red o servidor caído: se avisa con el teléfono y el correo del club,
      // pero el motivo queda en consola para poder diagnosticarlo
      console.error('No se pudo contactar con /api/inscripcion:', err.message)
      setEstado('sinConectar')
    }
  }

  return (
    <>
      <PageHead
        crumbs={<><Link to="/">Inicio</Link> · Inscripciones</>}
        kicker="Temporada 2026/27"
        title="Inscripciones"
        sub="Apuntarse al CV Oviedo empieza siempre igual: rellenas el formulario, te decimos con qué equipo entrena y os esperamos en el pabellón."
        bg="/media/hero-saque.jpg"
        foco="center 54%"
      />

      <section className="sec">
        <SectionHead title="Cómo funciona" />
        <div className="steps">
          <div className="step">
            <div className="num">1</div>
            <h3>Rellena el formulario</h3>
            <p>Nos cuentas la edad y el nombre del futuro jugador o jugadora, y te asignamos el equipo que le
              corresponde por año de nacimiento y nivel.</p>
          </div>
          <div className="step">
            <div className="num">2</div>
            <h3>Primer entrenamiento</h3>
            <p>Te decimos qué día y a qué hora entrena su grupo, y viene a conocer al equipo. Solo hace falta
              ropa cómoda y ganas de moverse.</p>
          </div>
          {/* Antes ponía «si engancha, se completa la inscripción». Se quitó el
              30-07-2026: daba a entender que hay un periodo de prueba y que uno
              se queda solo si le gusta, y eso no es así. Se habla luego, caso
              por caso, con la familia. */}
          <div className="step">
            <div className="num">3</div>
            <h3>Formalización</h3>
            <p>Se completa la inscripción y la ficha federativa, y ya forma parte del club para toda la
              temporada.</p>
          </div>
        </div>
      </section>

      <div className="band">
        <section className="sec">
          <SectionHead title="Qué llevar el primer día" />
          <div className="checklist">
            <ul>
              <li>Ropa cómoda de deporte y calzado deportivo (no hace falta calzado específico de voleibol)</li>
              <li>Botella de agua</li>
              <li>No es necesario traer equipación ni material del club</li>
              <li>Para menores de edad, un adulto debe acompañar el primer día</li>
            </ul>
          </div>
        </section>
      </div>

      <section className="sec" id="formulario">
        <SectionHead title="Formulario de inscripción" />

        {/* Las inscripciones se hacen en el Google Form del club (02-08-2026).
            Se enlaza, no se incrusta: el formulario pide iniciar sesión en
            Google y esa pantalla no funciona dentro de un <iframe>. Ver la nota
            de `formularioInscripcionUrl` en contenido.js. */}
        {formularioInscripcionUrl ? (
          <div className="form-externo">
            <p>
              La inscripción se hace en el formulario del club, alojado en Google. Se abre en una pestaña nueva y,
              al enviarlo, la solicitud nos llega directamente.
            </p>
            <a className="btn solid" href={formularioInscripcionUrl} target="_blank" rel="noreferrer">
              Abrir el formulario de inscripción →
            </a>
            <p className="letra-pequena">
              El formulario puede pedirte que inicies sesión con una cuenta de Google. Si no tienes o prefieres no
              usarla, llámanos al{' '}
              <a href={`tel:+34${club.telefono.replace(/\s/g, '')}`}>{club.telefono}</a> o escríbenos a{' '}
              <a href={`mailto:${club.email}`}>{club.email}</a> y te apuntamos igual.
            </p>
          </div>
        ) : (
        <form className="form inscripcion" onSubmit={envia}>
          {estado === 'ok' && (
            <div className="notice bien">
              <b>Solicitud enviada.</b> Nos ponemos en contacto contigo para decirte qué día y a qué hora entrena
              su grupo.
            </div>
          )}
          {estado === 'sinConectar' && (
            <div className="notice aviso">
              <b>El envío automático todavía no está activado.</b> Para no hacerte perder el tiempo: escríbenos a{' '}
              <a href={`mailto:${club.email}`}>{club.email}</a> o llama al{' '}
              <a href={`tel:+34${club.telefono.replace(/\s/g, '')}`}>{club.telefono}</a> y te apuntamos igual.
            </div>
          )}
          {estado === 'error' && (
            <div className="notice aviso">
              No hemos podido enviar la solicitud. Inténtalo de nuevo en un momento o escríbenos a{' '}
              <a href={`mailto:${club.email}`}>{club.email}</a>.
            </div>
          )}

          <div className="campos">
            <div className="field ancho">
              <label htmlFor="jugador">Nombre y apellidos del jugador o jugadora *</label>
              <input id="jugador" name="jugador" type="text" value={datos.jugador} onChange={cambia}
                autoComplete="name" required />
            </div>

            <div className="field">
              <label htmlFor="nacimiento">Fecha de nacimiento *</label>
              <input id="nacimiento" name="nacimiento" type="date" value={datos.nacimiento} onChange={cambia}
                max="2026-12-31" required />
            </div>

            <div className="field">
              <label htmlFor="equipo">Equipo que le interesa</label>
              <select id="equipo" name="equipo" value={datos.equipo} onChange={cambia}>
                {opcionesInscripcion.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="posicion">Posición <span>(si ya juega)</span></label>
              <select id="posicion" name="posicion" value={datos.posicion} onChange={cambia}>
                {posicionesInscripcion.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="tutor">Padre, madre o tutor <span>(si es menor)</span></label>
              <input id="tutor" name="tutor" type="text" value={datos.tutor} onChange={cambia} />
            </div>

            <div className="field">
              <label htmlFor="telefono">Teléfono de contacto *</label>
              <input id="telefono" name="telefono" type="tel" value={datos.telefono} onChange={cambia}
                autoComplete="tel" required />
            </div>

            <div className="field">
              <label htmlFor="email">Email *</label>
              <input id="email" name="email" type="email" value={datos.email} onChange={cambia}
                autoComplete="email" required />
            </div>

            <div className="field ancho">
              <label htmlFor="comentarios">¿Algo que debamos saber? <span>(opcional)</span></label>
              <textarea id="comentarios" name="comentarios" value={datos.comentarios} onChange={cambia}
                placeholder="Si ha jugado antes, si viene con alguna amiga, horarios que os vienen mal…" />
            </div>
          </div>

          {/* trampa para robots: fuera de pantalla y fuera del recorrido del tabulador */}
          <div className="trampa" aria-hidden="true">
            <label htmlFor="web">No rellenes este campo</label>
            <input id="web" name="web" type="text" tabIndex={-1} autoComplete="off"
              value={datos.web} onChange={cambia} />
          </div>

          <label className="consent">
            <input type="checkbox" checked={consentimiento} required
              onChange={(e) => setConsentimiento(e.target.checked)} />
            <span>
              Autorizo al Club Voleibol Oviedo a usar estos datos para ponerse en contacto conmigo y gestionar la
              inscripción. No se usan para nada más ni se ceden a terceros. *
            </span>
          </label>

          <button className="btn solid" type="submit" disabled={estado === 'enviando'}>
            {estado === 'enviando' ? 'Enviando…' : 'Enviar solicitud →'}
          </button>

          <p className="letra-pequena">
            * Campos obligatorios. Solo pedimos lo imprescindible para poder llamarte y asignar grupo: el DNI, la
            ficha federativa y la autorización de imagen se rellenan en persona el día que se formaliza la
            inscripción.
          </p>
        </form>
        )}
      </section>
    </>
  )
}

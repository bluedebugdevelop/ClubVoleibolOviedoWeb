import { useState } from 'react'
import Crest from './Crest'

/* ---------------------------------------------------------------------------
   La pantalla de entrar, compartida por /panel y /club.

   Estaba dentro de Panel.jsx y se sacó aquí al añadir el área del club: son la
   misma puerta con distinto destino, y tener dos copias significaba que
   arreglar el ojo de la contraseña en una dejaba la otra a medias.

   Lo único que cambia entre las dos es a qué URL se manda y qué pone debajo del
   título. El aspecto —el azul del club, el escudo, el grano— es el mismo a
   propósito: quien entra tiene que ver que sigue en la web del club y no en una
   pantalla de sistema pegada por detrás.
   --------------------------------------------------------------------------- */
export default function EntrarCaja({ titulo, sub, endpoint, onEntrado, pie }) {
  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [verClave, setVerClave] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, clave }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok || !d.ok) {
        throw new Error(
          d.quedan === 0
            ? 'Usuario o contraseña incorrectos. Se han agotado los intentos.'
            : d.error || 'No se pudo entrar',
        )
      }
      await onEntrado()
    } catch (err) {
      setError(err.message)
      setClave('')
      setEnviando(false)
    }
  }

  return (
    <div className="entrar">
      {/* Mismo azul y mismo grano que la portada: esto es del club, no una
          pantalla de sistema pegada a la web. */}
      <div className="entrar-grano" aria-hidden="true"></div>

      <form className="entrar-caja" onSubmit={enviar}>
        <Crest className="entrar-escudo" />

        <div className="entrar-titulo">
          <span>Club Voleibol Oviedo</span>
          <h1>{titulo}</h1>
        </div>

        <p className="entrar-sub">{sub}</p>

        {error && (
          <p className="entrar-error" role="alert">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7.5v5.5M12 16.2v.3" />
            </svg>
            <span>{error}</span>
          </p>
        )}

        <label>
          <span>Usuario</span>
          <input
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoComplete="username"
            autoFocus
            required
          />
        </label>

        <label>
          <span>Contraseña</span>
          <div className="entrar-clave">
            <input
              type={verClave ? 'text' : 'password'}
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              autoComplete="current-password"
              required
            />
            {/* Con una contraseña larga y aleatoria, escribirla a ciegas es
                pedir un fallo. El ojo la enseña mientras se comprueba. */}
            <button
              type="button"
              onClick={() => setVerClave((v) => !v)}
              aria-label={verClave ? 'Ocultar la contraseña' : 'Ver la contraseña'}
              title={verClave ? 'Ocultar' : 'Ver'}
            >
              {verClave ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <path d="M3 3l18 18" />
                  <path d="M10.6 10.7a2 2 0 0 0 2.8 2.8" />
                  <path d="M9.4 5.3A9.7 9.7 0 0 1 12 5c5 0 9 4.5 9 7 0 .9-.7 2.2-1.9 3.4M6.3 6.7C4.1 8.2 3 10.2 3 12c0 2.5 4 7 9 7 1.3 0 2.4-.2 3.4-.7" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <path d="M3 12s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7z" />
                  <circle cx="12" cy="12" r="2.6" />
                </svg>
              )}
            </button>
          </div>
        </label>

        <button type="submit" className="entrar-btn" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>

        {/* Para quien ha llegado a la puerta que no era. No dice si una cuenta
            existe ni de qué tipo es: es el mismo texto para todo el mundo. */}
        {pie && <p className="entrar-pie">{pie}</p>}

        {/* Ni /panel ni /club pintan la barra del club, así que sin esto quien
            llegue por error se queda sin salida que no sea el botón de atrás. */}
        <a className="entrar-volver" href="/">← Volver a la web</a>
      </form>
    </div>
  )
}

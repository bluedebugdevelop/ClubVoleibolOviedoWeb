import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import NoEncontrado from './NoEncontrado'
import useSeo from '../seo'

/* ---------------------------------------------------------------------------
   Área del club. Vive en /club.

   Para qué: entrenadores y delegados mandaban por WhatsApp «publica esto» con
   unas fotos sueltas. Aquí lo mismo queda escrito, con prioridad y fecha, y en
   un sitio donde luego se puede tratar en bloque.

   Quien entra aquí NO puede tocar la web. Solo dejar peticiones. El corte está
   en `api/panel.js`, que exige rol de administración.

   Las cuentas las crea Diego desde el panel: una por persona.
   --------------------------------------------------------------------------- */

const PRIORIDADES = [
  { valor: 'alta', etiqueta: 'Urgente', pista: 'Hoy o mañana' },
  { valor: 'normal', etiqueta: 'Normal', pista: 'Esta semana' },
  { valor: 'baja', etiqueta: 'Cuando puedas', pista: 'Sin prisa' },
]

const VACIA = { texto: '', prioridad: 'normal', paraCuando: '', equipo: '', fotos: [] }

export default function Club() {
  // comprobando · nohay · fuera · dentro
  const [estado, setEstado] = useState('comprobando')
  const [sesion, setSesion] = useState(null)
  const [mias, setMias] = useState([])

  useSeo({
    title: 'Área del club',
    description: 'Acceso para el equipo del Club Voleibol Oviedo.',
    noindex: true,
  })

  const cargarMias = useCallback(async () => {
    const r = await fetch('/api/club/mias')
    if (!r.ok) return
    const d = await r.json().catch(() => ({}))
    setMias(d.peticiones ?? [])
  }, [])

  const comprobar = useCallback(async () => {
    const r = await fetch('/api/club/sesion')
    if (r.status === 404) return setEstado('nohay')
    if (!r.ok) return setEstado('fuera')
    setSesion(await r.json())
    setEstado('dentro')
    cargarMias()
  }, [cargarMias])

  useEffect(() => {
    comprobar().catch(() => setEstado('fuera'))
  }, [comprobar])

  if (estado === 'comprobando') return null
  // sin el panel montado en el servidor no hay cuentas que valgan: se comporta
  // como una dirección que no existe, igual que /panel
  if (estado === 'nohay') return <NoEncontrado />
  /* la puerta es /acceso, común con el panel: allí se escribe la cuenta y el
     servidor decide dónde va. Si quien llega aquí resulta ser el admin, /acceso
     lo devuelve a /panel, así que no hay bucle. */
  if (estado === 'fuera') return <Navigate to="/acceso" replace />

  return (
    <div className="panel">
      <header className="panel-top">
        <div>
          <b>Área del club</b>
          <span>Hola, {sesion.nombre}</span>
        </div>
        <button
          type="button"
          className="panel-salir"
          onClick={async () => {
            await fetch('/api/club/salir', { method: 'POST' })
            window.location.href = '/'
          }}
        >
          Salir
        </button>
      </header>

      {/* Mientras use la contraseña temporal no ve nada más. El servidor lo
          impone igual (api/club.js devuelve 403), así que esto no es la
          cerradura: es no enseñar una puerta que no se abre. */}
      {sesion.debeCambiar ? (
        <Estrenar sesion={sesion} onPuesta={comprobar} />
      ) : (
        <>
          <Formulario sesion={sesion} onEnviada={cargarMias} />
          <Mias peticiones={mias} />
        </>
      )}
    </div>
  )
}

/* --------------------------------------------------------------------------
   Primera vez: poner una contraseña propia.

   La que le llegó por WhatsApp la ha visto Diego, ha viajado por un chat y
   probablemente siga ahí escrita. Sirve para entrar una vez, no para quedarse.
   -------------------------------------------------------------------------- */
function Estrenar({ sesion, onPuesta }) {
  const [clave, setClave] = useState('')
  const [repetida, setRepetida] = useState('')
  const [ver, setVer] = useState(false)
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const corta = clave.length > 0 && clave.length < sesion.minimoClave
  const distintas = repetida.length > 0 && clave !== repetida
  const listo = clave.length >= sesion.minimoClave && clave === repetida && !enviando

  async function enviar(e) {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      const r = await fetch('/api/club/clave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clave }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok || !d.ok) throw new Error(d.error || 'No se pudo cambiar')
      await onPuesta()
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  return (
    <section className="panel-sec">
      <div className="panel-sec-top">
        <h2>Pon tu contraseña</h2>
      </div>
      <p className="panel-ayuda">
        La que te dieron es temporal y la ha visto más gente. Elige la tuya y ya no hace
        falta acordarse de la otra. Mínimo {sesion.minimoClave} caracteres.
      </p>

      {error && <p className="panel-aviso mal" role="alert">{error}</p>}

      <form className="club-form club-estrena" onSubmit={enviar}>
        <label>
          <span>Tu contraseña nueva</span>
          <input
            type={ver ? 'text' : 'password'}
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            autoComplete="new-password"
            autoFocus
            required
          />
        </label>

        <label>
          <span>Otra vez, para confirmar</span>
          <input
            type={ver ? 'text' : 'password'}
            value={repetida}
            onChange={(e) => setRepetida(e.target.value)}
            autoComplete="new-password"
            required
          />
        </label>

        <label className="club-ver">
          <input type="checkbox" checked={ver} onChange={(e) => setVer(e.target.checked)} />
          <span>Verlas mientras escribo</span>
        </label>

        {/* el aviso sale al escribir, no al enviar: corregir sobre la marcha es
            menos frustrante que darle a un botón y que te lo rechacen */}
        {corta && <p className="club-pista">Te faltan {sesion.minimoClave - clave.length} caracteres.</p>}
        {distintas && <p className="club-pista">Las dos no coinciden.</p>}

        <button type="submit" className="panel-btn primario" disabled={!listo}>
          {enviando ? 'Guardando…' : 'Guardar y entrar'}
        </button>
      </form>
    </section>
  )
}

/* --------------------------------------------------------------------------
   El formulario.

   Las fotos se suben EN CUANTO se eligen, no al enviar. Así quien manda cinco
   fotos desde el móvil ve que van entrando y no se queda mirando un botón
   pensando que se ha colgado.
   -------------------------------------------------------------------------- */
function Formulario({ sesion, onEnviada }) {
  const [datos, setDatos] = useState(VACIA)
  const [aviso, setAviso] = useState(null)
  const [subiendo, setSubiendo] = useState(0)
  const [enviando, setEnviando] = useState(false)
  const fichero = useRef(null)

  const poner = (clave, valor) => setDatos((d) => ({ ...d, [clave]: valor }))

  async function subir(lista) {
    const sitio = sesion.maxFotos - datos.fotos.length
    const elegidas = [...lista].slice(0, Math.max(0, sitio))
    if (elegidas.length < lista.length) {
      setAviso({ tipo: 'mal', texto: `Como mucho ${sesion.maxFotos} fotos por petición.` })
    }

    for (const f of elegidas) {
      if (!sesion.tiposImagen.includes(f.type)) {
        setAviso({ tipo: 'mal', texto: `"${f.name}" no es una imagen válida. Usa JPG, PNG o WebP.` })
        continue
      }
      if (f.size > sesion.limiteImagen) {
        const mb = Math.round(sesion.limiteImagen / 1024 / 1024)
        setAviso({ tipo: 'mal', texto: `"${f.name}" pesa demasiado (máximo ${mb} MB).` })
        continue
      }
      setSubiendo((n) => n + 1)
      try {
        const r = await fetch('/api/club/imagen', {
          method: 'POST',
          headers: { 'Content-Type': f.type, 'X-Nombre': encodeURIComponent(f.name).slice(0, 120) },
          body: f,
        })
        const d = await r.json().catch(() => ({}))
        if (!r.ok || !d.ok) throw new Error(d.error || 'No se pudo subir')
        setDatos((prev) => ({ ...prev, fotos: [...prev.fotos, d.ruta] }))
      } catch (e) {
        setAviso({ tipo: 'mal', texto: e.message })
      } finally {
        setSubiendo((n) => n - 1)
      }
    }
    if (fichero.current) fichero.current.value = ''
  }

  async function enviar(e) {
    e.preventDefault()
    setEnviando(true)
    setAviso({ tipo: 'espera', texto: 'Enviando…' })
    try {
      const r = await fetch('/api/club/peticion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      })
      const d = await r.json().catch(() => ({}))
      if (r.status === 401) throw new Error('Se ha cerrado la sesión. Vuelve a entrar.')
      if (!r.ok || !d.ok) throw new Error(d.error || 'No se pudo enviar')
      setDatos(VACIA)
      setAviso({ tipo: 'bien', texto: 'Enviada. Le llega el aviso al momento.' })
      onEnviada()
    } catch (err) {
      setAviso({ tipo: 'mal', texto: err.message })
    } finally {
      setEnviando(false)
    }
  }

  const listo = datos.texto.trim().length >= 10 && subiendo === 0 && !enviando

  return (
    <section className="panel-sec">
      <div className="panel-sec-top">
        <h2>Pedir una publicación</h2>
      </div>
      <p className="panel-ayuda">
        Cuenta de qué va y adjunta las fotos. Cuanto más concreto, menos preguntas después:
        qué equipo, contra quién, cómo quedó.
      </p>

      {aviso && <p className={`panel-aviso ${aviso.tipo}`} role="status">{aviso.texto}</p>}

      <form className="club-form" onSubmit={enviar}>
        <label>
          <span>¿De qué va?</span>
          <textarea
            rows={5}
            value={datos.texto}
            maxLength={sesion.maxTexto}
            onChange={(e) => poner('texto', e.target.value)}
            placeholder="Ej: El cadete femenino ganó 3-1 al Avilés el sábado en casa. Fue el primer partido de Lucía como titular."
            required
          />
          <i className="club-cuenta">{datos.texto.length}/{sesion.maxTexto}</i>
        </label>

        <div className="club-fila">
          <label>
            <span>Prioridad</span>
            <div className="club-prioridad">
              {PRIORIDADES.map((p) => (
                <button
                  type="button"
                  key={p.valor}
                  className={p.valor}
                  aria-pressed={datos.prioridad === p.valor}
                  onClick={() => poner('prioridad', p.valor)}
                >
                  <b>{p.etiqueta}</b>
                  <i>{p.pista}</i>
                </button>
              ))}
            </div>
          </label>

          <label>
            <span>¿Para cuándo? <i>(opcional)</i></span>
            <input
              type="date"
              value={datos.paraCuando}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => poner('paraCuando', e.target.value)}
            />
          </label>

          <label>
            <span>Equipo <i>(opcional)</i></span>
            <input
              value={datos.equipo}
              maxLength={60}
              onChange={(e) => poner('equipo', e.target.value)}
              placeholder="Cadete femenino"
            />
          </label>
        </div>

        <div className="club-fotos">
          <div className="club-fotos-top">
            <span>Fotos <i>{datos.fotos.length}/{sesion.maxFotos}</i></span>
            <button
              type="button"
              className="panel-btn"
              disabled={datos.fotos.length >= sesion.maxFotos || subiendo > 0}
              onClick={() => fichero.current?.click()}
            >
              {subiendo > 0 ? `Subiendo ${subiendo}…` : 'Añadir fotos'}
            </button>
            <input
              ref={fichero}
              type="file"
              accept={sesion.tiposImagen.join(',')}
              multiple
              hidden
              onChange={(e) => subir(e.target.files)}
            />
          </div>

          {datos.fotos.length > 0 && (
            <ul className="club-miniaturas">
              {datos.fotos.map((ruta) => (
                <li key={ruta}>
                  <img src={ruta} alt="" />
                  <button
                    type="button"
                    aria-label="Quitar esta foto"
                    onClick={() => poner('fotos', datos.fotos.filter((f) => f !== ruta))}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Esto no es letra pequeña de compromiso: muchas de estas fotos son de
            menores y quien las sube tiene que saber dónde acaban. */}
        <p className="club-privacidad">
          Las fotos se guardan en el servidor del club y las ve solo quien lleva las redes.
          Se borran cuando la petición se marca como hecha o descartada. No subas fotos de
          menores sin permiso de sus familias.
        </p>

        <button type="submit" className="panel-btn primario" disabled={!listo}>
          {enviando ? 'Enviando…' : 'Enviar petición'}
        </button>
      </form>
    </section>
  )
}

/* Lo que ha mandado esta cuenta, para que nadie repita una petición pensando
   que la primera no llegó. */
function Mias({ peticiones }) {
  if (peticiones.length === 0) return null

  const COMO_SE_LEE = { nueva: 'Pendiente', hecha: 'Publicada', descartada: 'Descartada' }

  return (
    <section className="panel-sec">
      <div className="panel-sec-top">
        <h2>Lo que has mandado</h2>
      </div>
      <ol className="club-mias">
        {peticiones.map((p) => (
          <li key={p.id} className={p.estado}>
            <div>
              <b>{p.texto.slice(0, 110)}{p.texto.length > 110 ? '…' : ''}</b>
              <span>
                {new Date(p.creada).toLocaleDateString('es-ES', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
                {p.fotos.length > 0 && ` · ${p.fotos.length} foto${p.fotos.length > 1 ? 's' : ''}`}
              </span>
            </div>
            <i>{COMO_SE_LEE[p.estado] || p.estado}</i>
          </li>
        ))}
      </ol>
    </section>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import NoEncontrado from './NoEncontrado'
import RecorteImagen from '../components/RecorteImagen'
import { FORMATOS } from '../components/formatosImagen'

/* ---------------------------------------------------------------------------
   Panel de administración del club. Vive en /panel.

   Se entra con usuario y contraseña. La puerta es el candado gris de la barra
   de navegación: discreto, sin texto, para que no compita con el resto del menú
   pero esté a mano de quien tiene que publicar.

   La contraseña no está en el código ni en las variables del servidor: allí solo
   hay su huella. Ver `api/_acceso.js` y `scripts/clave.mjs`.

   Si el panel no está montado en el servidor (faltan las variables), esta página
   se comporta como una dirección que no existe: no tiene sentido enseñar un
   formulario que no puede funcionar.
   --------------------------------------------------------------------------- */

const VACIA_NOTICIA = {
  destacada: false, categoria: '', fecha: '', titulo: '', resumen: '',
  img: '', foco: '', cuerpo: [], cta: '',
}

const VACIO_PATROCINADOR = {
  slug: '', nombre: '', logo: '', foto: '', tagline: '', web: '', webTexto: '',
  color: '#1560bd', descripcion: '', parrafos: [],
}

const VACIO_EQUIPO = {
  slug: '', zona: 'cantera', enPortada: false, nombre: '', categoria: '', liga: '',
  img: '', alt: '', resumen: '', crumb: '', kicker: '', sub: '',
  headerImg: '', headerFoco: 'center 12%',
  datos: [], squad: [], staff: [], join: { title: '', text: '' },
}

const hoy = () =>
  new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
    .replace('.', '')

const SECCIONES = ['noticias', 'patrocinadores', 'equipos']

export default function Panel() {
  // comprobando · nopanel · fuera · dentro
  const [estado, setEstado] = useState('comprobando')
  const [sesion, setSesion] = useState(null)
  const [pestana, setPestana] = useState('noticias')
  const [listas, setListas] = useState({ noticias: [], patrocinadores: [], equipos: [] })
  const [aviso, setAviso] = useState(null)

  const cargar = useCallback((d) => {
    setSesion(d)
    setListas({ noticias: d.noticias ?? [], patrocinadores: d.patrocinadores ?? [], equipos: d.equipos ?? [] })
    setEstado('dentro')
  }, [])

  const comprobar = useCallback(async () => {
    const r = await fetch('/api/panel/sesion')
    if (r.status === 404) return setEstado('nopanel')
    if (!r.ok) return setEstado('fuera')
    cargar(await r.json())
  }, [cargar])

  useEffect(() => {
    comprobar().catch(() => setEstado('fuera'))
  }, [comprobar])

  const ponerLista = (clave, valor) =>
    setListas((l) => ({ ...l, [clave]: typeof valor === 'function' ? valor(l[clave]) : valor }))

  async function guardar(clave) {
    setAviso({ tipo: 'espera', texto: 'Guardando…' })
    try {
      const r = await fetch(`/api/panel/${clave}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [clave]: listas[clave] }),
      })
      const d = await r.json().catch(() => ({}))
      if (r.status === 401) throw new Error('Se ha cerrado la sesión. Vuelve a entrar.')
      if (!r.ok || !d.ok) throw new Error(d.error || 'No se pudo guardar')
      // se recoge lo que devuelve el servidor, ya limpio: así se ve al momento
      // si algo se ha descartado o corregido al validarlo
      ponerLista(clave, d[clave])
      setAviso({ tipo: 'bien', texto: 'Guardado. Ya está publicado en la web.' })
    } catch (e) {
      setAviso({ tipo: 'mal', texto: e.message })
    }
  }

  if (estado === 'comprobando') return null
  if (estado === 'nopanel') return <NoEncontrado />
  if (estado === 'fuera') return <Entrar onDentro={cargar} />

  const equiposPortada = listas.equipos.filter((e) => e.enPortada).length

  return (
    <div className="panel">
      <header className="panel-top">
        <div>
          <b>Panel del club</b>
          <span>Hola, {sesion.nombre}</span>
        </div>
        <div className="panel-tabs">
          {SECCIONES.map((s) => (
            <button key={s} type="button" aria-pressed={pestana === s} onClick={() => setPestana(s)}>
              {s} <i>{listas[s].length}</i>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="panel-salir"
          onClick={async () => {
            await fetch('/api/panel/salir', { method: 'POST' })
            window.location.href = '/'
          }}
        >
          Salir
        </button>
      </header>

      {!sesion.persistente && (
        <div className="panel-alarma">
          <b>Ojo: lo que publiques aquí se perderá en el próximo despliegue.</b> No hay disco
          permanente montado. Hay que añadir un <i>Volume</i> en Railway con la ruta <code>/data</code>.
        </div>
      )}

      {aviso && <div className={`panel-aviso ${aviso.tipo}`}>{aviso.texto}</div>}

      {pestana === 'noticias' && (
        <Lista
          titulo="Noticias"
          ayuda="La primera de la lista es la destacada: sale grande arriba del todo en /noticias y en la portada."
          items={listas.noticias}
          setItems={(v) => ponerLista('noticias', v)}
          nueva={() => ({ ...VACIA_NOTICIA, id: `n-${Date.now().toString(36)}`, fecha: hoy() })}
          etiqueta={(n) => n.titulo || '(sin título)'}
          onGuardar={() => guardar('noticias')}
          Campos={CamposNoticia}
        />
      )}

      {pestana === 'patrocinadores' && (
        <Lista
          titulo="Patrocinadores"
          ayuda="El orden de la lista es el que se ve en la web. Con descripción y párrafos, la marca tiene ficha propia; sin ellos, su logo enlaza directamente a su web."
          items={listas.patrocinadores}
          setItems={(v) => ponerLista('patrocinadores', v)}
          nueva={() => ({ ...VACIO_PATROCINADOR })}
          etiqueta={(p) => p.nombre || '(sin nombre)'}
          onGuardar={() => guardar('patrocinadores')}
          Campos={CamposPatrocinador}
        />
      )}

      {pestana === 'equipos' && (
        <Lista
          titulo="Equipos"
          ayuda={
            `Cada equipo tiene su ficha en /equipos/… Los de «cantera» salen además en la página de Cantera. ` +
            `Marca «sale en la portada» solo en los de categoría nacional: ahora mismo hay ${equiposPortada}.`
          }
          items={listas.equipos}
          setItems={(v) => ponerLista('equipos', v)}
          nueva={() => ({ ...VACIO_EQUIPO })}
          etiqueta={(e) => e.nombre || '(sin nombre)'}
          onGuardar={() => guardar('equipos')}
          Campos={CamposEquipo}
        />
      )}
    </div>
  )
}

/* --------------------------------------------------------------------------
   Pantalla de entrada
   -------------------------------------------------------------------------- */
function Entrar({ onDentro }) {
  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      const r = await fetch('/api/panel/entrar', {
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
      // se vuelve a preguntar por la sesión: así el panel arranca con los datos
      // y el estado del disco, sin duplicar eso en la respuesta del login
      const s = await fetch('/api/panel/sesion')
      onDentro(await s.json())
    } catch (err) {
      setError(err.message)
      setClave('')
      setEnviando(false)
    }
  }

  return (
    <div className="entrar">
      <form className="entrar-caja" onSubmit={enviar}>
        <h1>Acceso del club</h1>
        <p>Para publicar noticias, patrocinadores y equipos.</p>

        {error && <p className="entrar-error">{error}</p>}

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
          <input
            type="password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <button type="submit" className="panel-btn primario" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>

        {/* En /panel no se pinta la barra del club, así que sin esto quien
            llegue por error se queda sin salida que no sea el botón de atrás. */}
        <a className="entrar-volver" href="/">← Volver a la web</a>
      </form>
    </div>
  )
}

/* --------------------------------------------------------------------------
   Lista genérica: sirve igual para las tres secciones. Lo único que cambia
   entre ellas es el formulario de cada elemento (`Campos`).
   -------------------------------------------------------------------------- */
function Lista({ titulo, ayuda, items, setItems, nueva, etiqueta, onGuardar, Campos }) {
  const [abierto, setAbierto] = useState(null)

  const cambiar = (i, campo, valor) =>
    setItems(items.map((el, j) => (j === i ? { ...el, [campo]: valor } : el)))

  const mover = (i, salto) => {
    const j = i + salto
    if (j < 0 || j >= items.length) return
    const copia = [...items]
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
    setItems(copia)
    setAbierto(abierto === i ? j : abierto === j ? i : abierto)
  }

  const borrar = (i) => {
    if (!window.confirm(`¿Borrar «${etiqueta(items[i])}»? No se puede deshacer.`)) return
    setItems(items.filter((_, j) => j !== i))
    setAbierto(null)
  }

  return (
    <section className="panel-sec">
      <div className="panel-sec-top">
        <h2>{titulo}</h2>
        <div>
          <button type="button" className="panel-btn" onClick={() => { setItems([...items, nueva()]); setAbierto(items.length) }}>
            Añadir
          </button>
          <button type="button" className="panel-btn primario" onClick={onGuardar}>
            Guardar y publicar
          </button>
        </div>
      </div>
      <p className="panel-ayuda">{ayuda}</p>

      {items.length === 0 && <p className="panel-vacio">Todavía no hay nada. Pulsa «Añadir».</p>}

      <ol className="panel-lista">
        {items.map((el, i) => (
          <li key={el.id || el.slug || i} className={abierto === i ? 'abierto' : undefined}>
            <div className="fila">
              <button type="button" className="titulo" onClick={() => setAbierto(abierto === i ? null : i)}>
                <span className="num">{i + 1}</span>
                {etiqueta(el)}
              </button>
              <span className="acciones">
                <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Subir">↑</button>
                <button type="button" onClick={() => mover(i, 1)} disabled={i === items.length - 1} aria-label="Bajar">↓</button>
                <button type="button" className="borrar" onClick={() => borrar(i)} aria-label="Borrar">✕</button>
              </span>
            </div>
            {abierto === i && (
              <div className="panel-campos">
                <Campos el={el} cambiar={(campo, valor) => cambiar(i, campo, valor)} />
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

function Campo({ etiqueta, children, ancho }) {
  return (
    <label className={`panel-campo${ancho ? ' ancho' : ''}`}>
      <span>{etiqueta}</span>
      {children}
    </label>
  )
}

/** Casilla de sí/no. No usa `Campo` porque la etiqueta va DETRÁS de la casilla. */
function Casilla({ etiqueta, valor, onCambio, ayuda }) {
  return (
    <div className="panel-campo ancho panel-casilla">
      <label>
        <input type="checkbox" checked={valor === true} onChange={(e) => onCambio(e.target.checked)} />
        <b>{etiqueta}</b>
      </label>
      {ayuda && <em>{ayuda}</em>}
    </div>
  )
}

/** Textarea de párrafos: uno por línea en blanco, que es como se escriben. */
function Parrafos({ etiqueta, valor, onCambio, filas = 6, placeholder }) {
  return (
    <Campo etiqueta={etiqueta} ancho>
      <textarea
        value={(valor || []).join('\n\n')}
        onChange={(e) => onCambio(e.target.value.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean))}
        rows={filas}
        placeholder={placeholder}
      />
    </Campo>
  )
}

function CamposNoticia({ el, cambiar }) {
  return (
    <>
      <Campo etiqueta="Título" ancho>
        <input value={el.titulo || ''} onChange={(e) => cambiar('titulo', e.target.value)} />
      </Campo>
      <Campo etiqueta="Categoría">
        <input value={el.categoria || ''} onChange={(e) => cambiar('categoria', e.target.value)}
          placeholder="Cantera, Superliga 2 Masculino…" />
      </Campo>
      <Campo etiqueta="Fecha">
        <input value={el.fecha || ''} onChange={(e) => cambiar('fecha', e.target.value)} placeholder="10 ago 2026" />
      </Campo>
      <Campo etiqueta="Resumen" ancho>
        <textarea value={el.resumen || ''} onChange={(e) => cambiar('resumen', e.target.value)} rows={3} />
      </Campo>
      {/* Sin texto completo la noticia se queda en tarjeta del listado, sin
          página propia. Es válido para un aviso corto, pero conviene decirlo. */}
      <Parrafos
        etiqueta="Texto completo (un párrafo por línea en blanco)"
        valor={el.cuerpo}
        onCambio={(v) => cambiar('cuerpo', v)}
        filas={8}
        placeholder="Si lo dejas vacío, la noticia sale en el listado pero no tendrá página propia para abrirla."
      />
      <SubirImagen formato={FORMATOS.noticia} valor={el.img} onCambio={(r) => cambiar('img', r)} />
      <Campo etiqueta="Enlace del botón" ancho>
        <select value={el.cta || ''} onChange={(e) => cambiar('cta', e.target.value)}>
          <option value="">Sin botón</option>
          <option value="preinscripcion">Botón de preinscripción</option>
        </select>
      </Campo>
    </>
  )
}

function CamposPatrocinador({ el, cambiar }) {
  return (
    <>
      <Campo etiqueta="Nombre">
        <input value={el.nombre || ''} onChange={(e) => cambiar('nombre', e.target.value)} />
      </Campo>
      <Campo etiqueta="Lema">
        <input value={el.tagline || ''} onChange={(e) => cambiar('tagline', e.target.value)}
          placeholder="Qué hace, en una línea" />
      </Campo>
      <Campo etiqueta="Web">
        <input value={el.web || ''} onChange={(e) => cambiar('web', e.target.value)} placeholder="https://…" />
      </Campo>
      <Campo etiqueta="Web (texto visible)">
        <input value={el.webTexto || ''} onChange={(e) => cambiar('webTexto', e.target.value)}
          placeholder="suempresa.com" />
      </Campo>
      <Campo etiqueta="Color de marca">
        <input type="color" value={el.color || '#1560bd'} onChange={(e) => cambiar('color', e.target.value)} />
      </Campo>
      <Campo etiqueta="Descripción corta" ancho>
        <textarea value={el.descripcion || ''} onChange={(e) => cambiar('descripcion', e.target.value)} rows={2} />
      </Campo>
      <Parrafos
        etiqueta="Texto de la ficha (un párrafo por línea en blanco)"
        valor={el.parrafos}
        onCambio={(v) => cambiar('parrafos', v)}
        filas={5}
      />
      <SubirImagen formato={FORMATOS.logo} valor={el.logo} onCambio={(r) => cambiar('logo', r)} />
      <SubirImagen formato={FORMATOS.cabecera} valor={el.foto} onCambio={(r) => cambiar('foto', r)} />
    </>
  )
}

function CamposEquipo({ el, cambiar }) {
  /* La foto de la tarjeta se recorta distinto según dónde salga: cuadrada en la
     página de Cantera, vertical en la portada. Es el mismo campo, así que el
     encuadre que se pide depende de lo que esté marcado ahora mismo. */
  const formatoFoto = el.enPortada ? FORMATOS.equipoPortada : FORMATOS.equipoCantera

  return (
    <>
      <Campo etiqueta="Nombre">
        <input value={el.nombre || ''} onChange={(e) => cambiar('nombre', e.target.value)}
          placeholder="Cadete Femenino A" />
      </Campo>
      <Campo etiqueta="Dónde cuelga la ficha">
        <select value={el.zona || 'cantera'} onChange={(e) => cambiar('zona', e.target.value)}>
          <option value="cantera">Cantera (sale en /cantera)</option>
          <option value="nacional">Categoría nacional</option>
        </select>
      </Campo>
      <Campo etiqueta="Categoría">
        <input value={el.categoria || ''} onChange={(e) => cambiar('categoria', e.target.value)}
          placeholder="Sub-15, Competición nacional…" />
      </Campo>
      <Campo etiqueta="Liga">
        <input value={el.liga || ''} onChange={(e) => cambiar('liga', e.target.value)}
          placeholder="Liga Asturiana" />
      </Campo>

      <Casilla
        etiqueta="Sale en la portada"
        valor={el.enPortada}
        onCambio={(v) => cambiar('enPortada', v)}
        ayuda="Entre los accesos grandes de «Nuestros equipos». La foto pasa a pedirse vertical."
      />

      <SubirImagen formato={formatoFoto} valor={el.img} onCambio={(r) => cambiar('img', r)} />
      <Campo etiqueta="Descripción de la foto (para lectores de pantalla)" ancho>
        <input value={el.alt || ''} onChange={(e) => cambiar('alt', e.target.value)}
          placeholder="Equipo cadete femenino A del CV Oviedo" />
      </Campo>
      {el.enPortada && (
        <Campo etiqueta="Texto pequeño de la tarjeta de portada" ancho>
          <input value={el.resumen || ''} onChange={(e) => cambiar('resumen', e.target.value)}
            placeholder="18 jugadores · Grupo B" />
        </Campo>
      )}

      <Campo etiqueta="Línea sobre el título de la ficha" ancho>
        <input value={el.kicker || ''} onChange={(e) => cambiar('kicker', e.target.value)}
          placeholder="Liga Asturiana · Sub-15 · Temporada 2026/27" />
      </Campo>
      <Campo etiqueta="Entradilla de la ficha" ancho>
        <textarea value={el.sub || ''} onChange={(e) => cambiar('sub', e.target.value)} rows={2} />
      </Campo>
      <SubirImagen formato={FORMATOS.cabecera} valor={el.headerImg} onCambio={(r) => cambiar('headerImg', r)} />

      <Filas
        etiqueta="Datos del equipo"
        items={el.datos}
        onCambio={(v) => cambiar('datos', v)}
        vacia={{ label: '', valor: '' }}
        columnas={[
          { campo: 'label', ancho: 1, placeholder: 'Competición' },
          { campo: 'valor', ancho: 2, placeholder: 'Liga Asturiana' },
        ]}
      />

      <Filas
        etiqueta="Plantilla"
        items={el.squad}
        onCambio={(v) => cambiar('squad', v)}
        vacia={{ numero: '', nombre: '', posicion: '' }}
        columnas={[
          { campo: 'numero', ancho: 0, placeholder: 'Nº' },
          { campo: 'nombre', ancho: 2, placeholder: 'Nombre Apellido' },
          { campo: 'posicion', ancho: 1, placeholder: 'Colocadora' },
        ]}
      />

      <Filas
        etiqueta="Cuerpo técnico"
        items={el.staff}
        onCambio={(v) => cambiar('staff', v)}
        vacia={{ nombre: '', rol: '' }}
        columnas={[
          { campo: 'nombre', ancho: 2, placeholder: 'Nombre Apellido' },
          { campo: 'rol', ancho: 1, placeholder: 'Primer entrenador' },
        ]}
      />

      <Campo etiqueta="Llamada del final: título">
        <input value={el.join?.title || ''} onChange={(e) => cambiar('join', { ...el.join, title: e.target.value })}
          placeholder="¿Quieres jugar en el…?" />
      </Campo>
      <Campo etiqueta="Llamada del final: texto">
        <input value={el.join?.text || ''} onChange={(e) => cambiar('join', { ...el.join, text: e.target.value })} />
      </Campo>
    </>
  )
}

/* Tablita para las sublistas de un equipo (datos, plantilla, cuerpo técnico).
   Se hizo genérica porque las tres son lo mismo: unas cuantas filas de campos
   cortos con un botón de quitar y otro de añadir. */
function Filas({ etiqueta, items = [], onCambio, vacia, columnas }) {
  const poner = (i, campo, valor) =>
    onCambio(items.map((f, j) => (j === i ? { ...f, [campo]: valor } : f)))

  return (
    <div className="panel-campo ancho">
      <span>{etiqueta}</span>
      <div className="panel-filas">
        {items.map((fila, i) => (
          <div className="panel-fila" key={i}>
            {columnas.map((c) => (
              <input
                key={c.campo}
                className={`col-${c.ancho}`}
                value={fila[c.campo] ?? ''}
                placeholder={c.placeholder}
                onChange={(e) => poner(i, c.campo, e.target.value)}
              />
            ))}
            <button type="button" aria-label="Quitar" onClick={() => onCambio(items.filter((_, j) => j !== i))}>
              ✕
            </button>
          </div>
        ))}
        <button type="button" className="panel-btn" onClick={() => onCambio([...items, { ...vacia }])}>
          Añadir fila
        </button>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------------------
   Subida de imágenes, con recorte previo.

   Al elegir un fichero NO se sube: se abre `RecorteImagen` con el encuadre que
   pide ese hueco de la web. Lo que se manda al servidor es ya el recorte, del
   tamaño exacto, así que nada sale descuadrado ni se suben fotos de 6 MB.
   -------------------------------------------------------------------------- */
function SubirImagen({ formato, valor, onCambio }) {
  const [porRecortar, setPorRecortar] = useState(null)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState(null)
  const input = useRef(null)

  function elegir(e) {
    const fichero = e.target.files?.[0]
    // el input se limpia siempre: si no, elegir la MISMA foto otra vez no
    // dispararía el evento y parecería que el botón no hace nada
    if (input.current) input.current.value = ''
    if (!fichero) return
    setError(null)
    setPorRecortar(fichero)
  }

  async function subir(blob, tipo) {
    setSubiendo(true)
    try {
      const r = await fetch('/api/panel/imagen', {
        method: 'POST',
        headers: { 'Content-Type': tipo, 'X-Nombre': encodeURIComponent(porRecortar.name) },
        body: blob,
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok || !d.ok) throw new Error(d.error || 'No se pudo subir')
      onCambio(d.ruta)
      setPorRecortar(null)
    } catch (err) {
      setError(err.message)
      setPorRecortar(null)
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div className="panel-campo ancho">
      <span>{formato.titulo}</span>
      <div className="panel-imagen">
        {valor ? (
          <img
            src={valor}
            alt=""
            style={{ aspectRatio: `${formato.ancho} / ${formato.alto}` }}
            className={formato.entero ? 'entero' : undefined}
          />
        ) : (
          <div className="hueco" style={{ aspectRatio: `${formato.ancho} / ${formato.alto}` }}>
            Sin imagen
          </div>
        )}
        <div>
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={elegir}
          />
          <em>{formato.ayuda}</em>
          {subiendo && <em>Subiendo…</em>}
          {error && <em className="mal">{error}</em>}
          {valor && (
            <button type="button" className="panel-btn" onClick={() => onCambio('')}>Quitar</button>
          )}
        </div>
      </div>

      {porRecortar && (
        <RecorteImagen
          fichero={porRecortar}
          formato={formato}
          onListo={subir}
          onCancelar={() => setPorRecortar(null)}
        />
      )}
    </div>
  )
}

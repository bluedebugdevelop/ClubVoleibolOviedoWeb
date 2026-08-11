import { useCallback, useEffect, useRef, useState } from 'react'

/* ---------------------------------------------------------------------------
   Panel de administración. Vive en /panel y NO está enlazado desde ningún sitio
   de la web: ni menú, ni pie, ni mapa del sitio.

   Cómo se entra: el club pasa a cada persona su enlace UNA vez,
   https://…/panel?acceso=SU-TOKEN. Esta página lo canjea por una cookie y borra
   el token de la barra de direcciones, para que no se quede en el historial ni
   se copie sin querer. Después, /panel a secas ya funciona durante 90 días.

   Si no hay cookie ni token válido, la API responde 404 y aquí se enseña la
   misma página de "no encontrada" que cualquier URL inventada: quien husmee no
   debe poder deducir que esto existe.
   --------------------------------------------------------------------------- */

const VACIA_NOTICIA = { destacada: false, categoria: '', fecha: '', titulo: '', resumen: '', img: '' }
const VACIO_PATROCINADOR = {
  slug: '', nombre: '', logo: '', foto: '', tagline: '', web: '', webTexto: '',
  color: '#1560bd', descripcion: '', parrafos: [],
}

const hoy = () =>
  new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
    .replace('.', '')

export default function Panel() {
  const [estado, setEstado] = useState('comprobando') // comprobando · fuera · dentro
  const [sesion, setSesion] = useState(null)
  const [pestana, setPestana] = useState('noticias')
  const [noticias, setNoticias] = useState([])
  const [patrocinadores, setPatrocinadores] = useState([])
  const [aviso, setAviso] = useState(null)

  const cargar = useCallback((d) => {
    setSesion(d)
    setNoticias(d.noticias ?? [])
    setPatrocinadores(d.patrocinadores ?? [])
    setEstado('dentro')
  }, [])

  useEffect(() => {
    const url = new URL(window.location.href)
    const acceso = url.searchParams.get('acceso')

    async function entrar() {
      if (acceso) {
        // se canjea el token por cookie y se limpia la URL en el acto
        const r = await fetch('/api/panel/entrar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ acceso }),
        })
        url.searchParams.delete('acceso')
        window.history.replaceState({}, '', url.pathname + url.search)
        if (!r.ok) return setEstado('fuera')
      }
      const s = await fetch('/api/panel/sesion')
      if (!s.ok) return setEstado('fuera')
      cargar(await s.json())
    }
    entrar().catch(() => setEstado('fuera'))
  }, [cargar])

  async function guardar(clave, lista) {
    setAviso({ tipo: 'espera', texto: 'Guardando…' })
    try {
      const r = await fetch(`/api/panel/${clave}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [clave]: lista }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok || !d.ok) throw new Error(d.error || 'No se pudo guardar')
      if (clave === 'noticias') setNoticias(d.noticias)
      else setPatrocinadores(d.patrocinadores)
      setAviso({ tipo: 'bien', texto: 'Guardado. Ya está publicado en la web.' })
    } catch (e) {
      setAviso({ tipo: 'mal', texto: e.message })
    }
  }

  if (estado === 'comprobando') return null

  // Misma cara que una URL que no existe: no se confirma que el panel esté aquí
  if (estado === 'fuera') {
    return (
      <div className="notfound">
        <h1>Página no encontrada</h1>
        <p>Esta dirección no existe o se ha movido.</p>
      </div>
    )
  }

  return (
    <div className="panel">
      <header className="panel-top">
        <div>
          <b>Panel del club</b>
          <span>Hola, {sesion.nombre}</span>
        </div>
        <div className="panel-tabs">
          <button type="button" aria-pressed={pestana === 'noticias'} onClick={() => setPestana('noticias')}>
            Noticias <i>{noticias.length}</i>
          </button>
          <button
            type="button"
            aria-pressed={pestana === 'patrocinadores'}
            onClick={() => setPestana('patrocinadores')}
          >
            Patrocinadores <i>{patrocinadores.length}</i>
          </button>
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

      {pestana === 'noticias' ? (
        <Lista
          titulo="Noticias"
          ayuda="La primera de la lista es la destacada: sale grande arriba del todo en /noticias y en la portada."
          items={noticias}
          setItems={setNoticias}
          nueva={() => ({ ...VACIA_NOTICIA, id: `n-${Date.now().toString(36)}`, fecha: hoy() })}
          etiqueta={(n) => n.titulo || '(sin título)'}
          onGuardar={() => guardar('noticias', noticias)}
          Campos={CamposNoticia}
        />
      ) : (
        <Lista
          titulo="Patrocinadores"
          ayuda="El orden de la lista es el que se ve en la web. Con descripción y párrafos, la marca tiene ficha propia; sin ellos, su logo enlaza directamente a su web."
          items={patrocinadores}
          setItems={setPatrocinadores}
          nueva={() => ({ ...VACIO_PATROCINADOR })}
          etiqueta={(p) => p.nombre || '(sin nombre)'}
          onGuardar={() => guardar('patrocinadores', patrocinadores)}
          Campos={CamposPatrocinador}
        />
      )}
    </div>
  )
}

/* Lista genérica: sirve igual para noticias y patrocinadores. Lo único que
   cambia entre las dos es el formulario de cada elemento (`Campos`). */
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
      <Campo etiqueta="Texto completo (un párrafo por línea en blanco)" ancho>
        <textarea
          value={(el.cuerpo || []).join('\n\n')}
          onChange={(e) => cambiar('cuerpo', e.target.value.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean))}
          rows={8}
          placeholder="Si lo dejas vacío, la noticia sale en el listado pero no tendrá página propia para abrirla."
        />
      </Campo>
      <SubirImagen etiqueta="Imagen" valor={el.img} onCambio={(r) => cambiar('img', r)} />
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
      <Campo etiqueta="Texto de la ficha (un párrafo por línea en blanco)" ancho>
        <textarea
          value={(el.parrafos || []).join('\n\n')}
          onChange={(e) => cambiar('parrafos', e.target.value.split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean))}
          rows={5}
        />
      </Campo>
      <SubirImagen etiqueta="Logo" valor={el.logo} onCambio={(r) => cambiar('logo', r)} />
      <SubirImagen etiqueta="Foto de cabecera" valor={el.foto} onCambio={(r) => cambiar('foto', r)} />
    </>
  )
}

/* Sube el fichero en crudo, sin base64: se manda tal cual con su content-type,
   que es la mitad de bytes y no necesita ninguna librería. */
function SubirImagen({ etiqueta, valor, onCambio }) {
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState(null)
  const input = useRef(null)

  async function elegir(e) {
    const fichero = e.target.files?.[0]
    if (!fichero) return
    setSubiendo(true)
    setError(null)
    try {
      const r = await fetch('/api/panel/imagen', {
        method: 'POST',
        headers: { 'Content-Type': fichero.type, 'X-Nombre': encodeURIComponent(fichero.name) },
        body: fichero,
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok || !d.ok) throw new Error(d.error || 'No se pudo subir')
      onCambio(d.ruta)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubiendo(false)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <div className="panel-campo ancho">
      <span>{etiqueta}</span>
      <div className="panel-imagen">
        {valor ? <img src={valor} alt="" /> : <div className="hueco">Sin imagen</div>}
        <div>
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={elegir} />
          {subiendo && <em>Subiendo…</em>}
          {error && <em className="mal">{error}</em>}
          {valor && (
            <button type="button" className="panel-btn" onClick={() => onCambio('')}>Quitar</button>
          )}
        </div>
      </div>
    </div>
  )
}

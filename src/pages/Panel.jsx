import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import NoEncontrado from './NoEncontrado'
import RecorteImagen from '../components/RecorteImagen'
import VistaDispositivos from '../components/VistaDispositivos'
import { FORMATOS } from '../components/formatosImagen'
import { FOTOS_SITIO } from '../data/fotosSitio'

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

/* «peticiones» y «cuentas» no editan contenido de la web: son la bandeja de lo
   que pide el club desde /club y las cuentas con las que entran ahí. Van al
   final porque se miran, no se publican. */
const SECCIONES = ['noticias', 'patrocinadores', 'equipos', 'fotos', 'peticiones', 'cuentas']

/* Las cuatro que sí se editan y se publican. Cada una es una lista que viaja
   entera al servidor con su PUT. */
const EDITABLES = ['noticias', 'patrocinadores', 'equipos', 'fotos']

/* Cómo se llama cada lista cuando hay que decirlo en una frase. */
const NOMBRES = {
  noticias: 'noticias',
  patrocinadores: 'patrocinadores',
  equipos: 'equipos',
  fotos: 'fotos de la web',
}

/** Enumeración en castellano: «noticias y fotos de la web». */
const enumerar = (claves) => {
  const partes = claves.map((k) => NOMBRES[k])
  if (partes.length < 2) return partes.join('')
  return `${partes.slice(0, -1).join(', ')} y ${partes.at(-1)}`
}

/* El número que va en cada pestaña. En las peticiones NO es cuántas hay, sino
   cuántas quedan por atender: una bandeja con 40 cerradas y ninguna pendiente
   tiene que marcar 0, no 40. */
function cuentaDe(seccion, listas, pendientes) {
  if (seccion === 'peticiones') return pendientes
  if (seccion === 'cuentas') return ''
  if (seccion === 'fotos') return listas.fotos.filter((f) => f.ruta).length
  return listas[seccion].length
}

export default function Panel() {
  // comprobando · nopanel · fuera · dentro
  const [estado, setEstado] = useState('comprobando')
  const [sesion, setSesion] = useState(null)
  const [pestana, setPestana] = useState('noticias')
  const [listas, setListas] = useState({ noticias: [], patrocinadores: [], equipos: [], fotos: [] })
  /* Lo MISMO, pero tal como está en el servidor. Comparando las dos se sabe qué
     falta por publicar, que es lo que antes no se veía: cada pestaña tiene su
     botón de guardar, así que cambiar una foto y pulsar «Guardar» estando en
     noticias decía «Guardado» sin haber guardado la foto. */
  const [publicado, setPublicado] = useState({ noticias: [], patrocinadores: [], equipos: [], fotos: [] })
  const [aviso, setAviso] = useState(null)
  // lo del área del club: no se edita, se atiende
  const [peticiones, setPeticiones] = useState([])
  const [cuentas, setCuentas] = useState([])

  const cargar = useCallback((d) => {
    setSesion(d)
    const delServidor = {
      noticias: d.noticias ?? [],
      patrocinadores: d.patrocinadores ?? [],
      equipos: d.equipos ?? [],
      fotos: d.fotos ?? [],
    }
    setListas(delServidor)
    setPublicado(delServidor)
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

  /* Peticiones y cuentas van por su cuenta y no dentro de `/sesion`: la sesión
     ya arrastra las cuatro listas de contenido, y cargarlo todo junto haría
     esperar a quien entra solo a publicar una noticia. */
  const cargarClub = useCallback(async () => {
    const [rp, rc] = await Promise.all([
      fetch('/api/panel/peticiones'),
      fetch('/api/panel/usuarios'),
    ])
    if (rp.ok) setPeticiones((await rp.json()).peticiones ?? [])
    if (rc.ok) setCuentas((await rc.json()).usuarios ?? [])
  }, [])

  useEffect(() => {
    if (estado === 'dentro') cargarClub().catch(() => {})
  }, [estado, cargarClub])

  const ponerLista = (clave, valor) =>
    setListas((l) => ({ ...l, [clave]: typeof valor === 'function' ? valor(l[clave]) : valor }))

  /* Qué hay tocado y sin publicar. Se compara con lo que devolvió el servidor,
     que ya viene recortado por los limpiadores de `api/panel.js`: por eso la
     comparación se hace contra ESO y no contra la semilla. */
  const sinPublicar = EDITABLES.filter(
    (k) => JSON.stringify(listas[k]) !== JSON.stringify(publicado[k]),
  )

  /* Un aviso del navegador al cerrar o recargar con cambios a medias. Es la
     última red: sin él, cambiar una foto y recargar la deja perdida sin que
     nadie lo diga. */
  useEffect(() => {
    if (!sinPublicar.length) return undefined
    const alSalir = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', alSalir)
    return () => window.removeEventListener('beforeunload', alSalir)
  }, [sinPublicar.length])

  /**
   * Publica TODO lo que esté sin guardar, no solo la pestaña que se esté
   * mirando.
   *
   * Antes cada botón guardaba lo suyo, y como el botón pone «Guardar y
   * publicar» en las cuatro pestañas, cambiar una foto y guardar desde
   * noticias daba «Guardado. Ya está publicado» con la foto todavía sin subir.
   * Al volver a entrar no estaba, claro.
   *
   * Las listas van UNA DETRÁS DE OTRA, nunca a la vez: el servidor reescribe el
   * fichero entero en cada PUT partiendo de lo que hay en disco, así que dos
   * peticiones en paralelo se pisarían la una a la otra.
   */
  async function guardar() {
    const porGuardar = sinPublicar
    if (!porGuardar.length) {
      return setAviso({ tipo: 'bien', texto: 'No había nada nuevo que publicar.' })
    }
    setAviso({ tipo: 'espera', texto: 'Guardando…' })
    try {
      for (const clave of porGuardar) {
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
        setPublicado((p) => ({ ...p, [clave]: d[clave] }))
      }
      setAviso({
        tipo: 'bien',
        texto: `Guardado (${enumerar(porGuardar)}). Ya está publicado en la web.`,
      })
    } catch (e) {
      setAviso({ tipo: 'mal', texto: e.message })
    }
  }

  if (estado === 'comprobando') return null
  if (estado === 'nopanel') return <NoEncontrado />
  /* la puerta es /acceso: allí se escribe la cuenta y el servidor decide si
     esto es su sitio o lo es /club. Sin esto habría dos formularios que piden
     lo mismo y uno de los dos siempre es el equivocado. */
  if (estado === 'fuera') return <Navigate to="/acceso" replace />

  const equiposPortada = listas.equipos.filter((e) => e.enPortada).length
  const pendientes = peticiones.filter((p) => p.estado === 'nueva').length

  return (
    <div className="panel">
      <header className="panel-top">
        <div>
          <b>Panel del club</b>
          <span>Hola, {sesion.nombre}</span>
        </div>
        <div className="panel-tabs">
          {SECCIONES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={pestana === s}
              /* el punto naranja de la pestaña avisa de que ahí dentro hay algo
                 tocado y todavía sin publicar */
              className={sinPublicar.includes(s) ? 'sin-publicar' : undefined}
              onClick={() => setPestana(s)}
            >
              {s} <i>{cuentaDe(s, listas, pendientes)}</i>
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

      {/* Lo tocado y sin publicar, dicho por su nombre. Con el botón al lado,
          porque el de la sección solo se ve si estás en esa pestaña. */}
      {sinPublicar.length > 0 && (
        <div className="panel-pendiente">
          <span>
            Sin publicar: <b>{enumerar(sinPublicar)}</b>. Si sales o recargas ahora, se pierde.
          </span>
          <button type="button" className="panel-btn primario" onClick={guardar}>
            Guardar y publicar
          </button>
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
          onGuardar={guardar}
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
          onGuardar={guardar}
          Campos={CamposPatrocinador}
        />
      )}

      {pestana === 'fotos' && (
        <Fotos
          items={listas.fotos}
          setItems={(v) => ponerLista('fotos', v)}
          onGuardar={guardar}
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
          onGuardar={guardar}
          Campos={CamposEquipo}
        />
      )}

      {pestana === 'peticiones' && (
        <Peticiones peticiones={peticiones} setPeticiones={setPeticiones} setAviso={setAviso} />
      )}

      {pestana === 'cuentas' && (
        <Cuentas cuentas={cuentas} setCuentas={setCuentas} setAviso={setAviso} />
      )}
    </div>
  )
}

/* --------------------------------------------------------------------------
   Bandeja de peticiones.

   Lo que el club pide desde /club. No se edita: se lee y se cierra. Al marcar
   una como hecha o descartada, el servidor borra sus fotos —son de cantera, y
   no tienen por qué quedarse en el volumen para siempre—, así que el botón
   avisa antes.
   -------------------------------------------------------------------------- */
const PRIORIDAD_TEXTO = { alta: 'Urgente', normal: 'Normal', baja: 'Sin prisa' }

function Peticiones({ peticiones, setPeticiones, setAviso }) {
  const [verCerradas, setVerCerradas] = useState(false)

  const nuevas = peticiones.filter((p) => p.estado === 'nueva')
  const cerradas = peticiones.filter((p) => p.estado !== 'nueva')
  // las urgentes primero, y dentro de cada grupo la más antigua arriba: si algo
  // lleva cuatro días esperando tiene que verse antes que lo de esta mañana
  const orden = { alta: 0, normal: 1, baja: 2 }
  const aLaVista = [...nuevas].sort(
    (a, b) => orden[a.prioridad] - orden[b.prioridad] || a.creada.localeCompare(b.creada),
  )

  async function marcar(id, estado) {
    if (estado !== 'nueva'
      && !window.confirm('Al cerrarla se borran sus fotos del servidor. ¿Seguro?')) return
    try {
      const r = await fetch('/api/panel/peticion-estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estado }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok || !d.ok) throw new Error(d.error || 'No se pudo cambiar')
      setPeticiones(d.peticiones)
      setAviso({ tipo: 'bien', texto: estado === 'hecha' ? 'Marcada como publicada.' : 'Descartada.' })
    } catch (e) {
      setAviso({ tipo: 'mal', texto: e.message })
    }
  }

  return (
    <section className="panel-sec">
      <div className="panel-sec-top">
        <h2>Peticiones</h2>
        <div>
          <button type="button" className="panel-btn" onClick={() => setVerCerradas((v) => !v)}>
            {verCerradas ? 'Ver solo pendientes' : `Ver cerradas (${cerradas.length})`}
          </button>
        </div>
      </div>
      <p className="panel-ayuda">
        Lo que pide el club desde <code>/club</code>. Al marcar una como publicada o descartada
        se borran sus fotos del servidor, así que descárgalas antes si las necesitas.
      </p>

      {aLaVista.length === 0 && !verCerradas && (
        <p className="panel-vacio">Nada pendiente. Todo al día.</p>
      )}

      <ol className="panel-peticiones">
        {(verCerradas ? cerradas : aLaVista).map((p) => (
          <li key={p.id} className={p.estado}>
            <div className="pet-top">
              <b>{p.autorNombre}</b>
              <i className={`pet-prio ${p.prioridad}`}>{PRIORIDAD_TEXTO[p.prioridad]}</i>
              <span>
                {new Date(p.creada).toLocaleString('es-ES', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </div>

            <p className="pet-texto">{p.texto}</p>

            <div className="pet-datos">
              {p.equipo && <span>{p.equipo}</span>}
              {p.paraCuando && <span>Para el {p.paraCuando}</span>}
              {p.fotosBorradas && p.fotos.length > 0 && <span>{p.fotos.length} foto(s), ya borradas</span>}
            </div>

            {!p.fotosBorradas && p.fotos.length > 0 && (
              <ul className="pet-fotos">
                {p.fotos.map((ruta) => (
                  <li key={ruta}>
                    {/* a tamaño completo en pestaña nueva: desde aquí se
                        descargan antes de cerrar la petición */}
                    <a href={ruta} target="_blank" rel="noreferrer"><img src={ruta} alt="" /></a>
                  </li>
                ))}
              </ul>
            )}

            {p.estado === 'nueva' ? (
              <div className="pet-botones">
                <button type="button" className="panel-btn primario" onClick={() => marcar(p.id, 'hecha')}>
                  Publicada
                </button>
                <button type="button" className="panel-btn" onClick={() => marcar(p.id, 'descartada')}>
                  Descartar
                </button>
              </div>
            ) : (
              <div className="pet-botones">
                <i>{p.estado === 'hecha' ? 'Publicada' : 'Descartada'}</i>
                <button type="button" className="panel-btn" onClick={() => marcar(p.id, 'nueva')}>
                  Volver a pendiente
                </button>
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

/* --------------------------------------------------------------------------
   Cuentas del área del club.

   Una por persona. La contraseña la genera el servidor y se enseña UNA vez, al
   crearla: lo que se guarda es su huella, así que no hay forma de volver a
   verla. Si alguien la pierde, se da de baja la cuenta y se crea otra.
   -------------------------------------------------------------------------- */
function Cuentas({ cuentas, setCuentas, setAviso }) {
  const [nombre, setNombre] = useState('')
  const [reciencreada, setRecien] = useState(null)

  async function crear(e) {
    e.preventDefault()
    try {
      const r = await fetch('/api/panel/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok || !d.ok) throw new Error(d.error || 'No se pudo crear')
      setCuentas((c) => [...c, d.usuario])
      setRecien({ ...d.usuario, clave: d.clave })
      setNombre('')
    } catch (err) {
      setAviso({ tipo: 'mal', texto: err.message })
    }
  }

  async function darDeBaja(id, comoSeLlama) {
    if (!window.confirm(
      `¿Borrar la cuenta de ${comoSeLlama}? No podrá volver a entrar y, si tenía la `
      + 'sesión abierta, se le cierra. Sus peticiones anteriores se quedan como están.',
    )) return
    try {
      const r = await fetch('/api/panel/usuario-baja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok || !d.ok) throw new Error(d.error || 'No se pudo borrar')
      setCuentas(d.usuarios)
      setAviso({ tipo: 'bien', texto: `Cuenta de ${comoSeLlama} borrada. Su nombre vuelve a estar libre.` })
    } catch (err) {
      setAviso({ tipo: 'mal', texto: err.message })
    }
  }

  /* Ya no hay «activas» y «de baja»: borrar una cuenta la borra. La lista es lo
     que hay, y por eso volver a crear a la misma persona le devuelve su mismo
     identificador en vez de uno con un número pegado. */

  return (
    <section className="panel-sec">
      <div className="panel-sec-top">
        <h2>Cuentas del club</h2>
      </div>
      <p className="panel-ayuda">
        Quién puede entrar en <code>/club</code> a pedir publicaciones. Con estas cuentas NO se
        puede tocar la web: solo dejar peticiones, y en el panel no entran.
        Recuerda mandarles la dirección: <code>/club</code> no está enlazado desde ningún
        sitio de la web.
      </p>

      <form className="panel-filas" onSubmit={crear}>
        <label>
          <span>Nombre de la persona</span>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Marta Gil"
            maxLength={60}
            required
          />
        </label>
        <button type="submit" className="panel-btn primario">Crear cuenta</button>
      </form>

      {reciencreada && (
        <div className="panel-aviso bien cuenta-nueva">
          <b>Cuenta creada para {reciencreada.nombre}</b>
          <p>
            Usuario <code>{reciencreada.id}</code> · Contraseña <code>{reciencreada.clave}</code>
          </p>
          {/* La dirección va pegada a la contraseña, no en la ayuda de arriba:
              lo primero que pasó al usar esto de verdad (16-08-2026) fue no
              saber por dónde se entraba. */}
          <p className="donde">
            Entra en <b>{window.location.origin}/acceso</b> — o en el candado de la
            barra de la web. Con esa cuenta llega sola al área de peticiones.
          </p>
          {/* Se dice claramente porque es verdad y porque si no, la pregunta
              llega dentro de dos semanas. */}
          <p>
            Cópialas y mándaselas. <b>Esta contraseña no se puede volver a ver</b>: en el
            servidor solo queda su huella. Si se pierde, se da de baja la cuenta y se crea otra.
          </p>
          <button type="button" className="panel-btn" onClick={() => setRecien(null)}>Ya está</button>
        </div>
      )}

      {cuentas.length === 0 && <p className="panel-vacio">Todavía no hay ninguna cuenta.</p>}

      <ul className="panel-cuentas">
        {cuentas.map((c) => (
          <li key={c.id}>
            <div>
              <b>{c.nombre}</b>
              <span>{c.id}</span>
            </div>
            {/* «sin estrenar» = todavía usa la contraseña temporal. Sirve para
                saber a quién hay que recordarle que entre. */}
            {c.debeCambiar !== false && <i className="sin-estrenar">Sin estrenar</i>}
            <button type="button" className="panel-btn" onClick={() => darDeBaja(c.id, c.nombre)}>
              Borrar
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* --------------------------------------------------------------------------
   Pantalla de entrada
   -------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------
   Fotos de las secciones.

   No es una `Lista`: estas fotos no se añaden, ni se borran, ni se ordenan.
   Son huecos FIJOS de la web —la banda de cada página, el fotograma de la
   portada, el pabellón— y lo único que se hace con ellas es cambiar la imagen.
   El catálogo lo fija el código (`data/fotosSitio.js`), porque cada hueco tiene
   que estar usado en alguna página para que servir de algo.

   «Restaurar» no borra nada: vacía la ruta, y entonces la web vuelve a la foto
   que trae el código. Es la forma de deshacer un cambio sin tener que guardar
   en algún sitio la original.
   -------------------------------------------------------------------------- */
function Fotos({ items, setItems, onGuardar }) {
  const rutaDe = (clave) => items.find((f) => f.clave === clave)?.ruta || ''

  const poner = (clave, ruta) => {
    const hay = items.some((f) => f.clave === clave)
    setItems(hay ? items.map((f) => (f.clave === clave ? { ...f, ruta } : f)) : [...items, { clave, ruta }])
  }

  return (
    <section className="panel-sec">
      <div className="panel-sec-top">
        <h2>Fotos de la web</h2>
        <div>
          <button type="button" className="panel-btn primario" onClick={onGuardar}>
            Guardar y publicar
          </button>
        </div>
      </div>
      <p className="panel-ayuda">
        Las fotos que no son de una noticia, un patrocinador ni un equipo: la banda de detrás del título
        de cada página y alguna suelta. Cada una se recorta a la medida de su hueco.
      </p>

      <div className="panel-fotos">
        {FOTOS_SITIO.map((f) => {
          const ruta = rutaDe(f.clave)
          /* La lista arranca con las rutas que trae el código, así que tener
             ruta no significa que se haya tocado nada: hay que compararla con
             la original. Si no, todas saldrían marcadas como cambiadas y el
             botón de restaurar no haría nada. */
          const cambiada = Boolean(ruta) && ruta !== f.porDefecto
          const formato = FORMATOS[f.formato]
          return (
            <div className="panel-foto" key={f.clave}>
              <div className="panel-foto-txt">
                <b>{f.titulo}</b>
                <span>{f.donde}</span>
                {cambiada && <i>Cambiada desde el panel</i>}
              </div>
              <SubirImagen
                /* `vistaTitulo` es el título que la vista previa pinta encima
                   de la foto. Casi siempre es lo que hay antes del guión en el
                   nombre de la entrada ("Cantera — cabecera" → "Cantera"); las
                   que no cuadran lo dicen a mano en `fotosSitio.js`. */
                formato={{
                  ...formato,
                  titulo: 'Cambiar foto',
                  vistaTitulo: f.vistaTitulo || f.titulo.split(' — ')[0],
                }}
                valor={ruta || f.porDefecto}
                onCambio={(r) => poner(f.clave, r)}
                // mientras siga la del código no hay nada que restaurar; una vez
                // cambiada, vaciar la ruta es justo lo que la devuelve
                textoQuitar={cambiada ? 'Restaurar la original' : null}
              />
            </div>
          )
        })}
      </div>
    </section>
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
      <SubirImagen
        formato={{ ...FORMATOS.cabecera, vistaTitulo: el.nombre, vistaSub: el.descripcion }}
        valor={el.foto}
        onCambio={(r) => cambiar('foto', r)}
      />
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
      <SubirImagen
        formato={{ ...FORMATOS.cabecera, vistaTitulo: el.nombre, vistaSub: el.sub }}
        valor={el.headerImg}
        onCambio={(r) => cambiar('headerImg', r)}
      />

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
function SubirImagen({ formato, valor, onCambio, textoQuitar = 'Quitar' }) {
  const [porRecortar, setPorRecortar] = useState(null)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState(null)
  // vistas de la foto que YA está puesta; la de la que se va a subir va dentro
  // del recortador, que es donde hace falta antes de decidir
  const [verVistas, setVerVistas] = useState(false)
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
          {valor && textoQuitar && (
            <button type="button" className="panel-btn" onClick={() => onCambio('')}>{textoQuitar}</button>
          )}
          {formato.vistas && valor && (
            <button type="button" className="panel-btn" onClick={() => setVerVistas((v) => !v)}>
              {verVistas ? 'Ocultar cómo queda' : 'Ver cómo queda'}
            </button>
          )}
        </div>
      </div>

      {formato.vistas && valor && verVistas && (
        <VistaDispositivos
          foto={valor}
          titulo={formato.vistaTitulo || 'Título de la página'}
          sub={formato.vistaSub}
        />
      )}

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

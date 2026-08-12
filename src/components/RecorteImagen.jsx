import { useCallback, useEffect, useRef, useState } from 'react'
import VistaDispositivos from './VistaDispositivos'

/* ---------------------------------------------------------------------------
   Recortador de imágenes del panel.

   Se abre al elegir una foto del ordenador y enseña el encuadre EXACTO con el
   que se va a ver en la web. Se arrastra para mover y se acerca con la rueda o
   el deslizador; lo que queda dentro del marco es literalmente lo que se sube.

   El recorte se hace en el navegador con un `<canvas>`, así que al servidor
   llega una foto ya del tamaño justo: una foto de móvil de 6 MB acaba siendo un
   JPEG de unos 200 kB. No hace falta ninguna librería ni tocar nada en el
   servidor.

   Sobre la escala: `base` es el aumento mínimo para que la foto tape el marco
   entero (lo que hace `object-fit: cover` en CSS). A partir de ahí `zoom` la
   agranda. Nunca se deja bajar de `base`, porque entonces asomaría el fondo.
   --------------------------------------------------------------------------- */

// Ancho máximo del marco en pantalla. El recorte real se hace a la resolución
// del formato, no a esta: esto es solo lo que se ve.
const MARCO_MAX = 560
// Y alto máximo, en tanto por uno de la ventana: un formato vertical en una
// pantalla baja se saldría por abajo y no se vería el botón de aceptar.
const ALTO_MAX = 0.56

/** Lee un File y devuelve una <img> ya cargada (con sus medidas reales). */
function cargarImagen(fichero) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(fichero)
    const img = new Image()
    img.onload = () => {
      // el objeto sigue vivo mientras la imagen esté en uso; se suelta al cerrar
      img.__url = url
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo abrir la imagen. ¿Seguro que es una foto?'))
    }
    img.src = url
  })
}

export default function RecorteImagen({ fichero, formato, onListo, onCancelar }) {
  const [img, setImg] = useState(null)
  const [error, setError] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [trabajando, setTrabajando] = useState(false)
  // URL local del recorte actual, para las vistas previas. Null = sin pedirlas.
  const [vista, setVista] = useState(null)
  const arrastre = useRef(null)

  /* ---- el marco ----
     El ancho NO puede darse por supuesto: en un móvil la ventana es más
     estrecha que `MARCO_MAX` y el marco se encoge. Si el código siguiera
     contando con el ancho grande, el recorte no sería el que se ve encuadrado,
     que es justo lo que este componente existe para evitar. Así que se MIDE el
     hueco de verdad y todo lo demás se calcula a partir de ahí. */
  const hueco = useRef(null)
  const [disponible, setDisponible] = useState(MARCO_MAX)
  const [altoVentana, setAltoVentana] = useState(
    typeof window === 'undefined' ? 800 : window.innerHeight,
  )

  useEffect(() => {
    const el = hueco.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([e]) => setDisponible(e.contentRect.width))
    ro.observe(el)
    const alVariar = () => setAltoVentana(window.innerHeight)
    window.addEventListener('resize', alVariar)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', alVariar)
    }
  }, [])

  const proporcion = formato.alto / formato.ancho
  // el ancho que cabe, y además el que deja el límite de alto (formatos verticales)
  const cabePorAlto = (altoVentana * ALTO_MAX) / proporcion
  const anchoMarco = Math.round(
    Math.max(220, Math.min(MARCO_MAX, formato.ancho, disponible, cabePorAlto)),
  )
  const altoMarco = Math.round(anchoMarco * proporcion)

  useEffect(() => {
    let vivo = true
    cargarImagen(fichero)
      .then((i) => {
        if (!vivo) {
          URL.revokeObjectURL(i.__url)
          return
        }
        setImg(i)
        // Encuadre de partida: centrado y al mínimo, o sea exactamente el mismo
        // que haría el `object-fit: cover` del CSS si no se tocara nada.
        const b = Math.max(anchoMarco / i.width, altoMarco / i.height)
        setZoom(1)
        setPos({ x: (anchoMarco - i.width * b) / 2, y: (altoMarco - i.height * b) / 2 })
      })
      .catch((e) => vivo && setError(e.message))
    return () => {
      vivo = false
    }
  }, [fichero, anchoMarco, altoMarco])

  // Suelta la memoria de la imagen al cerrar el recortador.
  useEffect(() => () => img && URL.revokeObjectURL(img.__url), [img])
  // Y la del recorte de la vista previa, que es otra imagen entera en memoria.
  useEffect(() => () => vista && URL.revokeObjectURL(vista), [vista])

  const base = img ? Math.max(anchoMarco / img.width, altoMarco / img.height) : 1
  const escala = base * zoom
  const anchoVisible = img ? img.width * escala : 0
  const altoVisible = img ? img.height * escala : 0

  /* La foto no puede despegarse de los bordes: se obliga a que su esquina
     superior izquierda esté entre "lo que sobra" y cero. Sin esto se podría
     arrastrar hasta dejar media franja vacía. */
  const encajar = useCallback(
    (p, anchoV = anchoVisible, altoV = altoVisible) => ({
      x: Math.min(0, Math.max(anchoMarco - anchoV, p.x)),
      y: Math.min(0, Math.max(altoMarco - altoV, p.y)),
    }),
    [anchoMarco, altoMarco, anchoVisible, altoVisible],
  )

  // Al acercar o alejar, la foto puede quedarse corta por un lado: se recoloca
  // dentro de los límites en vez de dejar un hueco.
  useEffect(() => {
    if (!img) return
    setPos((p) => encajar(p))
  }, [img, zoom, encajar])

  function empezarArrastre(e) {
    if (formato.entero) return
    try {
      // capturar el puntero deja seguir arrastrando aunque el ratón se salga del
      // marco. Si el navegador no lo permite se arrastra igual, solo que soltar
      // fuera del marco corta el movimiento: molesto, pero no roto.
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* sin captura se sigue funcionando */
    }
    arrastre.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
  }

  function moverArrastre(e) {
    if (!arrastre.current) return
    setPos(encajar({ x: e.clientX - arrastre.current.x, y: e.clientY - arrastre.current.y }))
  }

  const soltarArrastre = () => {
    arrastre.current = null
  }

  function rueda(e) {
    if (formato.entero) return
    // hacia arriba acerca, hacia abajo aleja; el paso es pequeño para que se
    // pueda afinar sin pasarse de largo
    setZoom((z) => Math.min(4, Math.max(1, z - Math.sign(e.deltaY) * 0.08)))
  }

  /* ¿Da la foto para el tamaño que pide la web? Se compara cuántos píxeles de
     la foto original caen dentro del marco con los que va a tener el recorte: si
     hay menos, se está estirando y saldrá blanda. Se sube igual —mejor una foto
     justa que ninguna— pero conviene decirlo, porque no es culpa del encuadre.
     El 10% de margen evita el aviso cuando se queda a un pelo. */
  const pocaResolucion = img && (
    formato.entero
      ? Math.min(formato.ancho / img.width, formato.alto / img.height) > 1.1
      : anchoMarco / escala < formato.ancho * 0.9
  )

  /* El recorte de verdad, en un canvas del tamaño exacto del formato. Lo usan
     dos botones: el de subir y el de «ver cómo queda», que necesita la misma
     imagen que se subiría y no una aproximación. */
  async function hacerRecorte() {
    const lienzo = document.createElement('canvas')
    lienzo.width = formato.ancho
    lienzo.height = formato.alto
    const ctx = lienzo.getContext('2d')
    // suavizado bueno: al reducir mucho, el rápido deja bordes con dientes
    ctx.imageSmoothingQuality = 'high'

    let tipo = 'image/jpeg'

    if (formato.entero) {
      // El logo entra entero y centrado, sin recortar y sin fondo: si es un
      // PNG transparente tiene que seguir siéndolo sobre cualquier color.
      const f = Math.min(formato.ancho / img.width, formato.alto / img.height)
      const w = img.width * f
      const h = img.height * f
      ctx.drawImage(img, (formato.ancho - w) / 2, (formato.alto - h) / 2, w, h)
      tipo = 'image/webp'
    } else {
      // Del marco a la foto original: se deshace la escala para saber qué
      // trozo de la foto de verdad está asomando por el hueco.
      const sx = -pos.x / escala
      const sy = -pos.y / escala
      const sw = anchoMarco / escala
      const sh = altoMarco / escala
      // fondo blanco: un JPEG no guarda transparencia y sin esto saldría negra
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, formato.ancho, formato.alto)
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, formato.ancho, formato.alto)
    }

    const blob = await new Promise((res, rej) =>
      lienzo.toBlob((b) => (b ? res(b) : rej(new Error('No se pudo generar la imagen'))), tipo, 0.86),
    )
    return { blob, tipo }
  }

  async function recortar() {
    if (!img) return
    setTrabajando(true)
    setError(null)
    try {
      const { blob, tipo } = await hacerRecorte()
      await onListo(blob, tipo)
    } catch (e) {
      setError(e.message)
      setTrabajando(false)
    }
  }

  /* «Ver cómo queda»: el mismo recorte que se subiría, servido como URL local
     para metérselo a las vistas previas. De soltar la anterior se encarga la
     limpieza del `useEffect` de arriba; hacerlo aquí dentro del `setVista`
     obligaría a meter un efecto secundario en un actualizador de estado, que
     React repite en desarrollo y dejaría una imagen colgada en memoria. */
  async function verComoQueda() {
    if (!img) return
    setError(null)
    try {
      const { blob } = await hacerRecorte()
      setVista(URL.createObjectURL(blob))
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="recorte-fondo" role="dialog" aria-modal="true" aria-label={`Ajustar ${formato.titulo}`}>
      <div className="recorte">
        <header>
          <b>{formato.titulo}</b>
          <span>
            {formato.ancho} × {formato.alto} px · {formato.ayuda}
          </span>
        </header>

        {error && <p className="recorte-error">{error}</p>}

        {/* este div ocupa todo el ancho disponible y es el que se mide */}
        <div className="recorte-hueco" ref={hueco}>
        <div
          className={`recorte-marco${formato.entero ? ' entero' : ''}`}
          style={{ width: anchoMarco, height: altoMarco }}
          onPointerDown={empezarArrastre}
          onPointerMove={moverArrastre}
          onPointerUp={soltarArrastre}
          onPointerCancel={soltarArrastre}
          onWheel={rueda}
        >
          {img && (
            <img
              src={img.src}
              alt=""
              draggable={false}
              style={
                formato.entero
                  ? undefined
                  : {
                      width: anchoVisible,
                      height: altoVisible,
                      transform: `translate(${pos.x}px, ${pos.y}px)`,
                    }
              }
            />
          )}
          {/* La franja central que sobrevive en un móvil. Va encima de la foto
              y no la tapa —solo dos líneas y una sombra a los lados—, para que
              se siga viendo lo que queda fuera y se pueda decidir. */}
          {formato.zonaSegura && (
            <div
              className="recorte-zona"
              style={{ '--ancho': `${formato.zonaSegura * 100}%` }}
              aria-hidden="true"
            >
              <span>lo que se ve en un móvil</span>
            </div>
          )}
        </div>
        </div>

        {!formato.entero && (
          <label className="recorte-zoom">
            <span>Acercar</span>
            <input
              type="range"
              min="1"
              max="4"
              step="0.02"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </label>
        )}

        <p className="recorte-pista">
          {formato.entero
            ? 'El logo se encaja entero, no hay nada que ajustar.'
            : 'Arrastra la foto para colocarla y usa la rueda o la barra para acercarla.'}
        </p>

        {pocaResolucion && (
          <p className="recorte-aviso">
            La foto es pequeña para este hueco y se verá algo borrosa. Si tienes el original más
            grande, mejor ese.
          </p>
        )}

        {/* Solo donde el marco de alrededor cambia con el dispositivo: en los
            demás huecos la foto se ve igual en todos y no habría nada que
            comparar. Lo enciende `vistas` en `formatosImagen.js`. */}
        {formato.vistas && (
          <div className="recorte-vistas">
            <button type="button" className="panel-btn" onClick={verComoQueda} disabled={!img}>
              {vista ? 'Actualizar la vista previa' : 'Ver cómo queda en la web'}
            </button>
            {vista ? (
              <VistaDispositivos
                foto={vista}
                titulo={formato.vistaTitulo || 'Título de la página'}
                sub={formato.vistaSub}
              />
            ) : (
              <p className="recorte-pista">
                El marco es lo que se ve en un ordenador, y es siempre el mismo. Cuanto más
                estrecha es la pantalla, más se recorta por los lados: en un móvil solo queda la
                franja del centro.
              </p>
            )}
          </div>
        )}

        <div className="recorte-botones">
          <button type="button" className="panel-btn" onClick={onCancelar} disabled={trabajando}>
            Cancelar
          </button>
          <button type="button" className="panel-btn primario" onClick={recortar} disabled={!img || trabajando}>
            {trabajando ? 'Subiendo…' : 'Usar esta imagen'}
          </button>
        </div>
      </div>
    </div>
  )
}

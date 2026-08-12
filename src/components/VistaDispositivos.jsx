import { useEffect, useMemo, useRef, useState } from 'react'

/* ---------------------------------------------------------------------------
   «Cómo queda esta foto» — la misma cabecera en cuatro anchos de pantalla.

   La foto de la banda se ve SIEMPRE con la misma forma (ver `.phead` en
   index.css), así que de un móvil a un monitor no cambia el encuadre: cambia
   cuánto azul la rodea y dónde cae el título encima. Esto es para ver eso antes
   de subirla, que es lo que no se podía comprobar de ninguna manera.

   Cada vista es un <iframe> a `/panel/vista`, o sea la cabecera de verdad con
   el CSS de verdad. Un iframe tiene su propio ancho de ventana, así que las
   media queries se aplican como en el dispositivo real. Luego se encoge con
   `transform: scale()` para que quepa en el panel: encoger no cambia el
   maquetado, solo el tamaño con el que se enseña.
   --------------------------------------------------------------------------- */

/* `alto` es solo el de partida, hasta que la propia vista diga el suyo por
   `postMessage`: no se puede calcular desde aquí, porque según el ancho manda
   la foto o manda el texto. Se pasa de largo a propósito —mejor que sobre y se
   recorte a que falte y corte la banda por la mitad en el primer pintado—. */
const DISPOSITIVOS = [
  { nombre: 'Móvil', ancho: 390, alto: 420 },
  { nombre: 'Tableta', ancho: 820, alto: 420 },
  { nombre: 'Portátil', ancho: 1440, alto: 470 },
  // 1920 es el único que enseña la foto con azul a los lados: por encima de
  // 1600 px la foto ya no crece más, para que no acabe siendo un panel gigante.
  { nombre: 'Monitor grande', ancho: 1920, alto: 500 },
]

export default function VistaDispositivos({ foto, titulo, sub, kicker, migas }) {
  const caja = useRef(null)
  const [disponible, setDisponible] = useState(560)
  // alto real de cada vista, por ancho de dispositivo, según lo que diga ella
  const [altos, setAltos] = useState({})

  useEffect(() => {
    const el = caja.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([e]) => setDisponible(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  /* Cada vista dice lo alto que le ha salido la banda. Se comprueba el origen
     —solo escuchamos a la propia web— y se identifica el iframe por su
     `contentWindow`, que es lo único fiable: el mensaje no trae quién lo manda
     y los cuatro cargan la misma URL. */
  useEffect(() => {
    function alMensaje(e) {
      if (e.origin !== window.location.origin || !e.data?.vistaCabecera) return
      const marcos = caja.current?.querySelectorAll('iframe') || []
      const suyo = [...marcos].find((f) => f.contentWindow === e.source)
      if (!suyo) return
      setAltos((a) => ({ ...a, [suyo.dataset.ancho]: Math.ceil(e.data.alto) }))
    }
    window.addEventListener('message', alMensaje)
    return () => window.removeEventListener('message', alMensaje)
  }, [])

  /* La URL se memoriza: sin esto cada repintado del panel le cambia el `src` a
     los cuatro iframes y se recargan enteros, que parpadea y va lento. */
  const url = useMemo(() => {
    const q = new URLSearchParams()
    if (foto) q.set('foto', foto)
    if (titulo) q.set('titulo', titulo)
    if (sub) q.set('sub', sub)
    if (kicker) q.set('kicker', kicker)
    if (migas) q.set('migas', migas)
    return `/panel/vista?${q.toString()}`
  }, [foto, titulo, sub, kicker, migas])

  return (
    <div className="vistas" ref={caja}>
      {DISPOSITIVOS.map((d) => {
        // nunca se agranda: un móvil se enseña a tamaño real como mucho
        const escala = Math.min(1, disponible / d.ancho)
        const alto = altos[d.ancho] || d.alto
        return (
          <figure key={d.ancho}>
            <figcaption>
              {d.nombre} <span>{d.ancho} px de ancho</span>
            </figcaption>
            <div className="vista-marco" style={{ height: Math.round(alto * escala) }}>
              <iframe
                title={`Cabecera en ${d.nombre}`}
                src={url}
                width={d.ancho}
                height={alto}
                data-ancho={d.ancho}
                style={{ transform: `scale(${escala})` }}
              />
            </div>
          </figure>
        )
      })}
    </div>
  )
}

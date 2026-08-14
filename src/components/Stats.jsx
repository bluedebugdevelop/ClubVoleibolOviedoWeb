import { useEffect, useRef, useState } from 'react'

// Las cifras marcadas con `sube: true` en contenido.js se cuentan desde cero
// cuando la franja entra en pantalla. El resto se pintan tal cual.
//
// El texto de la cifra es libre ("+6.700", "20+", "13"): se parte en
// prefijo + número + sufijo, se anima solo el número y se vuelve a montar con
// el mismo formato español (punto de millar). Así no hay que duplicar el dato.
const NUMERO = /^([^\d]*)([\d.,]+)(.*)$/

function partes(texto) {
  const m = NUMERO.exec(String(texto))
  if (!m) return null
  const valor = Number(m[2].replace(/\./g, '').replace(',', '.'))
  if (!Number.isFinite(valor) || valor <= 0) return null
  return { antes: m[1], valor, despues: m[3] }
}

// A mano y no con Intl: en español `Intl` no separa los millares de cuatro
// cifras ("4025", no "4.025"), así que a mitad de cuenta el número perdía el
// punto y lo recuperaba al llegar a 6.700. Se ve como un tic.
function miles(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function Contador({ texto }) {
  const ref = useRef(null)
  const [n, setN] = useState(null) // null = todavía no ha arrancado

  useEffect(() => {
    const p = partes(texto)
    const el = ref.current
    if (!p || !el) return

    // Quien haya pedido menos movimiento en el sistema ve la cifra final y ya.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // baja a cero YA, no al entrar en pantalla: si la franja se ve a medias al
    // cargar, se vería primero la cifra final y luego el salto atrás a cero.
    setN(0)

    let frame = 0
    let arrancado = false
    let avisado = false // ¿ha llegado a hablar el observador alguna vez?

    const contar = () => {
      arrancado = true
      const DURACION = 1600
      const inicio = performance.now()
      const paso = (ahora) => {
        const t = Math.min(1, (ahora - inicio) / DURACION)
        // frena al final: los últimos cientos se ven pasar, no aparecen de golpe
        const suave = 1 - Math.pow(1 - t, 3)
        setN(Math.round(p.valor * suave))
        if (t < 1) frame = requestAnimationFrame(paso)
        else setN(null) // devuelve el texto original, sin redondeos raros
      }
      frame = requestAnimationFrame(paso)
    }

    // IntersectionObserver y no un temporizador: la franja de cifras está por
    // debajo del hero, así que en móvil nadie la ve al cargar.
    const obs = new IntersectionObserver(
      (entradas) => {
        avisado = true
        if (entradas[0].isIntersecting && !arrancado) {
          contar()
          obs.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    obs.observe(el)

    // Red de seguridad: si el observador no llega a hablar NUNCA, la cifra se
    // quedaría en cero para siempre. La condición es `!avisado`, no
    // `!arrancado`: al observar, el navegador manda enseguida un primer aviso
    // diciendo "no está en pantalla". Si la red mirase solo si ha arrancado la
    // cuenta, se dispararía en toda página donde el usuario tarde dos segundos
    // en bajar, y la animación pasaría a sus espaldas.
    const red = setTimeout(() => {
      if (!avisado && !arrancado) {
        contar()
        obs.disconnect()
      }
    }, 2000)

    return () => {
      obs.disconnect()
      clearTimeout(red)
      cancelAnimationFrame(frame)
    }
  }, [texto])

  const p = partes(texto)
  const visible = n === null || !p ? texto : `${p.antes}${miles(n)}${p.despues}`
  // `tabular-nums` para que los dígitos no bailen de ancho mientras cuenta
  return (
    <b ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {visible}
    </b>
  )
}

export default function Stats({ items }) {
  return (
    <div className="stats">
      <div className="stats-in">
        {items.map((s) => (
          <div className="stat" key={s.label}>
            {s.sube ? <Contador texto={s.n} /> : <b>{s.n}</b>}
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

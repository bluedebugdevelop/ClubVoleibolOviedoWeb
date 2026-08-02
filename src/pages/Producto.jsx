import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import PageHead from '../components/PageHead'
import NoEncontrado from './NoEncontrado'
import { club, productos, tiendaAbierta } from '../data/contenido'

/* Ficha de un producto: galería a la izquierda, descripción y precio a la
   derecha. No hay carrito ni pasarela de pago (decisión de Diego): el cierre
   es el mismo correo al club que en /tienda. */
export default function Producto() {
  const { slug } = useParams()
  const producto = productos.find((p) => p.slug === slug)

  // La portada es la primera foto de la galería: es el packshot limpio y es lo
  // que el usuario acaba de ver en la rejilla, así no le cambia la imagen bajo
  // los pies al entrar.
  const fotos = producto ? [producto.img, ...(producto.galeria ?? [])] : []
  const [activa, setActiva] = useState(0)

  // Con la tienda cerrada las fichas sueltas no deben quedar accesibles por URL:
  // se devuelve a /tienda, que es donde está el cartel de «Próximamente».
  if (!tiendaAbierta) return <Navigate to="/tienda" replace />

  if (!producto) return <NoEncontrado />

  return (
    <>
      <PageHead
        crumbs={
          <>
            <Link to="/">Inicio</Link> · <Link to="/tienda">Tienda</Link> · {producto.nombre}
          </>
        }
        kicker={producto.categoria}
        title={producto.nombre}
        sub={producto.resumen}
      />

      <section className="sec">
        <div className="ficha-prod">
          <div className="galeria">
            <div className="grande">
              <img src={fotos[activa]} alt={producto.nombre} />
            </div>
            <div className="tiras">
              {fotos.map((f, i) => (
                <button
                  key={f}
                  type="button"
                  className={i === activa ? 'on' : undefined}
                  aria-label={`Foto ${i + 1} de ${producto.nombre}`}
                  aria-pressed={i === activa}
                  onClick={() => setActiva(i)}
                >
                  <img src={f} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          </div>

          <div className="ficha-prod-texto">
            <div className="precio-grande">{producto.precio}</div>

            {producto.descripcion.map((t) => (
              <p key={t.slice(0, 40)}>{t}</p>
            ))}

            {producto.detalles && (
              <ul className="detalles">
                {producto.detalles.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            )}

            <a
              className="btn solid"
              href={`mailto:${club.email}?subject=${encodeURIComponent(`Pedido: ${producto.nombre}`)}`}
            >
              Pedir por correo
            </a>
            {/* clase propia: `.note` global es un bloque a ancho de página con
                su propio padding, aquí descuadraba la columna */}
            <p className="nota-pago">
              La tienda todavía no tiene pasarela de pago propia. Escríbenos indicando talla y cantidad y te
              confirmamos disponibilidad y forma de pago.
            </p>
          </div>
        </div>

        <p className="volver">
          <Link to="/tienda">← Volver a la tienda</Link>
        </p>
      </section>
    </>
  )
}

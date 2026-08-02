import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHead from '../components/PageHead'
import { club, productos, categoriasTienda, tiendaAbierta } from '../data/contenido'

export default function Tienda() {
  const [categoria, setCategoria] = useState('Todos')

  const visibles = categoria === 'Todos' ? productos : productos.filter((p) => p.categoria === categoria)

  return (
    <>
      <PageHead
        crumbs={<><Link to="/">Inicio</Link> · Tienda</>}
        kicker="Equipación y merchandising"
        title="Tienda"
        sub="Ropa y accesorios oficiales del Club Voleibol Oviedo."
        bg="/media/recepcion.jpg"
        foco="center 60%"
      />

      <section className="sec">
        {/* La tienda está cerrada hasta que estén cerrados productos y precios
            (reunión con Vitor, 30-07-2026). No se ha borrado nada: los
            productos y sus fichas siguen en contenido.js y vuelven poniendo
            `tiendaAbierta` en true. */}
        {!tiendaAbierta ? (
          <div className="proximamente">
            <span className="etq">Próximamente</span>
            <h2>La tienda abre pronto</h2>
            <p>
              Estamos cerrando los productos y los precios de la temporada 26/27: sudaderas, camisetas, gorras y
              accesorios con los colores del club. En cuanto esté todo listo, se abre aquí mismo.
            </p>
            <p>
              Mientras tanto, si quieres algo en concreto escríbenos a{' '}
              <a href={`mailto:${club.email}`}>{club.email}</a> y te decimos cómo conseguirlo.
            </p>
            <Link className="btn solid" to="/contacto">Contactar con el club →</Link>
          </div>
        ) : (
          <>
            <div className="filters">
              {categoriasTienda.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={categoria === cat}
                  onClick={() => setCategoria(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="products">
              {visibles.map((p) => (
                <Link className="product" key={p.id} to={`/tienda/${p.slug}`}>
                  {p.img
                    ? <div className="ph"><img src={p.img} alt={p.nombre} loading="lazy" /></div>
                    : <div className="ph">Foto producto</div>}
                  <div className="in">
                    <div className="cat">{p.categoria}</div>
                    <h3>{p.nombre}</h3>
                    <div className="price">{p.precio}</div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="shopnote">
              <b>¿Cómo se compra?</b> Por ahora la tienda no tiene pasarela de pago propia: escribe al club a{' '}
              {club.email} indicando la talla y el producto y te confirmamos disponibilidad y forma de pago.
            </div>
          </>
        )}
      </section>
    </>
  )
}

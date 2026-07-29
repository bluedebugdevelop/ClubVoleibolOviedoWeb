import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHead from '../components/PageHead'
import { club, productos, categoriasTienda } from '../data/contenido'

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
      </section>
    </>
  )
}

import { useState } from 'react'
import { PageHero } from './Equipos'
import { PRODUCTOS } from '../data/content'

const CATEGORIAS = ['Todos', 'Textil', 'Accesorios', 'Material']

export default function Tienda() {
  const [filtro, setFiltro] = useState('Todos')
  const productos = filtro === 'Todos' ? PRODUCTOS : PRODUCTOS.filter((p) => p.categoria === filtro)

  return (
    <>
      <PageHero
        title="Tienda oficial"
        subtitle="Viste los colores del club. Cada compra apoya el proyecto deportivo del Club Voleibol Oviedo."
      />

      <section className="container-cvo py-16">
        {/* Aviso demo */}
        <div className="mb-8 rounded-xl bg-sky-100 text-brand-600 px-5 py-3 text-sm font-medium text-center">
          🛈 Tienda de demostración con productos de ejemplo. La compra online aún no está activa.
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIAS.map((c) => (
            <button
              key={c}
              onClick={() => setFiltro(c)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                filtro === c
                  ? 'bg-brand-500 text-white shadow'
                  : 'bg-white text-navy-900 ring-1 ring-sky-100 hover:ring-brand-400'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid productos */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {productos.map((p) => (
            <div
              key={p.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-sky-100 hover:shadow-xl transition flex flex-col"
            >
              <div className="relative aspect-square overflow-hidden bg-ice-50">
                <img
                  src={p.imagen}
                  alt={p.nombre}
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                />
                <span className="absolute top-3 left-3 rounded-full bg-white/90 text-navy-900 text-xs font-semibold px-2.5 py-1">
                  {p.categoria}
                </span>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-navy-900 leading-snug">{p.nombre}</h3>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <span className="text-lg font-extrabold text-brand-500">{p.precio.toFixed(2)} €</span>
                  <button className="rounded-lg bg-navy-900 text-white text-sm font-semibold px-4 py-2 hover:bg-brand-500 transition">
                    Añadir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

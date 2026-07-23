import { PageHero } from './Equipos'
import SectionHeading from '../components/SectionHeading'
import { NOTICIAS, GALERIA } from '../data/content'

export default function Noticias() {
  const [destacada, ...resto] = NOTICIAS

  return (
    <>
      <PageHero
        title="Noticias y actualidad"
        subtitle="Toda la información del club: competición, cantera, eventos y novedades."
      />

      <section className="container-cvo py-16">
        {/* Destacada */}
        <article className="grid lg:grid-cols-2 gap-8 items-center rounded-3xl overflow-hidden bg-white shadow-md ring-1 ring-sky-100">
          <img src={destacada.imagen} alt={destacada.titulo} className="h-full w-full object-cover aspect-[16/10]" />
          <div className="p-8 lg:p-10">
            <div className="flex items-center gap-2 text-xs mb-3">
              <span className="rounded-full bg-brand-500 text-white px-3 py-1 font-semibold">Destacada</span>
              <span className="text-navy-800/50">{destacada.fecha}</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-navy-900 leading-tight">
              {destacada.titulo}
            </h2>
            <p className="mt-4 text-navy-800/70">{destacada.resumen}</p>
            <button className="mt-6 font-semibold text-brand-500 hover:text-brand-600">
              Leer más →
            </button>
          </div>
        </article>

        {/* Resto */}
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resto.map((n) => (
            <article
              key={n.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-sky-100 hover:shadow-lg transition group"
            >
              <div className="overflow-hidden">
                <img
                  src={n.imagen}
                  alt={n.titulo}
                  className="aspect-[16/10] w-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-xs text-navy-800/50 mb-2">
                  <span className="rounded-full bg-sky-100 text-brand-600 px-2 py-0.5 font-semibold">
                    {n.categoria}
                  </span>
                  <span>{n.fecha}</span>
                </div>
                <h3 className="font-bold text-lg text-navy-900 leading-snug">{n.titulo}</h3>
                <p className="mt-2 text-sm text-navy-800/70">{n.resumen}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Galería de fotos */}
      <section className="bg-ice-50 py-16">
        <div className="container-cvo">
          <SectionHeading eyebrow="Multimedia" title="Galería de fotos" subtitle="Los mejores momentos de la temporada." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {GALERIA.map((src, i) => (
              <div
                key={i}
                className={`overflow-hidden rounded-xl ${i % 5 === 0 ? 'md:row-span-2 md:col-span-2' : ''}`}
              >
                <img
                  src={src}
                  alt={`Galería ${i + 1}`}
                  className="h-full w-full object-cover hover:scale-105 transition duration-500 min-h-40"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

import { Link } from 'react-router-dom'
import SectionHeading from '../components/SectionHeading'
import { EQUIPOS } from '../data/content'

export default function Equipos() {
  return (
    <>
      <PageHero title="Nuestros equipos" subtitle="Del deporte base a la competición sénior. Elige un equipo para ver su plantilla, calendario y resultados." />
      <section className="container-cvo py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-8">
          {EQUIPOS.map((e) => (
            <Link
              key={e.id}
              to={`/equipos/${e.id}`}
              className="group grid sm:grid-cols-5 overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-sky-100 hover:shadow-xl transition"
            >
              <div className="sm:col-span-2 aspect-[4/3] sm:aspect-auto overflow-hidden">
                <img
                  src={e.foto}
                  alt={e.nombre}
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="sm:col-span-3 p-6 flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wide text-brand-500">
                  {e.categoria}
                </span>
                <h3 className="mt-1 text-xl font-bold text-navy-900">{e.nombre}</h3>
                <p className="mt-2 text-sm text-navy-800/70 flex-1">{e.descripcion}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-navy-800/50">
                    <span className="font-semibold text-navy-900">Entrenador/a:</span> {e.entrenador}
                  </span>
                  <span className="font-semibold text-brand-500 group-hover:translate-x-1 transition-transform">
                    Ver →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}

export function PageHero({ title, subtitle }) {
  return (
    <section className="relative bg-navy-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-600/40 to-navy-950" />
      <div className="absolute -right-20 -top-16 h-72 w-72 rounded-full border-[2.5rem] border-white/5" aria-hidden />
      <div className="container-cvo relative py-16 md:py-20">
        <SectionHeading light title={title} subtitle={subtitle} />
      </div>
    </section>
  )
}

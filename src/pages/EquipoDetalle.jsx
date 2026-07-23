import { useParams, Link } from 'react-router-dom'
import { EQUIPOS } from '../data/content'

export default function EquipoDetalle() {
  const { id } = useParams()
  const equipo = EQUIPOS.find((e) => e.id === id)

  if (!equipo) {
    return (
      <div className="container-cvo py-24 text-center">
        <h1 className="text-2xl font-bold text-navy-900">Equipo no encontrado</h1>
        <Link to="/equipos" className="mt-4 inline-block text-brand-500 font-semibold">
          ← Volver a equipos
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Cabecera */}
      <section className="relative text-white">
        <img src={equipo.foto} alt={equipo.nombre} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/80 to-navy-900/50" />
        <div className="container-cvo relative py-20 md:py-28">
          <Link to="/equipos" className="text-sky-300 text-sm font-semibold hover:text-white">
            ← Todos los equipos
          </Link>
          <span className="mt-4 block text-sm font-bold uppercase tracking-wide text-sky-300">
            {equipo.categoria}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold">{equipo.nombre}</h1>
          <p className="mt-4 max-w-2xl text-sky-100/80">{equipo.descripcion}</p>
          <div className="mt-6 flex flex-wrap gap-6 text-sm">
            <Info label="Entrenador/a" value={equipo.entrenador} />
            <Info label="Temporada" value={equipo.temporada} />
            <Info label="Jugadores" value={`${equipo.plantilla.length}`} />
          </div>
        </div>
      </section>

      <section className="container-cvo py-16 grid lg:grid-cols-3 gap-10">
        {/* Resultados */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-extrabold text-navy-900 mb-6">Resultados recientes</h2>
          <div className="space-y-3">
            {equipo.resultados.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-sky-100"
              >
                <span className="w-10 text-xs font-bold text-navy-800/40">{r.jornada}</span>
                <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm">
                  <span className="text-right font-semibold text-navy-900">{r.local}</span>
                  <span className="rounded-lg bg-navy-900 text-white font-bold px-3 py-1 text-center min-w-16">
                    {r.marcador}
                  </span>
                  <span className="text-left font-semibold text-navy-900">{r.visitante}</span>
                </div>
                <span
                  className={`hidden sm:inline text-xs font-bold px-2 py-1 rounded-full ${
                    r.ganado ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {r.ganado ? 'Victoria' : 'Derrota'}
                </span>
              </div>
            ))}
          </div>

          {/* Próximo partido */}
          <div className="mt-8 rounded-2xl bg-navy-900 text-white p-6 relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-brand-500/20 blur-2xl" />
            <span className="text-xs font-bold uppercase tracking-wide text-sky-300">Próximo partido</span>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
              <div className="text-2xl font-extrabold">
                CV Oviedo <span className="text-sky-300 font-normal text-lg mx-2">vs</span> {equipo.proximo.rival}
              </div>
              <div className="text-sm text-sky-100/80">
                <div>{equipo.proximo.fecha} · {equipo.proximo.hora}</div>
                <div>{equipo.proximo.casa ? '🏠 En casa' : '✈️ Fuera'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Plantilla */}
        <div>
          <h2 className="text-2xl font-extrabold text-navy-900 mb-6">Plantilla</h2>
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-sky-100 divide-y divide-sky-100">
            {equipo.plantilla.map((j) => (
              <div key={j.dorsal} className="flex items-center gap-4 p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-500 text-white font-bold">
                  {j.dorsal}
                </span>
                <div>
                  <p className="font-semibold text-navy-900 leading-tight">{j.nombre}</p>
                  <p className="text-xs text-navy-800/60">{j.posicion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-sky-300/70 text-xs uppercase tracking-wide">{label}</div>
      <div className="font-bold text-white">{value}</div>
    </div>
  )
}

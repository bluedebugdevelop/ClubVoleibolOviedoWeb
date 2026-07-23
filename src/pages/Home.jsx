import { Link } from 'react-router-dom'
import SectionHeading from '../components/SectionHeading'
import { CLUB, EQUIPOS, NOTICIAS, RETRANSMISIONES, PATROCINADORES } from '../data/content'

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-brand-600 via-navy-800 to-navy-950" />
        <div
          className="absolute -right-24 -top-24 h-96 w-96 rounded-full border-[3rem] border-white/5"
          aria-hidden
        />
        <div
          className="absolute -left-16 bottom-0 h-72 w-72 rounded-full border-[2rem] border-brand-400/10"
          aria-hidden
        />
        <div className="container-cvo relative py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide">
              <span className="h-2 w-2 rounded-full bg-sky-300 animate-pulse" />
              Temporada 2025/2026 en marcha
            </span>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] text-balance">
              Pasión por el <span className="text-sky-300">voleibol</span> desde Oviedo
            </h1>
            <p className="mt-6 text-lg text-sky-100/80 max-w-lg">
              Somos el {CLUB.nombre}. Cuatro equipos, una cantera viva y una afición que no falla.
              Descubre nuestros equipos, resultados y toda la actualidad del club.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/equipos"
                className="rounded-lg bg-brand-500 hover:bg-brand-400 px-6 py-3 font-semibold shadow-lg shadow-brand-600/30 transition"
              >
                Ver equipos
              </Link>
              <Link
                to="/tienda"
                className="rounded-lg bg-white/10 hover:bg-white/20 px-6 py-3 font-semibold transition"
              >
                Tienda oficial
              </Link>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="absolute inset-0 blur-3xl bg-brand-400/20 rounded-full" />
            <img
              src="/images/logo.jpg"
              alt={CLUB.nombre}
              className="relative mx-auto h-72 w-72 lg:h-80 lg:w-80 rounded-full object-cover ring-8 ring-white/10 shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white">
        <div className="container-cvo -mt-10 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded-2xl bg-white shadow-xl ring-1 ring-sky-100 p-6">
            {[
              { n: '4', l: 'Equipos' },
              { n: `${new Date().getFullYear() - CLUB.fundacion}`, l: 'Años de historia' },
              { n: '120+', l: 'Deportistas' },
              { n: '6', l: 'Patrocinadores' },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-brand-500 font-display">{s.n}</div>
                <div className="text-sm text-navy-800/60 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EQUIPOS */}
      <section className="container-cvo py-20">
        <SectionHeading
          eyebrow="Nuestros equipos"
          title="Elige un equipo y sigue su temporada"
          subtitle="Haz clic en cualquier equipo para ver su plantilla, calendario y resultados."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {EQUIPOS.map((e) => (
            <Link
              key={e.id}
              to={`/equipos/${e.id}`}
              className="group relative overflow-hidden rounded-2xl shadow-md ring-1 ring-sky-100 hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={e.foto}
                  alt={e.nombre}
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/20 to-transparent" />
              <div className="absolute bottom-0 p-5 text-white">
                <span className="text-xs font-semibold text-sky-300 uppercase tracking-wide">
                  {e.categoria}
                </span>
                <h3 className="text-xl font-bold">{e.nombre}</h3>
                <span className="mt-1 inline-flex items-center gap-1 text-sm text-sky-100/80 group-hover:gap-2 transition-all">
                  Ver equipo →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* NOTICIAS + RETRANSMISIONES */}
      <section className="bg-ice-50 py-20">
        <div className="container-cvo grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <SectionHeading eyebrow="Actualidad" title="Últimas noticias" />
            <div className="grid sm:grid-cols-2 gap-6">
              {NOTICIAS.slice(0, 2).map((n) => (
                <article
                  key={n.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm ring-1 ring-sky-100 hover:shadow-lg transition"
                >
                  <img src={n.imagen} alt={n.titulo} className="aspect-[16/10] w-full object-cover" />
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
            <Link
              to="/noticias"
              className="inline-block mt-6 font-semibold text-brand-500 hover:text-brand-600"
            >
              Ver todas las noticias →
            </Link>
          </div>

          {/* Retransmisiones */}
          <div>
            <SectionHeading eyebrow="En directo" title="Retransmisiones" />
            <div className="space-y-3">
              {RETRANSMISIONES.map((r) => (
                <a
                  key={r.titulo}
                  href={r.url}
                  className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-sky-100 hover:ring-brand-400 transition"
                >
                  <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-500 text-white">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-semibold text-navy-900 text-sm leading-snug">{r.titulo}</p>
                    <p className="text-xs text-navy-800/60 mt-1">
                      {r.plataforma} · {r.fecha}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA TIENDA */}
      <section className="container-cvo py-20">
        <div className="relative overflow-hidden rounded-3xl bg-navy-900 px-8 py-14 md:px-16 text-white">
          <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-brand-500/20 blur-2xl" />
          <div className="relative md:flex items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-extrabold">Lleva los colores del club</h2>
              <p className="mt-3 text-sky-100/80 max-w-md">
                Sudaderas, gorras, botellas y mucho más en nuestra tienda oficial. Apoya al club
                con cada compra.
              </p>
            </div>
            <Link
              to="/tienda"
              className="mt-6 md:mt-0 inline-block rounded-lg bg-white text-navy-900 px-8 py-3.5 font-bold hover:bg-sky-100 transition whitespace-nowrap"
            >
              Ir a la tienda
            </Link>
          </div>
        </div>
      </section>

      {/* PATROCINADORES banda */}
      <section className="border-t border-sky-100 py-12">
        <div className="container-cvo">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-navy-800/40 mb-6">
            Patrocinadores oficiales
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {PATROCINADORES.map((p) => (
              <img
                key={p.nombre}
                src={p.imagen}
                alt={p.nombre}
                className="h-10 opacity-60 hover:opacity-100 grayscale hover:grayscale-0 transition"
              />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

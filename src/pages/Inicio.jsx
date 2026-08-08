import { Link } from 'react-router-dom'
import SectionHead from '../components/SectionHead'
import Stats from '../components/Stats'
import JoinCta from '../components/JoinCta'
import Sponsors from '../components/Sponsors'
import {
  club,
  cifrasClub,
  equiposDestacados,
  noticias,
  retransmisiones,
  estadoPreinscripcion,
  textoPreinscripcion,
} from '../data/contenido'

export default function Inicio() {
  const destacadas = noticias.slice(0, 2)

  return (
    <>
      {/* ─────────── hero ─────────── */}
      <section className="hero" id="hero">
        {/* poster: primer fotograma, para que no haya hueco negro mientras carga el vídeo */}
        <video src="/media/hero.mp4" poster="/media/hero-poster.jpg" autoPlay muted loop playsInline />
        <div className="veil"></div>
        <div className="grain"></div>
        <div className="hero-in">
          <h1>
            Club Voleibol<em>Oviedo</em>
          </h1>
          {/* Texto dictado por el club el 08-08-2026: no reescribir. */}
          <p className="lede">
            Aquí se entrena, se compite y se construyen personas. Desde la cantera hasta la Superliga 2, todos
            compartimos el mismo pabellón, la misma camiseta y los mismos valores. Porque en el Club Voleibol
            Oviedo no solo formamos jugadores: formamos equipos, amistades y futuro.
          </p>
          <div className="btns">
            <a className="btn" href="#equipos">Ver equipos</a>
            <Link className="btn ghost" to="/inscripciones">Apúntate al club</Link>
          </div>
          <div className="kicker below">Temporada 2026/27 · Superliga 2 · Primera Nacional</div>
        </div>
      </section>

      {/* ─────────── sede ─────────── */}
      <div className="venue">
        <div className="venue-in">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 21s7-6.5 7-11a7 7 0 1 0-14 0c0 4.5 7 11 7 11z" />
            <circle cx="12" cy="10" r="2.6" />
          </svg>
          <span>
            Jugamos en el <b>{club.sedeCorta}</b> · {club.localidad}
          </span>
          <Link to="/contacto">Cómo llegar →</Link>
        </div>
      </div>

      {/* ─────────── cifras ─────────── */}
      <Stats items={cifrasClub} />

      {/* ─────────── equipos ─────────── */}
      <section className="sec" id="equipos">
        <SectionHead title="Nuestros equipos" link="/calendario" linkText="Calendario y resultados →" />
        <div className="teams">
          {equiposDestacados.map((eq) => (
            <Link key={eq.nombre} className="team" to={eq.href ?? `/equipos/${eq.slug}`}>
              <div className="ph">
                <img src={eq.img} alt={eq.alt} />
              </div>
              <div className="ov"></div>
              <div className="txt">
                <div className="cat">{eq.categoria}</div>
                <h3>{eq.nombre}</h3>
                <p>{eq.resumen}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─────────── actualidad ─────────── */}
      <div className="band">
        <section className="sec" id="noticias">
          <SectionHead title="Actualidad" link="/noticias" linkText="Todas las noticias →" />
          <div className="cols">
            <div className="news">
              {destacadas.map((n) => (
                <Link key={n.id} className="card" to="/noticias">
                  <div className="ph">
                    <img src={n.img} alt={n.titulo} />
                  </div>
                  <div className="in">
                    <div className="meta">
                      <b>{n.categoria}</b>
                      <span>{n.fecha}</span>
                    </div>
                    <h3>{n.titulo}</h3>
                    <p>{n.resumen}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div>
              <div className="sechead" style={{ marginBottom: 18 }}>
                <h2 style={{ fontSize: 24 }}>Retransmisiones</h2>
              </div>
              <div className="streams">
                {/* PENDIENTE: enlaces reales a los vídeos de YouTube */}
                {retransmisiones.map((r) => (
                  <a className="stream" href="#" key={r.titulo}>
                    <span className="play">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                    <span>
                      <b>{r.titulo}</b>
                      <span>{r.detalle}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ─────────── inscripción ─────────── */}
      <JoinCta
        id="apuntate"
        title="¿Te apuntas?"
        text={textoPreinscripcion[estadoPreinscripcion()]}
      />

      {/* ─────────── patrocinadores ─────────── */}
      <Sponsors />
    </>
  )
}

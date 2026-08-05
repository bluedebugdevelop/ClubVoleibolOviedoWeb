import { Link } from 'react-router-dom'
import PageHead from '../components/PageHead'
import SectionHead from '../components/SectionHead'
import JoinCta from '../components/JoinCta'
import Sponsors from '../components/Sponsors'
import Pendiente from '../components/Pendiente'
import { club, hitos, palmares, valores } from '../data/contenido'

/* El palmarés se ordena aquí, de lo más reciente a lo más antiguo, en vez de
   pedir que la lista venga colocada: se va completando por tandas y a mano se
   acababa metiendo alguna fuera de sitio. Se mira el primer año de la
   temporada, así «2019/20» y «2019» caen juntos, y los empates respetan el
   orden en que están escritas. */
const anio = (p) => Number(/\d{4}/.exec(p.temporada)?.[0] ?? 0)
const porFecha = [...palmares].sort((a, b) => anio(b) - anio(a))

export default function QuienesSomos() {
  return (
    <>
      <PageHead
        crumbs={<><Link to="/">Inicio</Link> · Quiénes somos</>}
        kicker={`Desde ${club.fundacion}`}
        title="Quiénes somos"
        sub="35 años de voleibol en Oviedo: de un único equipo sénior a un club con 13 equipos federados y 240 canteranos."
        bg="/media/celebracion-punto.jpg"
        foco="center 55%"
      />

      <section className="sec">
        <SectionHead title="Nuestra historia" />
        <div className="historia">
          <p>
            El Club Voleibol Oviedo nació en {club.fundacion} con un solo equipo sénior masculino. Desde entonces
            no ha dejado de crecer: hoy es un club con 13 equipos federados, desde alevín hasta las dos plantillas
            que compiten en categoría nacional, Superliga 2 Masculino y Primera Nacional Femenina.
          </p>
          <p>
            Todo el club entrena y compite en el mismo pabellón, el {club.sede}, con la misma camiseta para el
            alevín que empieza y para quien ya juega a nivel nacional. Más de 240 canteranos pasan cada semana por
            sus pistas.
          </p>
          <p>
            La cantera es el corazón del proyecto: la mayoría de quienes hoy visten la camiseta del primer equipo
            se han formado en el propio club, año a año, desde los equipos de base.
          </p>
        </div>
      </section>

      <div className="band">
        <section className="sec">
          <SectionHead title="Hitos del club" />
          <div className="timeline">
            {hitos.map((h) => (
              <div className="tl-item" key={h.anio}>
                <b>{h.anio}</b>
                <p>{h.texto}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="sec">
        <SectionHead title="Palmarés" />
        {palmares.length > 0 ? (
          <>
            <ol className="palmares">
              {porFecha.map((p) => (
                <li
                  className={`pal${p.destacado ? ' oro' : ''}`}
                  key={`${p.temporada}-${p.equipo}-${p.logro}`}
                >
                  <span className="temp">{p.temporada}</span>
                  <span className="cuerpo">
                    <b>{p.logro}</b>
                    <span className="eq">
                      {p.equipo}
                      {p.disciplina && <i>{p.disciplina}</i>}
                      {p.lugar && <i>{p.lugar}</i>}
                    </span>
                  </span>
                  <span className={`ambito ${p.ambito === 'España' ? 'es' : 'as'}`}>{p.ambito}</span>
                </li>
              ))}
            </ol>
            {/* El club va pasando el palmarés por tandas: se dice, para que no
                parezca que esto es todo lo que ha ganado en 35 años. */}
            <p className="palmares-nota">Seguimos recopilando el resto del palmarés del club.</p>
          </>
        ) : (
          <Pendiente titulo="El palmarés todavía no está publicado">
            Estamos recopilando los campeonatos de España y los resultados a nivel nacional del club, con su
            categoría y su año, para contarlos como se merecen.
          </Pendiente>
        )}
      </section>

      <section className="sec">
        <SectionHead title="Nuestros valores" />
        <div className="values">
          {valores.map((v) => (
            <div className="value" key={v.titulo}>
              <h3>{v.titulo}</h3>
              <p>{v.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="band">
        <section className="sec">
          <SectionHead title="Instalaciones" />
          <div className="instalaciones">
            <div>
              <p>
                Jugamos y entrenamos en el {club.sede}, un pabellón polideportivo municipal con pista
                homologada para competición nacional, graderío y vestuarios propios para los equipos visitantes.
              </p>
              <p>
                Los 13 equipos del club comparten la misma instalación, con horarios repartidos entre tarde y
                noche de lunes a viernes, y competición la mayoría de los fines de semana.
              </p>
            </div>
            <div className="ph">
              <img src="/media/pista-azul.jpg" alt="Pista del Polideportivo José Manuel Fuente" />
            </div>
          </div>
        </section>
      </div>

      <JoinCta
        title="¿Te apuntas?"
        text="Inscripciones abiertas para la temporada 26/27, desde los 8 años. Rellena el formulario y te decimos con qué equipo entrena."
      />

      <Sponsors />
    </>
  )
}

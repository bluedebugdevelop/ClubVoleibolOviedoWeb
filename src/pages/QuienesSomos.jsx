import { PageHero } from './Equipos'
import SectionHeading from '../components/SectionHeading'
import { CLUB } from '../data/content'

const VALORES = [
  { icon: '🤝', titulo: 'Compañerismo', texto: 'El equipo por encima de todo. Cuidamos el ambiente dentro y fuera de la pista.' },
  { icon: '🏐', titulo: 'Deporte base', texto: 'Formamos a niños y niñas desde la cantera con los valores del voleibol.' },
  { icon: '🏆', titulo: 'Ambición', texto: 'Competimos para ganar, siempre desde el respeto y el juego limpio.' },
  { icon: '💙', titulo: 'Identidad', texto: 'Orgullo asturiano. Representamos a Oviedo allá donde jugamos.' },
]

const HITOS = [
  { año: CLUB.fundacion, texto: 'Fundación del Club Voleibol Oviedo.' },
  { año: 2008, texto: 'Creación de la escuela de cantera y los primeros equipos de base.' },
  { año: 2016, texto: 'Ascenso del primer equipo masculino a categoría nacional.' },
  { año: 2023, texto: 'Récord histórico de deportistas federados en el club.' },
  { año: 2025, texto: 'Nueva imagen corporativa y renovación del proyecto deportivo.' },
]

export default function QuienesSomos() {
  return (
    <>
      <PageHero
        title="Quiénes somos"
        subtitle={`${CLUB.lema}. Conoce la historia, los valores y las personas que forman el ${CLUB.nombre}.`}
      />

      {/* Intro */}
      <section className="container-cvo py-16 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <SectionHeading eyebrow="El club" title={`Más que un equipo desde ${CLUB.fundacion}`} />
          <div className="space-y-4 text-navy-800/80 leading-relaxed">
            <p>
              El {CLUB.nombre} nació con una idea sencilla: acercar el voleibol a Oviedo y crear un
              espacio donde deportistas de todas las edades pudieran crecer, competir y disfrutar.
            </p>
            <p>
              Hoy somos un club con cuatro equipos en competición, una cantera en plena expansión y
              una afición fiel que llena las gradas del polideportivo cada fin de semana.
            </p>
            <p>
              Nuestro compromiso es doble: rendimiento deportivo al máximo nivel y formación en
              valores para las generaciones más jóvenes.
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-brand-400/10 blur-3xl rounded-full" />
          <img
            src="/images/logo.jpg"
            alt={CLUB.nombre}
            className="relative mx-auto h-64 w-64 rounded-full object-cover ring-8 ring-sky-100 shadow-xl"
          />
        </div>
      </section>

      {/* Valores */}
      <section className="bg-ice-50 py-16">
        <div className="container-cvo">
          <SectionHeading center eyebrow="Nuestros valores" title="Lo que nos define" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALORES.map((v) => (
              <div key={v.titulo} className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-sky-100 text-center">
                <div className="text-4xl mb-3">{v.icon}</div>
                <h3 className="font-bold text-navy-900 text-lg">{v.titulo}</h3>
                <p className="mt-2 text-sm text-navy-800/70">{v.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Historia / hitos */}
      <section className="container-cvo py-16">
        <SectionHeading eyebrow="Nuestra historia" title="Un recorrido de superación" />
        <div className="relative border-l-2 border-sky-100 ml-3 space-y-8">
          {HITOS.map((h) => (
            <div key={h.año} className="relative pl-8">
              <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-brand-500 ring-4 ring-white" />
              <div className="text-brand-500 font-extrabold font-display text-xl">{h.año}</div>
              <p className="text-navy-800/80">{h.texto}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

import { Link, useParams } from 'react-router-dom'
import PageHead from '../components/PageHead'
import Sponsors from '../components/Sponsors'
import NoEncontrado from './NoEncontrado'
import { club, noticias, preinscripcion, estadoPreinscripcion } from '../data/contenido'

/* Ficha de una noticia: `/noticias/<slug>`. Sin `cuerpo` escrito no hay nada
   que enseñar, así que cae a 404 — mismo criterio que la ficha de patrocinador. */
export default function Noticia() {
  const { slug } = useParams()
  const noticia = noticias.find((n) => n.slug === slug)

  if (!noticia || !noticia.cuerpo) return <NoEncontrado />

  return (
    <>
      <PageHead
        crumbs={
          <>
            <Link to="/">Inicio</Link> · <Link to="/noticias">Noticias</Link> · {noticia.categoria}
          </>
        }
        kicker={noticia.categoria}
        title={noticia.titulo}
        sub={noticia.resumen}
        bg={noticia.img}
        foco={noticia.foco}
      />

      <section className="sec">
        <article className="articulo">
          <p className="fecha">{noticia.fecha}</p>

          {noticia.cuerpo.map((t) => (
            <p key={t.slice(0, 40)}>{t}</p>
          ))}

          {noticia.cta === 'preinscripcion' && <CtaPreinscripcion />}
        </article>

        <p className="volver">
          <Link to="/noticias">← Todas las noticias</Link>
        </p>
      </section>

      <Sponsors />
    </>
  )
}

/**
 * Enlace al formulario, con la misma regla que /inscripciones: solo se enseña
 * el botón DENTRO de la ventana de preinscripción. Fuera de ella se avisa y se
 * deja el correo del club, para que la noticia no envíe a nadie a un formulario
 * fuera de plazo. La fecha manda: no hay que acordarse de tapar el botón.
 */
function CtaPreinscripcion() {
  const ventana = estadoPreinscripcion()

  return (
    <div className="articulo-cta">
      {ventana === 'abierta' && (
        <>
          <p className="notice bien">
            <b>Preinscripción abierta {preinscripcion.texto}.</b> Se rellena en unos minutos y nos ponemos en
            contacto contigo.
          </p>
          {/* La flecha va en su propio span para poder avanzar sola al pasar
              por encima. Es decorativa: no se lee. */}
          <a className="btn solid grande" href={preinscripcion.url} target="_blank" rel="noreferrer">
            Abrir el formulario
            <span className="flecha" aria-hidden="true">→</span>
          </a>
          <p className="letra-pequena">
            Si tienes dudas antes de rellenarlo, escríbenos a{' '}
            <a href={`mailto:${club.email}`}>{club.email}</a>. Toda la información está en{' '}
            <Link to="/inscripciones">la página de preinscripción</Link>.
          </p>
        </>
      )}

      {ventana === 'antes' && (
        <>
          <p className="notice aviso">
            <b>La preinscripción todavía no está abierta.</b> El plazo es {preinscripcion.texto}: vuelve esos
            días y el formulario estará aquí mismo.
          </p>
          <p className="letra-pequena">
            Si quieres que te avisemos cuando abra, escríbenos a{' '}
            <a href={`mailto:${club.email}`}>{club.email}</a>.
          </p>
        </>
      )}

      {ventana === 'cerrada' && (
        <>
          <p className="notice aviso">
            <b>La preinscripción está cerrada.</b> El plazo fue {preinscripcion.texto}.
          </p>
          <p className="letra-pequena">
            Escríbenos a <a href={`mailto:${club.email}`}>{club.email}</a> y te decimos si queda hueco en algún
            equipo.
          </p>
        </>
      )}
    </div>
  )
}

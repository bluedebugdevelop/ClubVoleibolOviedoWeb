import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHead from '../components/PageHead'
import Sponsors from '../components/Sponsors'
import NoEncontrado from './NoEncontrado'
import { club, preinscripcion, estadoPreinscripcion } from '../data/contenido'
import { useNoticias } from '../data/contenidoContexto'
import { SITIO, ID_CLUB, useJsonLd, fechaIso } from '../seo'

/* Ficha de una noticia: `/noticias/<slug>`. Sin `cuerpo` escrito no hay nada
   que enseñar, así que cae a 404 — mismo criterio que la ficha de patrocinador. */
export default function Noticia() {
  const { slug } = useParams()
  const noticia = useNoticias().find((n) => n.slug === slug)
  const publicada = noticia && noticia.cuerpo?.length ? noticia : null

  /* El JSON-LD se declara ANTES del 404 de abajo porque un hook no puede
     quedarse detrás de un `return`: con la noticia sin escribir recibe null y
     no mete nada en el <head>. */
  useJsonLd(fichaNoticia(publicada))

  if (!publicada) return <NoEncontrado />

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
        {/* El texto va en su columna de lectura y las imágenes AL LADO, en el
            hueco que quedaba vacío a la derecha. Debajo del texto obligaban a
            bajar para nada y encima no cabían más grandes. En pantalla estrecha
            la galería vuelve a caer debajo. */}
        <div className="articulo-lado">
          <article className="articulo">
            <p className="fecha">{noticia.fecha}</p>

            {noticia.cuerpo.map((t) => (
              <p key={t.slice(0, 40)}>{t}</p>
            ))}

            {noticia.cta === 'preinscripcion' && <CtaPreinscripcion />}
          </article>

          {/* Carteles, calendarios y gráficos que acompañan al texto: en
              miniatura, y se tocan para verlos grandes. */}
          <Galeria imagenes={noticia.galeria} />
        </div>

        <p className="volver">
          <Link to="/noticias">← Todas las noticias</Link>
        </p>
      </section>

      <Sponsors />
    </>
  )
}

/**
 * Las imágenes de dentro de la noticia: miniaturas en fila y, al tocar una, la
 * foto entera encima de la página.
 *
 * El visor va a mano y no con una librería porque es esto: un div encima de
 * todo, tres formas de cerrarlo (fuera, la X y Escape) y nada más. Mientras
 * está abierto se bloquea el scroll del fondo, que si no la página de detrás se
 * mueve al arrastrar sobre la foto.
 */
function Galeria({ imagenes }) {
  const [abierta, setAbierta] = useState(null)

  useEffect(() => {
    if (!abierta) return undefined
    const conTecla = (e) => {
      if (e.key === 'Escape') setAbierta(null)
    }
    const scrollAntes = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', conTecla)
    return () => {
      document.body.style.overflow = scrollAntes
      window.removeEventListener('keydown', conTecla)
    }
  }, [abierta])

  if (!imagenes?.length) return null

  return (
    <>
      <div className="articulo-galeria">
        {imagenes.map((g) => (
          <figure key={g.ruta}>
            <button type="button" onClick={() => setAbierta(g)} aria-label={`Ver ${g.pie || 'la imagen'} más grande`}>
              <img src={g.ruta} alt={g.pie || ''} loading="lazy" />
            </button>
            {g.pie && <figcaption>{g.pie}</figcaption>}
          </figure>
        ))}
      </div>

      {abierta && (
        /* El clic en el fondo cierra; el de dentro de la foto no, o cerraría al
           intentar mirarla de cerca. */
        <div className="visor" role="dialog" aria-modal="true" aria-label={abierta.pie || 'Imagen'}
          onClick={() => setAbierta(null)}>
          <button type="button" className="cerrar" aria-label="Cerrar" onClick={() => setAbierta(null)}>×</button>
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={abierta.ruta} alt={abierta.pie || ''} />
            {abierta.pie && <figcaption>{abierta.pie}</figcaption>}
            {/* En un móvil la foto grande cabe a lo ancho de la pantalla y un
                calendario de once filas sigue pidiendo lupa. Este enlace abre
                el fichero suelto, que ya se amplía con los dedos. */}
            <a href={abierta.ruta} target="_blank" rel="noreferrer">Abrir a tamaño completo</a>
          </figure>
        </div>
      )}
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

/**
 * La noticia contada en JSON-LD, para que Google sepa que esto es una noticia
 * con fecha y no una página suelta: es lo que le deja enseñarla en Google
 * Noticias y en Discover.
 *
 * El autor y el editor no se repiten aquí, se apunta al SportsClub que ya
 * declara `index.html` con su `@id`. Así el club es una sola entidad para
 * Google y no tres que se llaman parecido.
 *
 * Lo que no se sepa se deja fuera en vez de rellenarlo: sin fecha reconocible
 * no hay `datePublished`, y sin foto no hay `image`. Un campo inventado vale
 * menos que un campo ausente.
 */
function fichaNoticia(n) {
  if (!n) return null

  const fecha = fechaIso(n.fecha)
  const fotos = [n.img, ...(n.galeria ?? []).map((g) => g.ruta)]
    .filter(Boolean)
    .map((ruta) => (ruta.startsWith('http') ? ruta : SITIO + ruta))

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: n.titulo,
    description: n.resumen,
    articleSection: n.categoria,
    inLanguage: 'es-ES',
    mainEntityOfPage: `${SITIO}/noticias/${n.slug}`,
    ...(fotos.length ? { image: fotos } : {}),
    ...(fecha ? { datePublished: fecha, dateModified: fecha } : {}),
    author: { '@id': ID_CLUB },
    publisher: { '@id': ID_CLUB },
  }
}

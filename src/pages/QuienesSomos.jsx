import { Link } from 'react-router-dom'
import PageHead from '../components/PageHead'
import SectionHead from '../components/SectionHead'
import JoinCta from '../components/JoinCta'
import Sponsors from '../components/Sponsors'
import Pendiente from '../components/Pendiente'
import { club, hitos, palmares, valores, estadoPreinscripcion, textoPreinscripcion } from '../data/contenido'

/* El palmarés se ordena aquí, de lo más reciente a lo más antiguo, en vez de
   pedir que la lista venga colocada: se va completando por tandas y a mano se
   acababa metiendo alguna fuera de sitio. Se mira el primer año de la
   temporada, así «2019/20» y «2019» caen juntos, y los empates respetan el
   orden en que están escritas. */
const anio = (p) => Number(/\d{4}/.exec(p.temporada)?.[0] ?? 0)
const porFecha = [...palmares].sort((a, b) => anio(b) - anio(a))

/* ---------------------------------------------------------------------------
   Camino de hitos — un solo trazo que serpentea de 1991 a 2026, con un balón
   marcando cada año y la ficha alternando arriba y abajo del camino.

   La regla que hace que nada se toque: CADA HITO ES UNA CRESTA O UN VALLE.
   Si la ficha va arriba, su punto tiene que ser lo más alto del tramo; si va
   abajo, lo más bajo. Así el camino se aleja de la ficha por los dos lados en
   vez de cruzarla. Puesto un hito a media pendiente, la curva le entra por
   encima del texto — no hay separación que lo arregle.

   Consecuencia: `lado` no se puede alternar a ciegas, va atado a la forma de
   la curva. Al mover un punto hay que mirar los dos vecinos.

   El trazo se calcula con Catmull-Rom sobre los puntos de RUTA, así que pasa
   EXACTAMENTE por cada balón y sale limpio. Nada de copiar un trazo de ratón:
   se dibuja la intención (por dónde y con cuánta panza) y la curva la saca la
   fórmula.
   --------------------------------------------------------------------------- */
const VB = { w: 1240, h: 1180 }

/* Puntos por los que pasa el camino, en orden. Los que llevan `hito` son un
   año y se marcan con balón; el resto solo dan forma —son los que hacen la
   panza de las curvas y los dos giros de los extremos—. */
/* `hueco` es la separación entre el punto del camino y su ficha, en píxeles.
   Solo se pone donde hay que apartarse de lo normal (`--hueco` en el CSS).
   Medido el 10-08-2026 con la curva ya pintada: casi todas las fichas se
   quedaban a 38-40 px del trazo, pero 2019 caía a 19 y 2014 a 31, porque por
   ahí la curva se les acerca de lado. Diego dio por buenas 2022 y 2026, así
   que esas dos se quedan con el hueco de antes y las demás se separan. */
const HUECO_ORIGINAL = 40
const RUTA = [
  { x: 20, y: 120 },                          // entra por arriba a la izquierda
  { x: 150, y: 215, hito: 0, lado: 'abajo' },   // 1991 · valle
  { x: 310, y: 150 },
  { x: 470, y: 135, hito: 1, lado: 'arriba' },  // 1998 · cresta
  { x: 640, y: 190 },
  { x: 800, y: 215, hito: 2, lado: 'abajo' },   // 2006 · valle
  { x: 1010, y: 160 },
  { x: 1160, y: 270 },                        // giro de la derecha
  { x: 1200, y: 430 },
  { x: 1150, y: 560 },
  { x: 930, y: 585, hito: 3, lado: 'arriba', hueco: 64 },  // 2014 · cresta
  { x: 790, y: 640 },
  { x: 650, y: 665, hito: 4, lado: 'abajo' },   // 2017 · valle
  { x: 500, y: 625 },
  { x: 350, y: 585, hito: 5, lado: 'arriba' },  // 2018 · cresta
  { x: 150, y: 640 },
  { x: 55, y: 780 },                          // giro de la izquierda
  { x: 110, y: 910 },
  { x: 330, y: 955, hito: 6, lado: 'arriba', hueco: 76 },  // 2019 · cresta
  { x: 490, y: 1010 },
  { x: 640, y: 1035, hito: 7, lado: 'abajo', hueco: HUECO_ORIGINAL },  // 2022 · valle
  { x: 820, y: 990 },
  { x: 980, y: 940, hito: 8, lado: 'arriba', hueco: HUECO_ORIGINAL },  // 2026 · cresta
  { x: 1160, y: 1010 },                       // y sale por abajo a la derecha
]

/* Catmull-Rom a bezier cúbica: una curva suave que pasa por todos los puntos.
   Se calcula una vez al cargar el módulo, no en cada pintado. */
function trazaSuave(pts) {
  const n = (v) => Number(v.toFixed(1))
  let d = `M${n(pts[0].x)},${n(pts[0].y)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }
    d += ` C${n(c1.x)},${n(c1.y)} ${n(c2.x)},${n(c2.y)} ${n(p2.x)},${n(p2.y)}`
  }
  return d
}
const TRAZO = trazaSuave(RUTA)
/* Largo del trazo en unidades del viewBox. Lo usa el dibujado al bajar
   (stroke-dasharray). Medido con getTotalLength() sobre este mismo camino: si
   se toca RUTA hay que volver a medirlo, o la animación se corta a medias. */
const LARGO = 4021

const PARADAS = RUTA.filter((p) => p.hito !== undefined)
const pc = (v, total) => `${(v / total) * 100}%`

/* ---------------------------------------------------------------------------
   Los dos tratamientos que Diego quiere comparar montados de verdad:

   'pista'   — banda blanca con filo azul, como las líneas pintadas del campo,
               pasada por un filtro de grano.
   'pisadas' — huellas de zapatilla alternando pie, con una línea muy tenue por
               debajo que cose el recorrido. Sin esa línea, en los tramos
               largos se ven huellas sueltas y se pierde el hilo.

   Al elegir uno se borra el otro y esta constante.
   --------------------------------------------------------------------------- */
const ESTILO = 'pisadas'

/* ---------------------------------------------------------------------------
   Huella de playero de vóley, apuntando hacia arriba. Se gira luego según hacia
   dónde va la marcha.

   El intento anterior era cápsula + óvalo suelto de talón, y a tamaño de
   pantalla se leía como dos manchas, no como una pisada (Diego, 08-08-2026).
   Lo que la hace reconocible no es el tamaño: es la SILUETA DE SUELA ENTERA
   —antepié ancho, cintura estrecha por el puente, talón redondo— más las
   ranuras del dibujo. La suela de un playero de vóley va de una pieza, con el
   arco marcado; separar el talón rompe justo la parte que se reconoce.

   Proporción: 26,8 de largo por 10,8 de ancho ≈ 2,5:1, que es la de una suela
   de verdad. Estirándola más parece un dedo; ensanchándola, una mancha.
   --------------------------------------------------------------------------- */
/* CONTORNO. No está dibujado a ojo: sale de una suela generada con fal.ai
   (`cvo/material/pisada/4-huella-tinta.png`), binarizada y vectorizada con
   potrace, y luego escalada a estas unidades —26,8 de alto por 9,9 de ancho—
   con el centro en 0,0 y la puntera hacia -Y. Por eso es ASIMÉTRICO: es un pie
   concreto, y el otro se saca reflejándolo (ver el `scale` del render).

   El relleno que traía la imagen era ruido tipo huella dactilar y no valía; lo
   único que se aprovecha es la silueta. El taqueado va aquí debajo, a mano. */
const CONTORNO =
  'M-0.03,-13.32 C-1.42,-13.03 -2.33,-12.12 -3.4,-9.97 C-5.22,-6.3 -5.44,-3.24 -4.13,0.23 ' +
  'C-3.19,2.72 -2.98,3.88 -3.08,5.93 C-3.33,11.06 -1.98,13.6 0.91,13.44 ' +
  'C4.22,13.25 5.16,10.02 3.38,4.91 C2.78,3.18 2.68,1.9 3.02,0.31 ' +
  'C3.15,-0.29 3.33,-0.68 3.79,-1.38 C4.87,-3.05 5.16,-4.41 4.93,-6.89 ' +
  'C4.49,-11.61 2.72,-13.9 -0.03,-13.32'

/* TAQUEADO, copiado de la foto de referencia: espigas en el antepié, pivote en
   X bajo la planta, arco liso y dos espigas más en el talón. Cada pieza va como
   subtrazo del mismo <path> y se recorta con `fill-rule="evenodd"`, así el
   hueco es transparente de verdad y no un trazo del color del fondo.

   Las anchuras están medidas contra el contorno fila a fila, con 0,85 de margen
   por cada lado: si una espiga sobresale deja de leerse como dibujo de suela y
   parece un corte. Al cambiar el contorno hay que volver a medirlas. */
const TAQUEADO = [
  'M-2,-9.9 L0,-11.4 L3.11,-9.9 L3.11,-8.95 L0,-10.45 L-2,-8.95 Z',
  'M-3,-7.9 L0,-9.4 L3.72,-7.9 L3.72,-6.95 L0,-8.45 L-3,-6.95 Z',
  'M-3.72,-5.9 L0,-7.4 L4,-5.9 L4,-4.95 L0,-6.45 L-3.72,-4.95 Z',
  'M-4.05,-3.9 L0,-5.4 L4.11,-3.9 L4.11,-2.95 L0,-4.45 L-4.05,-2.95 Z',
  'M-2.5,-4.14 L2.5,0.86 L2.5,2.14 L-2.5,-2.86 Z',
  'M-2.5,0.86 L2.5,-4.14 L2.5,-2.86 L-2.5,2.14 Z',
  'M-2.28,8.1 L0,6.6 L3.11,8.1 L3.11,9.05 L0,7.55 L-2.28,9.05 Z',
  'M-2,10.3 L0,8.8 L3.33,10.3 L3.33,11.25 L0,9.75 L-2,11.25 Z',
].join(' ')

const HUELLA = `${CONTORNO} ${TAQUEADO}`

/* [x, y, giro] de cada pisada. Van precalculadas y no se sacan en cada pintado
   porque hace falta getPointAtLength() —o sea, un <path> ya montado en el
   documento— para saber por dónde pasa la curva y con qué inclinación.

   Se regeneran midiendo el trazo en el navegador: un punto cada 100 unidades,
   desplazado 18 a un lado y a otro alternando pie. Si cambia RUTA, hay que
   volver a sacarlas o las huellas se quedan donde estaba el camino viejo.

   El paso salió de probar: a 74 unidades y escala 1.9 las huellas se pisaban
   entre sí y sobre este lienzo tan alto se leían como manchas. Con menos y más
   grandes se distingue la suela.

   VAN TODAS, sin huecos (Diego, 08-08-2026). Antes faltaban dos a propósito
   —las que caían sobre las fichas de 2014 y 2019—; él prefiere el rastro
   entero y apartar el texto. Manda la marcha: si una huella se monta sobre una
   ficha, se mueve la ficha, no se borra la huella. */
const PISADAS = [
  [9.3, 134.4, 126.7], [104.9, 173.1, 127.7], [192, 226.5, 70.4], [266.7, 147.6, 63.7],
  [373.5, 155.3, 81.4], [472.7, 117.2, 97.3], [559.2, 181, 111.6], [665.3, 177.8, 104.7],
  [757.3, 233.2, 94], [850.6, 183.9, 70.4], [955.5, 184, 74.1], [1055.3, 155.3, 114.6],
  [1114.7, 243.4, 136.3], [1199.3, 307.5, 159.9], [1182.1, 412.1, 178.7], [1205.9, 516.6, 199.4],
  [1113, 553.4, 259.5], [1017.1, 596, 268.5], [912.7, 570.7, 254.7], [832.7, 643.1, 245.7],
  [725.9, 638.8, 256.9], [628, 680.7, -81], [540.4, 618.4, -71.8], [433.6, 620.4, -68.9],
  [341.6, 567.4, 266.3], [248.8, 619.3, 255.3], [142, 623.7, 237.1], [98.4, 720.1, 212],
  [35.6, 805.1, 178], [103.6, 881.9, 134.6], [178.6, 950.2, 99.7], [283.3, 928, 98],
  [371.5, 986.8, 109.7], [476.7, 987.5, 107.4], [564.7, 1047.3, 101], [664.6, 1014, 80.5],
  [769.6, 1024, 72.9], [852.2, 959.2, 66.9], [955.6, 959.2, 81.4], [1056.7, 942.2, 111.9],
  [1132.7, 1017.4, 115.9],
]

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
          {/* Un solo camino con la ficha de cada año alternando arriba y abajo
              (Diego, 07-08-2026). Ver RUTA arriba para la regla de crestas y
              valles, que es lo que impide que la curva cruce el texto.

              SIN MARCADOR en cada año (Diego, 08-08-2026): los balones se
              quitaron, manda el rastro de pisadas. El año en grande de la ficha
              es lo que señala el punto.

              El trazo va en un SVG estirado sin conservar proporción, para que
              cubra el ancho que haya. Las fichas van en HTML colocadas por
              porcentaje: dentro de ese SVG el texto no sería texto. */}
          <div
            className="camino"
            data-estilo={ESTILO}
            style={{ aspectRatio: `${VB.w} / ${VB.h}`, '--largo': LARGO }}
          >
            {/* `preserveAspectRatio="none"` y no el ajuste por defecto: así el
                trazo cubre la caja exacta y las fichas —que van colocadas por
                porcentaje— caen siempre donde toca del camino. Con el ajuste
                por defecto, cualquier diferencia de proporción deja franjas y
                el camino se separa de las fichas. Como el alto va atado al
                ancho con `aspect-ratio`, la escala es igual en los dos ejes y
                no deforma nada. */}
            <svg className="camino-trazo" viewBox={`0 0 ${VB.w} ${VB.h}`} preserveAspectRatio="none" aria-hidden="true">
              {ESTILO === 'pista' ? (
                <>
                  <defs>
                    {/* Grano de tiza: ruido que desplaza el trazo unos píxeles
                        para que no parezca impreso a máquina. */}
                    <filter id="cvo-grano" x="-8%" y="-8%" width="116%" height="116%">
                      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="4" result="ruido" />
                      <feDisplacementMap in="SourceGraphic" in2="ruido" scale="6" xChannelSelector="R" yChannelSelector="G" />
                    </filter>
                  </defs>
                  <g filter="url(#cvo-grano)">
                    <path className="pista-filo avanza" d={TRAZO} />
                    <path className="pista-centro avanza" d={TRAZO} />
                  </g>
                </>
              ) : (
                <>
                  <path className="guia avanza" d={TRAZO} />
                  {PISADAS.map(([x, y, giro], i) => (
                    <g
                      key={i}
                      className="pisada"
                      /* El pie par va reflejado: la suela es asimétrica, así que
                         reflejarla es lo que convierte el rastro en izquierdo y
                         derecho. La paridad es la misma que la del lado al que
                         se desplaza cada huella, y por eso encajan. */
                      transform={`translate(${x},${y}) rotate(${giro}) scale(${i % 2 ? -2.5 : 2.5},2.5)`}
                      /* cuándo le toca aparecer a esta pisada, en tanto por
                         ciento del recorrido */
                      style={{ '--t': `${((i / (PISADAS.length - 1)) * 100).toFixed(1)}` }}
                    >
                      <path d={HUELLA} fillRule="evenodd" />
                    </g>
                  ))}
                </>
              )}
            </svg>
            <ol>
              {PARADAS.map((p) => {
                const h = hitos[p.hito]
                if (!h) return null
                return (
                  <li
                    key={h.anio}
                    className="parada"
                    data-lado={p.lado}
                    style={{
                      left: pc(p.x, VB.w),
                      top: pc(p.y, VB.h),
                      ...(p.hueco ? { '--hueco': `${p.hueco}px` } : null),
                    }}
                  >
                    <div className="ficha">
                      <b>{h.anio}</b>
                      <p>{h.texto}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>

          {/* En pantalla estrecha el camino no cabe: mismos hitos, lista de
              siempre. Se pintan los dos y el CSS enseña uno u otro — duplicar
              nueve líneas de texto sale más barato que un `matchMedia` que en
              la primera pintada no sabe todavía qué ancho hay. */}
          <ol className="camino-lista">
            {hitos.map((h) => (
              <li key={h.anio}>
                <b>{h.anio}</b>
                <p>{h.texto}</p>
              </li>
            ))}
          </ol>
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
        text={textoPreinscripcion[estadoPreinscripcion()]}
      />

      <Sponsors />
    </>
  )
}

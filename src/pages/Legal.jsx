import { Link } from 'react-router-dom'
import PageHead from '../components/PageHead'
import Pendiente from '../components/Pendiente'
import { club } from '../data/contenido'
import { legalActualizado, terceros, titular, tratamientos } from '../data/legal'

/* Aviso legal, privacidad y cookies. Los tres documentos comparten maqueta y
   viven aquí porque se leen juntos y se tocan juntos: si cambia lo que recoge
   un formulario, hay que repasar los tres.

   Los textos describen lo que la web hace HOY, no una plantilla genérica:
   qué formularios envían datos y qué terceros intervienen. Desde el 12-08-2026
   los tres envían: el de contacto también, que antes no. Ver
   src/data/legal.js. */

const CORREO = (
  <a href={`mailto:${club.email}`}>{club.email}</a>
)

function Identificacion() {
  const faltan = !titular.cif || !titular.domicilio || !titular.registro
  return (
    <>
      <ul className="legal-datos">
        <li><span>Denominación</span><b>{titular.denominacion}</b></li>
        {titular.cif && <li><span>CIF</span><b>{titular.cif}</b></li>}
        {titular.domicilio && <li><span>Domicilio social</span><b>{titular.domicilio}</b></li>}
        {titular.registro && <li><span>Registro</span><b>{titular.registro}</b></li>}
        <li><span>Sede deportiva</span><b>{club.sede}</b></li>
        {/* sin teléfono: no se publica en la web, y el correo basta como medio
            de contacto directo a efectos del art. 10 LSSI-CE */}
        <li><span>Correo electrónico</span><b>{club.email}</b></li>
      </ul>
      {faltan && (
        <Pendiente titulo="Faltan los datos de registro del club" contacto={false}>
          El CIF, el domicilio social y el número de inscripción en el Registro de Entidades Deportivas del
          Principado de Asturias todavía no están publicados aquí. Son obligatorios en el aviso legal y se
          añadirán en cuanto el club los facilite.
        </Pendiente>
      )}
    </>
  )
}

function AvisoLegal() {
  return (
    <div className="legal-doc">
      <h2>1. Quién es el titular de esta web</h2>
      <Identificacion />

      <h2>2. Para qué sirve este sitio</h2>
      <p>
        Esta web es informativa. Cuenta la actividad del {club.nombre}: sus equipos, el calendario y los
        resultados de las competiciones que juega, las noticias del club, los patrocinadores y cómo apuntarse.
        No se vende nada a través de ella.
      </p>

      <h2>3. Condiciones de uso</h2>
      <p>
        Navegar por esta web supone aceptar estas condiciones. Quien la use se compromete a hacerlo conforme a la
        ley y a no emplear los formularios para enviar contenido ilícito, ofensivo o datos de terceros sin su
        permiso.
      </p>

      <h2>4. Contenidos y propiedad intelectual</h2>
      <p>
        Los textos, las fotografías, el escudo y el diseño de esta web pertenecen al {club.nombre} o se usan con
        permiso de quien los hizo. No se pueden reproducir con fines comerciales sin autorización por escrito.
      </p>
      <p>
        Las fotografías muestran actividad deportiva del club. Si apareces en alguna y no quieres que siga
        publicada, escríbenos a {CORREO} y la retiramos.
      </p>

      <h2>5. Resultados y clasificaciones</h2>
      <p>
        El calendario, los resultados y las clasificaciones que se publican en la sección de{' '}
        <Link to="/calendario">calendario</Link> proceden de las webs oficiales de la Federación de Voleibol del
        Principado de Asturias y de la Real Federación Española de Voleibol, y se actualizan de forma automática.
        El club no responde de los errores o retrasos que puedan venir de origen.
      </p>

      <h2>6. Enlaces a otras webs</h2>
      <p>
        Esta web enlaza a páginas de terceros (federaciones, patrocinadores, redes sociales). El club no controla
        esos sitios ni responde de sus contenidos ni de sus políticas de privacidad.
      </p>

      <h2>7. Responsabilidad</h2>
      <p>
        Se procura que la información esté actualizada y sea correcta, pero puede contener errores. El club no se
        hace responsable de los daños que pudieran derivarse del uso de la web ni de las interrupciones del
        servicio ajenas a su control.
      </p>

      <h2>8. Legislación aplicable</h2>
      <p>
        Estas condiciones se rigen por la legislación española. Para cualquier controversia serán competentes los
        juzgados y tribunales de Oviedo.
      </p>
    </div>
  )
}

function Privacidad() {
  return (
    <div className="legal-doc">
      <h2>1. Quién trata tus datos</h2>
      <Identificacion />

      <h2>2. Qué datos se recogen y para qué</h2>
      <p>
        Esta web no pide registro ni crea cuentas de usuario. Solo se recogen datos personales cuando alguien
        rellena voluntariamente uno de estos formularios:
      </p>

      {tratamientos.map((t) => (
        <div className="legal-bloque" key={t.id}>
          <h3>{t.titulo} <span>{t.donde}</span></h3>
          <ul className="legal-datos">
            <li><span>Qué se pide</span><b>{t.datos}</b></li>
            <li><span>Para qué</span><b>{t.finalidad}</b></li>
            <li><span>Con qué legitimación</span><b>{t.base}</b></li>
            <li><span>Dónde va a parar</span><b>{t.gestion}</b></li>
            <li><span>Cuánto se conserva</span><b>{t.conservacion}</b></li>
          </ul>
        </div>
      ))}

      <p className="legal-nota">
        <b>Sobre la inscripción:</b> el formulario de inscripción no está en esta web, sino en Google Forms. Al
        abrirlo sales de este sitio y pasas a uno de Google, que puede pedirte iniciar sesión y trata tus datos
        también según su propia{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">política de privacidad</a>.
        Si prefieres no usarlo, puedes apuntarte por correo escribiendo a {CORREO}.
      </p>

      <h2>3. Datos de menores de edad</h2>
      <p>
        El formulario de inscripción recoge datos de niños y niñas. Debe rellenarlo siempre su padre, madre o
        tutor legal, que es quien da el consentimiento. Solo se piden los datos imprescindibles para poder llamar
        a la familia y asignar el grupo: ni DNI, ni datos médicos, ni bancarios. Todo eso se gestiona en persona
        al formalizar la ficha federativa.
      </p>

      <h2>4. Quién más interviene</h2>
      <p>
        Para que la web funcione y los formularios lleguen a su destino intervienen estos proveedores. Ninguno usa
        los datos para fines propios:
      </p>
      <div className="tabla-legal">
        <table className="table">
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Para qué</th>
              <th>Dónde</th>
            </tr>
          </thead>
          <tbody>
            {terceros.map((t) => (
              <tr key={t.nombre}>
                <td><b>{t.nombre}</b><i className="legal-sub">{t.papel}</i></td>
                <td>{t.detalle}</td>
                <td>{t.pais}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Algunos de estos proveedores están en Estados Unidos y pueden implicar una transferencia internacional de
        datos, amparada en las cláusulas contractuales tipo aprobadas por la Comisión Europea y en el marco de
        privacidad UE–EE. UU.
      </p>
      <p>
        Los datos no se venden ni se ceden a nadie más, salvo a la federación correspondiente cuando se tramita la
        ficha federativa de un jugador o jugadora, y a las administraciones públicas cuando la ley lo exija.
      </p>

      <h2>5. Tus derechos</h2>
      <p>
        Puedes pedir acceder a tus datos, rectificarlos, suprimirlos, limitar su tratamiento, oponerte a él o
        pedir su portabilidad. También puedes retirar en cualquier momento el consentimiento que hayas dado, sin
        que eso afecte a lo hecho antes.
      </p>
      <p>
        Para ejercerlos, escribe a {CORREO} indicando qué derecho quieres ejercer. Si consideras que no se han
        atendido correctamente, puedes reclamar ante la Agencia Española de Protección de Datos{' '}
        (<a href="https://www.aepd.es" target="_blank" rel="noreferrer">aepd.es</a>).
      </p>

      <h2>6. Decisiones automatizadas</h2>
      <p>
        No se toman decisiones automatizadas ni se elaboran perfiles con los datos recogidos en esta web.
      </p>
    </div>
  )
}

function Cookies() {
  return (
    <div className="legal-doc">
      <h2>1. Esta web no usa cookies propias</h2>
      <p>
        El {club.nombre} no instala ninguna cookie en tu navegador: ni de sesión, ni de preferencias, ni
        publicitarias. Tampoco se usa ninguna herramienta de analítica ni de seguimiento, así que no se mide ni se
        registra por dónde navegas.
      </p>

      <h2>2. Cookies de terceros</h2>
      <p>
        Hay un único punto en el que un tercero puede instalar cookies:
      </p>
      <div className="legal-bloque">
        <h3>Google Maps <span>solo en /contacto</span></h3>
        <p>
          La página de <Link to="/contacto">contacto</Link> incluye un mapa de Google para enseñar dónde está el
          pabellón. Al cargarse, Google puede instalar sus propias cookies y recibe tu dirección IP. Es el único
          contenido de la web que hace esto, y solo ocurre si visitas esa página.
        </p>
      </div>
      <p>
        Además, las tipografías se cargan desde los servidores de Google Fonts. Eso <b>no instala cookies</b>,
        pero Google recibe la dirección IP desde la que se piden.
      </p>
      <p>
        Puedes consultar cómo trata Google esos datos en su{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">política de privacidad</a>.
      </p>

      <h2>3. Cómo desactivarlas</h2>
      <p>
        Puedes bloquear o borrar las cookies desde la configuración de tu navegador. Si bloqueas las de terceros,
        el mapa de la página de contacto puede dejar de verse; el resto de la web funciona igual.
      </p>
      <ul className="legal-lista">
        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noreferrer">Chrome</a></li>
        <li><a href="https://support.mozilla.org/es/kb/proteccion-antirrastreo-mejorada-en-firefox-para-e" target="_blank" rel="noreferrer">Firefox</a></li>
        <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noreferrer">Safari</a></li>
        <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noreferrer">Edge</a></li>
      </ul>

      <h2>4. Si esto cambia</h2>
      <p>
        Si en el futuro se añade analítica, vídeos incrustados o la tienda con pasarela de pago, esta página se
        actualizará y se pedirá tu consentimiento antes de instalar nada.
      </p>
    </div>
  )
}

const DOCS = {
  'aviso-legal': {
    titulo: 'Aviso legal',
    sub: 'Quién está detrás de esta web y en qué condiciones se usa.',
    Cuerpo: AvisoLegal,
  },
  privacidad: {
    titulo: 'Política de privacidad',
    sub: 'Qué datos personales se recogen en esta web, para qué y qué puedes hacer con ellos.',
    Cuerpo: Privacidad,
  },
  cookies: {
    titulo: 'Política de cookies',
    sub: 'Qué se guarda en tu navegador al visitar esta web. Spoiler: casi nada.',
    Cuerpo: Cookies,
  },
}

export default function Legal({ doc }) {
  const { titulo, sub, Cuerpo } = DOCS[doc]

  return (
    <>
      <PageHead
        crumbs={<><Link to="/">Inicio</Link> · {titulo}</>}
        kicker={`Actualizado el ${legalActualizado}`}
        title={titulo}
        sub={sub}
        bg="/media/pista-azul.jpg"
        foco="center 50%"
      />

      <section className="sec">
        <Cuerpo />

        <div className="legal-pie">
          <span>Última actualización: {legalActualizado}</span>
          <div>
            <Link to="/aviso-legal">Aviso legal</Link>
            <Link to="/privacidad">Privacidad</Link>
            <Link to="/cookies">Cookies</Link>
          </div>
        </div>
      </section>
    </>
  )
}

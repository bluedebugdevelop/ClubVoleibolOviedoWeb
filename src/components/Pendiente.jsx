import { Link } from 'react-router-dom'

/**
 * Hueco de contenido que el club todavía no ha facilitado.
 *
 * Existe para que una sección sin datos se lea como "esto llega pronto" y no
 * como una página a medio hacer: sale el aviso en su sitio, con lo que falta
 * dicho en claro y una vía para preguntarlo. Cuando el dato llegue, se rellena
 * el array correspondiente en `contenido.js` y este aviso desaparece solo.
 */
export default function Pendiente({ titulo = 'Todavía no está publicado', children, contacto = true }) {
  return (
    <div className="pendiente">
      <span className="etq">Pendiente</span>
      <div>
        <b>{titulo}</b>
        {children && <p>{children}</p>}
        {contacto && (
          <p className="via">
            ¿Lo necesitas ya? <Link to="/contacto">Escríbenos</Link> y te lo decimos.
          </p>
        )}
      </div>
    </div>
  )
}

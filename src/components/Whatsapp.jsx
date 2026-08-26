/* El icono de WhatsApp, en un sitio solo: lo pintan el pie (`Footer.jsx`) y
   /contacto (`Contacto.jsx`), y el número sale siempre de `club` en
   contenido.js — aquí no se escribe ningún dato.

   No entra en `redes.jsx` a propósito: eso es la lista de redes del club que se
   recorre sola, y esto es un teléfono. Si algún día WhatsApp fuera una red más,
   se movería el icono allí y se quitaría este fichero.

   El verde de la marca (#25d366) se pone desde el CSS (`.wa svg`) para que
   funcione igual sobre el blanco de contacto y sobre el azul del pie. */
export function IconoWhatsapp({ size = 15 }) {
  return (
    <svg className="ico-wa" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4.1 14.9l-.4-.2-3 .8.8-2.9-.2-.4A8 8 0 0 1 12 4z" />
      <path d="M8.9 7.3c-.2 0-.5 0-.7.4-.2.4-.9.9-.9 2.1s.9 2.5 1 2.6c.1.2 1.7 2.7 4.3 3.7 2.1.8 2.6.7 3 .6.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.6-.3-1.5-.7c-.2 0-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.9 6.9 0 0 1-2-1.3c-.4-.4-.9-1-1.2-1.5-.1-.2 0-.4.1-.5l.4-.5.3-.5v-.5l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.1z" />
    </svg>
  )
}

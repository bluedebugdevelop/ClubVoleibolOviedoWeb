import { useEffect } from 'react'
import PageHead from '../components/PageHead'

/* ---------------------------------------------------------------------------
   Solo la banda de cabecera, sin barra ni pie. No es una página de la web: es
   lo que el panel mete dentro de un <iframe> para enseñar cómo queda una foto
   en un móvil, en una tableta y en un ordenador.

   Va por iframe y no dibujando una maqueta a mano a propósito. Un iframe tiene
   su propio ancho de ventana, así que las media queries del CSS se aplican de
   verdad: lo que se ve en la vista previa es literalmente lo que se va a ver en
   ese dispositivo, con el mismo componente y el mismo CSS. Una maqueta hecha a
   escala dentro del panel usaría las media queries del ordenador y mentiría
   justo en lo que se quiere comprobar.
   --------------------------------------------------------------------------- */

export default function VistaCabecera() {
  const q = new URLSearchParams(window.location.search)

  /* El panel no puede saber de antemano lo alto que va a salir la banda: a
     partir de cierto ancho manda la foto, y por debajo manda el texto, que
     además parte en más líneas cuanto más estrecha es la pantalla. Así que se
     lo decimos desde dentro y él ajusta el marco. Sin esto sobra un trozo de
     página en blanco debajo de cada vista.

     Se mide la BANDA, no el documento: dentro de un iframe el alto del
     documento nunca baja del alto del propio marco, así que preguntándole a él
     siempre contestaría lo que ya vale y el marco no se ajustaría nunca.

     Y se mide después de que carguen las imágenes, no solo al montar: con la
     foto todavía sin cargar la banda mide de menos. */
  useEffect(() => {
    const avisar = () => {
      const banda = document.querySelector('.phead')
      if (!banda) return
      window.parent?.postMessage(
        { vistaCabecera: true, alto: banda.getBoundingClientRect().height },
        window.location.origin,
      )
    }
    avisar()
    const foto = document.querySelector('.phead .bg img')
    foto?.addEventListener('load', avisar)
    // el tipo de letra tarda un pelín más que el HTML y cambia el alto del texto
    document.fonts?.ready.then(avisar)
    return () => foto?.removeEventListener('load', avisar)
  }, [])

  return (
    <PageHead
      crumbs={q.get('migas') || 'Inicio · Sección'}
      kicker={q.get('kicker') || undefined}
      title={q.get('titulo') || 'Título de la página'}
      sub={q.get('sub') || undefined}
      bg={q.get('foto') || undefined}
    />
  )
}

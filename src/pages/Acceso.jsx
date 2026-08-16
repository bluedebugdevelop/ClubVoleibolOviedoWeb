import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NoEncontrado from './NoEncontrado'
import EntrarCaja from '../components/EntrarCaja'
import useSeo from '../seo'

/* ---------------------------------------------------------------------------
   La puerta única. Vive en /acceso y es a donde lleva el candado de la barra.

   Antes había dos formularios —uno en /panel y otro en /club— y había que saber
   de antemano qué tipo de cuenta tenías. La primera vez que se usó de verdad
   (16-08-2026) una cuenta del club se probó en el panel, el panel la rechazó
   como debía, y desde fuera eso se lee como «esta cuenta no funciona».

   Ahora se escribe usuario y contraseña aquí y el servidor decide el destino.
   Y si ya hay sesión abierta, esto ni pregunta: te manda a tu sitio. Eso es lo
   que evita el bucle cuando alguien del club toca /panel, porque /panel manda
   aquí a quien no es administrador y aquí se le devuelve a /club.
   --------------------------------------------------------------------------- */
export default function Acceso() {
  // comprobando · nohay · fuera
  const [estado, setEstado] = useState('comprobando')
  const navegar = useNavigate()

  useSeo({
    title: 'Acceso',
    description: 'Acceso para el equipo del Club Voleibol Oviedo.',
    noindex: true,
  })

  const mirar = useCallback(async () => {
    const r = await fetch('/api/acceso')
    // sin las variables del panel en el servidor esto no existe
    if (r.status === 404) return setEstado('nohay')
    if (!r.ok) return setEstado('fuera')
    const d = await r.json()
    navegar(d.destino, { replace: true })
  }, [navegar])

  useEffect(() => {
    mirar().catch(() => setEstado('fuera'))
  }, [mirar])

  if (estado === 'comprobando') return null
  if (estado === 'nohay') return <NoEncontrado />

  return (
    <EntrarCaja
      titulo="Acceso del club"
      sub="Entra con tu cuenta. Según cuál sea, te lleva al panel o al área de peticiones."
      endpoint="/api/acceso"
      onEntrado={mirar}
    />
  )
}

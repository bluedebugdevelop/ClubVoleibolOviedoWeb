import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { CrestDefs } from './components/Crest'
import Nav from './components/Nav'
import Footer from './components/Footer'

import Inicio from './pages/Inicio'
import Equipo from './pages/Equipo'
import Cantera from './pages/Cantera'
import Calendario from './pages/Calendario'
import Noticias from './pages/Noticias'
import Noticia from './pages/Noticia'
import QuienesSomos from './pages/QuienesSomos'
import Patrocinadores from './pages/Patrocinadores'
import Patrocinador from './pages/Patrocinador'
import Patrocinar from './pages/Patrocinar'
import Tienda from './pages/Tienda'
import Producto from './pages/Producto'
import Inscripciones from './pages/Inscripciones'
import Contacto from './pages/Contacto'
import Legal from './pages/Legal'
import Panel from './pages/Panel'
import Club from './pages/Club'
import VistaCabecera from './pages/VistaCabecera'
import NoEncontrado from './pages/NoEncontrado'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  /* Ni el panel ni el área del club llevan la barra ni el pie: son herramientas
     internas, no páginas más de la web, y con el menú encima se confunden con
     ella. */
  const ruta = useLocation().pathname
  const esPanel = ruta.startsWith('/panel') || ruta.startsWith('/club')

  return (
    <>
      <CrestDefs />
      <ScrollToTop />
      {!esPanel && <Nav />}
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/equipos/:slug" element={<Equipo />} />
        <Route path="/cantera" element={<Cantera />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/noticias" element={<Noticias />} />
        <Route path="/noticias/:slug" element={<Noticia />} />
        <Route path="/quienes-somos" element={<QuienesSomos />} />
        <Route path="/patrocinadores" element={<Patrocinadores />} />
        <Route path="/patrocinadores/:slug" element={<Patrocinador />} />
        {/* /patrocinadores enseña las marcas; /patrocinar es la que las busca */}
        <Route path="/patrocinar" element={<Patrocinar />} />
        <Route path="/tienda" element={<Tienda />} />
        <Route path="/tienda/:slug" element={<Producto />} />
        <Route path="/inscripciones" element={<Inscripciones />} />
        <Route path="/contacto" element={<Contacto />} />
        {/* los tres documentos legales comparten componente; ver Legal.jsx */}
        <Route path="/aviso-legal" element={<Legal doc="aviso-legal" />} />
        <Route path="/privacidad" element={<Legal doc="privacidad" />} />
        <Route path="/cookies" element={<Legal doc="cookies" />} />
        {/* Panel del club. NO se enlaza desde ningún sitio y la API responde
            404 a quien no tenga permiso. Ver src/pages/Panel.jsx. */}
        <Route path="/panel" element={<Panel />} />
        {/* La banda de cabecera a pelo, para las vistas previas del panel.
            Cuelga de /panel para que herede el "sin barra ni pie" de arriba. */}
        <Route path="/panel/vista" element={<VistaCabecera />} />
        {/* Área del club: donde entrenadores y delegados piden publicaciones.
            Tampoco se enlaza, va con `noindex`, y quien entre aquí NO puede
            tocar la web. Ver src/pages/Club.jsx. */}
        <Route path="/club" element={<Club />} />
        <Route path="*" element={<NoEncontrado />} />
      </Routes>
      {!esPanel && <Footer />}
    </>
  )
}

export default App

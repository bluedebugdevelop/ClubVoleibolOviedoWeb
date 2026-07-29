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
import QuienesSomos from './pages/QuienesSomos'
import Patrocinadores from './pages/Patrocinadores'
import Patrocinador from './pages/Patrocinador'
import Patrocinar from './pages/Patrocinar'
import Tienda from './pages/Tienda'
import Producto from './pages/Producto'
import Inscripciones from './pages/Inscripciones'
import Contacto from './pages/Contacto'
import NoEncontrado from './pages/NoEncontrado'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  return (
    <>
      <CrestDefs />
      <ScrollToTop />
      <Nav />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/equipos/:slug" element={<Equipo />} />
        <Route path="/cantera" element={<Cantera />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/noticias" element={<Noticias />} />
        <Route path="/quienes-somos" element={<QuienesSomos />} />
        <Route path="/patrocinadores" element={<Patrocinadores />} />
        <Route path="/patrocinadores/:slug" element={<Patrocinador />} />
        {/* /patrocinadores enseña las marcas; /patrocinar es la que las busca */}
        <Route path="/patrocinar" element={<Patrocinar />} />
        <Route path="/tienda" element={<Tienda />} />
        <Route path="/tienda/:slug" element={<Producto />} />
        <Route path="/inscripciones" element={<Inscripciones />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="*" element={<NoEncontrado />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App

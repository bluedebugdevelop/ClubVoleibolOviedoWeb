import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Equipos from './pages/Equipos'
import EquipoDetalle from './pages/EquipoDetalle'
import Noticias from './pages/Noticias'
import Tienda from './pages/Tienda'
import QuienesSomos from './pages/QuienesSomos'
import Contacto from './pages/Contacto'
import NoEncontrado from './pages/NoEncontrado'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/equipos" element={<Equipos />} />
          <Route path="/equipos/:id" element={<EquipoDetalle />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/tienda" element={<Tienda />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="*" element={<NoEncontrado />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

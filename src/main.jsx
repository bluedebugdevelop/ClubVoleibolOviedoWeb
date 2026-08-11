import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ProveedorContenido } from './data/ProveedorContenido.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {/* Noticias y patrocinadores se piden a /api/contenido una sola vez para
          todo el sitio; hasta que llegan se usan los de contenido.js. */}
      <ProveedorContenido>
        <App />
      </ProveedorContenido>
    </BrowserRouter>
  </StrictMode>,
)

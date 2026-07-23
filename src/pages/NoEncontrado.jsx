import { Link } from 'react-router-dom'

export default function NoEncontrado() {
  return (
    <section className="container-cvo py-28 text-center">
      <div className="text-7xl font-extrabold text-brand-500 font-display">404</div>
      <h1 className="mt-4 text-2xl font-bold text-navy-900">Página no encontrada</h1>
      <p className="mt-2 text-navy-800/70">La página que buscas no existe o ha cambiado de sitio.</p>
      <Link
        to="/"
        className="mt-8 inline-block rounded-lg bg-brand-500 hover:bg-brand-400 text-white px-6 py-3 font-semibold transition"
      >
        Volver al inicio
      </Link>
    </section>
  )
}

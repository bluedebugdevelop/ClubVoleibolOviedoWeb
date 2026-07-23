import { useState } from 'react'
import { PageHero } from './Equipos'
import { CLUB } from '../data/content'

export default function Contacto() {
  const [enviado, setEnviado] = useState(false)

  function onSubmit(e) {
    e.preventDefault()
    // Demo: no se envía a ningún servidor. Integra aquí tu backend o servicio de email.
    setEnviado(true)
  }

  return (
    <>
      <PageHero
        title="Contacta con nosotros"
        subtitle="¿Quieres jugar con nosotros, patrocinar al club o tienes cualquier consulta? Escríbenos."
      />

      <section className="container-cvo py-16 grid lg:grid-cols-5 gap-10">
        {/* Info */}
        <div className="lg:col-span-2 space-y-6">
          <ContactItem
            icon="📍"
            titulo="Dónde estamos"
            lineas={[CLUB.direccion]}
          />
          <ContactItem
            icon="✉️"
            titulo="Email"
            lineas={[CLUB.email]}
            href={`mailto:${CLUB.email}`}
          />
          <ContactItem icon="📞" titulo="Teléfono" lineas={[CLUB.telefono]} />
          <ContactItem
            icon="🕑"
            titulo="Horario de oficina"
            lineas={['Lunes a viernes: 17:00 – 20:00', 'Sábados: 10:00 – 13:00']}
          />

          <div className="rounded-2xl overflow-hidden ring-1 ring-sky-100 h-56">
            <iframe
              title="Mapa Oviedo"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-5.876%2C43.354%2C-5.828%2C43.375&layer=mapnik&marker=43.3644%2C-5.852"
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        </div>

        {/* Formulario */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-md ring-1 ring-sky-100 p-8">
            {enviado ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-2xl font-extrabold text-navy-900">¡Mensaje enviado!</h3>
                <p className="mt-2 text-navy-800/70">
                  Gracias por contactar con el {CLUB.nombre}. Te responderemos lo antes posible.
                </p>
                <button
                  onClick={() => setEnviado(false)}
                  className="mt-6 font-semibold text-brand-500 hover:text-brand-600"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
                <h3 className="text-xl font-extrabold text-navy-900">Envíanos un mensaje</h3>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field label="Nombre" name="nombre" required />
                  <Field label="Email" name="email" type="email" required />
                </div>
                <Field label="Asunto" name="asunto" required />
                <div>
                  <label className="block text-sm font-semibold text-navy-900 mb-1.5">Mensaje</label>
                  <textarea
                    name="mensaje"
                    required
                    rows={5}
                    className="w-full rounded-lg border border-sky-100 bg-ice-50 px-4 py-2.5 text-navy-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 transition"
                    placeholder="Cuéntanos en qué podemos ayudarte..."
                  />
                </div>
                <label className="flex items-start gap-2 text-sm text-navy-800/70">
                  <input type="checkbox" required className="mt-1 accent-brand-500" />
                  He leído y acepto la política de privacidad del club.
                </label>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-brand-500 hover:bg-brand-400 text-white font-bold py-3 shadow-lg shadow-brand-600/30 transition"
                >
                  Enviar mensaje
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

function Field({ label, name, type = 'text', required }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-navy-900 mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full rounded-lg border border-sky-100 bg-ice-50 px-4 py-2.5 text-navy-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 transition"
      />
    </div>
  )
}

function ContactItem({ icon, titulo, lineas, href }) {
  const content = (
    <div className="flex gap-4">
      <span className="text-2xl">{icon}</span>
      <div>
        <h4 className="font-bold text-navy-900">{titulo}</h4>
        {lineas.map((l) => (
          <p key={l} className="text-sm text-navy-800/70">{l}</p>
        ))}
      </div>
    </div>
  )
  return href ? (
    <a href={href} className="block hover:opacity-80 transition">{content}</a>
  ) : (
    content
  )
}

export default function SectionHeading({ eyebrow, title, subtitle, center, light }) {
  return (
    <div className={`${center ? 'text-center mx-auto' : ''} max-w-2xl mb-10`}>
      {eyebrow && (
        <span
          className={`inline-block text-xs font-bold uppercase tracking-[0.2em] mb-3 ${
            light ? 'text-sky-300' : 'text-brand-500'
          }`}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={`text-3xl sm:text-4xl font-extrabold text-balance ${
          light ? 'text-white' : 'text-navy-900'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 text-base leading-relaxed ${light ? 'text-sky-100/80' : 'text-navy-800/70'}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

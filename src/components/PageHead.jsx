/* `foco` es el object-position de la foto de fondo. La banda es muy apaisada
   (unos 3,5:1) y `cover` recorta por el centro, que en una foto de equipo son
   los torsos: por eso cada página dice a qué altura está lo que hay que ver.
   Se mide en % de la altura de la foto original, no de la banda.

   `entera` es para las fotos que NO se pueden recortar: las de equipo de la
   cantera son casi cuadradas, y estirarlas a una banda 3,5:1 deja fuera dos
   tercios del alto —solo se ven las caras—. Con `entera` la foto se mete
   completa y el hueco de los lados lo cubre el azul de la banda, que ya está
   detrás. Ahí `foco` no pinta nada: no se recorta, así que no hay que elegir
   qué parte se ve. */
export default function PageHead({ crumbs, kicker, title, sub, bg, foco = 'center', entera = false }) {
  return (
    <div className="phead">
      {bg && (
        <div className={entera ? 'bg entera' : 'bg'}>
          <img src={bg} alt="" style={{ objectPosition: entera ? 'center' : foco }} />
        </div>
      )}
      <div className="in">
        {crumbs && <div className="crumbs">{crumbs}</div>}
        {kicker && <div className="kicker">{kicker}</div>}
        <h1>{title}</h1>
        {sub && <p className="sub">{sub}</p>}
      </div>
    </div>
  )
}

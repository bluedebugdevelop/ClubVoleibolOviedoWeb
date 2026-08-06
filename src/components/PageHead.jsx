/* `foco` es el object-position de la foto de fondo. La banda es muy apaisada
   (unos 3,5:1) y `cover` recorta por el centro, que en una foto de equipo son
   los torsos: por eso cada página dice a qué altura está lo que hay que ver.
   Se mide en % de la altura de la foto original, no de la banda.

   Ojo: la foto que se pasa aquí tiene que ser apaisada. Una foto de equipo
   normal, casi cuadrada, la amplía tanto que se queda en un primer plano de
   las caras, y no hay `foco` que lo arregle. Para eso están las versiones
   `-cabecera` que genera `scripts/cabeceras.ps1`. */
export default function PageHead({ crumbs, kicker, title, sub, bg, foco = 'center' }) {
  return (
    <div className="phead">
      {bg && (
        <div className="bg">
          <img src={bg} alt="" style={{ objectPosition: foco }} />
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

import { Link } from 'react-router-dom'

export default function SectionHead({ title, link, linkText, size }) {
  return (
    <div className="sechead" style={size ? { marginBottom: 18 } : undefined}>
      <h2 style={size ? { fontSize: size } : undefined}>{title}</h2>
      <span className="rule"></span>
      {link && <Link to={link}>{linkText}</Link>}
    </div>
  )
}

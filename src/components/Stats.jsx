export default function Stats({ items }) {
  return (
    <div className="stats">
      <div className="stats-in">
        {items.map((s) => (
          <div className="stat" key={s.label}>
            <b>{s.n}</b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SectionCard({ title, subtitle, points, path, children }) {
  return (
    <section className="card">
      <div className="card-head">
        <div>
          <p className="eyebrow">{subtitle}</p>
          <h2>{title}</h2>
        </div>
        <code>{path}</code>
      </div>
      <ul className="point-list">
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <div className="card-body">{children}</div>
    </section>
  );
}

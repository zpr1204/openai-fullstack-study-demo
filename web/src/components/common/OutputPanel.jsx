export default function OutputPanel({ label, value }) {
  return (
    <div className="output-panel">
      <div className="output-label">{label}</div>
      <pre>{typeof value === "string" ? value : JSON.stringify(value, null, 2)}</pre>
    </div>
  );
}

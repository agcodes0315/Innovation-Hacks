export default function StatCard({ label, value, detail }) {
  return (
    <article className="stat-card panel">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

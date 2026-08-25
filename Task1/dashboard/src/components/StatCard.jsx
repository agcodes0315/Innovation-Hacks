import {
  ArrowUpRight,
  MoreHorizontal,
} from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  description,
  variant,
}) {
  return (
    <article className={`stat-card ${variant}`}>
      <div className="stat-header">
        <div className={`stat-icon ${variant}`}>
          <Icon size={19} />
        </div>

        <button className="card-more">
          <MoreHorizontal size={17} />
        </button>
      </div>

      <div className="stat-value-row">
        <strong>{value}</strong>

        <span className="stat-change">
          <ArrowUpRight size={13} />
          {change}
        </span>
      </div>

      <h3>{label}</h3>

      <p>{description}</p>
    </article>
  );
}

export default StatCard;
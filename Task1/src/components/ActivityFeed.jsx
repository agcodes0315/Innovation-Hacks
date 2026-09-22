import {
  Check,
  Clock3,
  FolderKanban,
  Plus,
} from "lucide-react";

function ActivityIcon({ type }) {
  if (type === "success") {
    return <Check size={14} />;
  }

  if (type === "project") {
    return <FolderKanban size={14} />;
  }

  if (type === "task") {
    return <Plus size={14} />;
  }

  return <Clock3 size={14} />;
}

function ActivityFeed({ activities }) {
  return (
    <section className="widget activity-feed-widget">
      <div className="widget-heading">
        <div>
          <span className="widget-kicker">Workspace</span>
          <h2>Recent activity</h2>
        </div>

        <button className="small-link">
          View all
        </button>
      </div>

      <div className="activity-feed-list">
        {activities.map((activity) => (
          <article
            className="activity-feed-row"
            key={activity.id}
          >
            <div
              className={`activity-feed-icon ${activity.type}`}
            >
              <ActivityIcon type={activity.type} />
            </div>

            <div>
              <strong>{activity.title}</strong>

              <p>{activity.description}</p>

              <span>{activity.time}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ActivityFeed;
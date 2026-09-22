import {
  ArrowUpRight,
  CalendarDays,
} from "lucide-react";

function ProjectCard({ project }) {
  return (
    <article className="compact-project-card">
      <div className="project-header">
        <div className="project-code">
          {project.shortCode}
        </div>

        <span
          className={`project-state ${
            project.progress >= 85 ? "done" : ""
          }`}
        >
          {project.status}
        </span>
      </div>

      <h3>{project.title}</h3>

      <p>{project.description}</p>

      <div className="project-progress-heading">
        <span>
          {project.completedTasks}/{project.totalTasks} tasks
        </span>

        <strong>{project.progress}%</strong>
      </div>

      <div className="project-progress-track">
        <div
          style={{
            width: `${project.progress}%`,
          }}
        />
      </div>

      <div className="project-footer">
        <div className="project-members">
          {project.members.map((member) => (
            <span key={member}>{member}</span>
          ))}
        </div>

        <div className="project-due">
          <CalendarDays size={13} />
          {project.dueDate}
        </div>

        <button>
          <ArrowUpRight size={15} />
        </button>
      </div>
    </article>
  );
}

export default ProjectCard;
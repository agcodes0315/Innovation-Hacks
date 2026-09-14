import { Bot, Pencil, Trash2 } from "lucide-react";

export default function ProjectCard({ project, onOpen, onEdit, onDelete, onAI }) {
  const total = Number(project.task_count || 0);
  const done = Number(project.done_count || 0);
  const progress = total ? Math.round((done / total) * 100) : 0;

  return (
    <article className="project-card panel">
      <button className="project-main" onClick={() => onOpen(project)}>
        <div className="project-top">
          <div>
            <span className="eyebrow">{project.status}</span>
            <h3>{project.name}</h3>
          </div>
          <span className="progress-number">{progress}%</span>
        </div>
        <p>{project.description || "No description yet."}</p>
        <div className="progress-track">
          <span style={{ width: `${progress}%` }} />
        </div>
        <small>{done} of {total} tasks completed</small>
      </button>

      <div className="project-actions">
        <button onClick={() => onAI(project)}><Bot size={16} /> AI Generate</button>
        <button onClick={() => onEdit(project)}><Pencil size={16} /> Edit</button>
        <button className="danger-link" onClick={() => onDelete(project)}><Trash2 size={16} /> Delete</button>
      </div>
    </article>
  );
}

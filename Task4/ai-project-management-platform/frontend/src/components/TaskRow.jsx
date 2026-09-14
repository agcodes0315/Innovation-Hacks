import { Trash2 } from "lucide-react";

export default function TaskRow({ task, onStatus, onDelete }) {
  return (
    <article className="task-row">
      <div className={`task-dot priority-${task.priority}`} />
      <div className="task-copy">
        <strong>{task.title}</strong>
        <span>{task.project_name} · {task.priority} priority</span>
      </div>

      <select
        value={task.status}
        onChange={(event) => onStatus(task, event.target.value)}
        aria-label={`Status for ${task.title}`}
      >
        <option value="todo">Todo</option>
        <option value="in-progress">In progress</option>
        <option value="done">Done</option>
      </select>

      <span className={`ai-badge ${task.ai_generated ? "visible" : ""}`}>
        {task.ai_generated ? "AI" : ""}
      </span>

      <button
        className="icon-btn"
        onClick={() => onDelete(task)}
        aria-label={`Delete ${task.title}`}
      >
        <Trash2 size={16} />
      </button>
    </article>
  );
}

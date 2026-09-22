import {
  Check,
  Circle,
  Clock3,
  SearchX,
} from "lucide-react";

const filters = [
  "All",
  "Todo",
  "In Progress",
  "Done",
];

function TaskBoard({
  tasks,
  selectedFilter,
  setSelectedFilter,
  clearFilters,
  toggleTask,
}) {
  return (
    <section className="widget tasks-widget">
      <div className="tasks-heading">
        <div>
          <span className="widget-kicker">Today</span>
          <h2>Today's tasks</h2>
        </div>

        <span className="task-count">
          {tasks.length} visible
        </span>
      </div>

      <div className="task-filter-row">
        {filters.map((filter) => (
          <button
            key={filter}
            className={
              selectedFilter === filter
                ? "active"
                : ""
            }
            onClick={() => setSelectedFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <SearchX size={27} />

          <h3>No matching tasks</h3>

          <p>Try another search or filter.</p>

          <button onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="modern-task-list">
          {tasks.slice(0, 5).map((task) => (
            <article
              className="modern-task-row"
              key={task.id}
            >
              <button
                className={`task-checkbox ${
                  task.status === "Done" ? "done" : ""
                }`}
                onClick={() => toggleTask(task.id)}
              >
                {task.status === "Done" ? (
                  <Check size={15} />
                ) : task.status === "In Progress" ? (
                  <Clock3 size={15} />
                ) : (
                  <Circle size={15} />
                )}
              </button>

              <div className="modern-task-copy">
                <strong
                  className={
                    task.status === "Done"
                      ? "completed-copy"
                      : ""
                  }
                >
                  {task.title}
                </strong>

                <span>{task.project}</span>
              </div>

              <div className="modern-task-meta">
                <span
                  className={`priority-pill ${task.priority.toLowerCase()}`}
                >
                  {task.priority}
                </span>

                <span className="due-pill">
                  {task.dueDate}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      <button className="view-all-tasks">
        View all tasks →
      </button>
    </section>
  );
}

export default TaskBoard;
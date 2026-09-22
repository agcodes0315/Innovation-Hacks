import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  CheckCircle2,
  CircleDot,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Sparkles,
  UserCircle2
} from "lucide-react";
import { useAuth } from "../auth.jsx";
import { api } from "../api.js";
import Modal from "../components/Modal.jsx";
import StatCard from "../components/StatCard.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import TaskRow from "../components/TaskRow.jsx";

const emptyProject = { name: "", description: "", status: "active" };
const emptyTask = {
  projectId: "",
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: ""
};

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const [dashboard, setDashboard] = useState({ stats: {}, activities: [] });
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [search, setSearch] = useState("");
  const [taskStatus, setTaskStatus] = useState("all");
  const [taskPriority, setTaskPriority] = useState("all");

  const [projectModal, setProjectModal] = useState(null);
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [taskModal, setTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [detailsProject, setDetailsProject] = useState(null);
  const [aiProject, setAiProject] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [busy, setBusy] = useState(false);

  async function loadAll() {
    setPageError("");
    try {
      const [dashboardData, projectData, taskData] = await Promise.all([
        api("/dashboard"),
        api("/projects"),
        api("/tasks")
      ]);
      setDashboard(dashboardData);
      setProjects(projectData);
      setTasks(taskData);
      if (!taskForm.projectId && projectData[0]) {
        setTaskForm((current) => ({ ...current, projectId: projectData[0].id }));
      }
    } catch (err) {
      setPageError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch = !q ||
        `${task.title} ${task.description || ""} ${task.project_name || ""}`
          .toLowerCase()
          .includes(q);
      const matchesStatus = taskStatus === "all" || task.status === taskStatus;
      const matchesPriority = taskPriority === "all" || task.priority === taskPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, taskStatus, taskPriority]);

  const stats = dashboard.stats || {};

  function openCreateProject() {
    setProjectForm(emptyProject);
    setProjectModal({ mode: "create" });
  }

  function openEditProject(project) {
    setProjectForm({
      name: project.name,
      description: project.description || "",
      status: project.status
    });
    setProjectModal({ mode: "edit", project });
  }

  async function saveProject(event) {
    event.preventDefault();
    setBusy(true);
    try {
      if (projectModal.mode === "create") {
        await api("/projects", {
          method: "POST",
          body: JSON.stringify(projectForm)
        });
      } else {
        await api(`/projects/${projectModal.project.id}`, {
          method: "PATCH",
          body: JSON.stringify(projectForm)
        });
      }
      setProjectModal(null);
      await loadAll();
    } catch (err) {
      setPageError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteProject(project) {
    if (!window.confirm(`Delete "${project.name}" and all of its tasks?`)) return;
    try {
      await api(`/projects/${project.id}`, { method: "DELETE" });
      await loadAll();
    } catch (err) {
      setPageError(err.message);
    }
  }

  async function openDetails(project) {
    try {
      setDetailsProject(await api(`/projects/${project.id}`));
    } catch (err) {
      setPageError(err.message);
    }
  }

  function openCreateTask(projectId = projects[0]?.id || "") {
    setTaskForm({ ...emptyTask, projectId });
    setTaskModal(true);
  }

  async function saveTask(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await api("/tasks", {
        method: "POST",
        body: JSON.stringify({
          ...taskForm,
          dueDate: taskForm.dueDate || null
        })
      });
      setTaskModal(false);
      await loadAll();
    } catch (err) {
      setPageError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function updateTaskStatus(task, status) {
    try {
      await api(`/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      await loadAll();
    } catch (err) {
      setPageError(err.message);
    }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await api(`/tasks/${task.id}`, { method: "DELETE" });
      await loadAll();
    } catch (err) {
      setPageError(err.message);
    }
  }

  async function generateAI() {
    if (!aiProject) return;
    setBusy(true);
    setAiResult(null);
    try {
      const result = await api("/ai/generate-tasks", {
        method: "POST",
        body: JSON.stringify({ projectId: aiProject.id, count: 5 })
      });
      setAiResult(result);
      await loadAll();
    } catch (err) {
      setPageError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark"><CircleDot size={20} /></div>
          <div>
            <strong>DevFlow</strong>
            <span>Productivity OS</span>
          </div>
        </div>

        <nav>
          <a className="active" href="#overview"><LayoutDashboard size={18} /> Overview</a>
          <a href="#projects"><FolderKanban size={18} /> Projects</a>
          <a href="#tasks"><CheckCircle2 size={18} /> My Tasks</a>
        </nav>

        <div className="sidebar-user">
          <UserCircle2 size={30} />
          <div>
            <strong>{user.name}</strong>
            <span>{user.role}</span>
          </div>
          <button className="icon-btn" onClick={logout} aria-label="Logout">
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      <main className="dashboard-main" id="overview">
        <header className="topbar">
          <div>
            <span className="eyebrow">Developer workspace</span>
            <h1>Good to see you, {user.name.split(" ")[0]}.</h1>
            <p>Track your projects, finish tasks, and let local AI help with planning.</p>
          </div>

          <div className="top-actions">
            <button className="secondary-btn" onClick={() => openCreateTask()}>
              <Plus size={17} /> New task
            </button>
            <button className="primary-btn" onClick={openCreateProject}>
              <Plus size={17} /> New project
            </button>
          </div>
        </header>

        {pageError && (
          <div className="page-error">
            {pageError}
            <button onClick={() => setPageError("")}>Dismiss</button>
          </div>
        )}

        {loading ? (
          <section className="loading-grid">
            <div className="skeleton panel" />
            <div className="skeleton panel" />
            <div className="skeleton panel" />
            <div className="skeleton panel" />
          </section>
        ) : (
          <>
            <section className="stats-grid">
              <StatCard label="Active projects" value={stats.project_count || 0} detail="Your owned workspaces" />
              <StatCard label="Total tasks" value={stats.task_count || 0} detail="Across all projects" />
              <StatCard label="Completed" value={stats.completed_count || 0} detail="Finished tasks" />
              <StatCard label="In progress" value={stats.in_progress_count || 0} detail="Currently moving" />
            </section>

            <section className="section-block" id="projects">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Portfolio</span>
                  <h2>Projects</h2>
                </div>
                <button className="secondary-btn" onClick={openCreateProject}>
                  <Plus size={16} /> Create project
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="empty-state panel">
                  <FolderKanban size={30} />
                  <h3>No projects yet</h3>
                  <p>Create your first project to start tracking work.</p>
                  <button className="primary-btn" onClick={openCreateProject}>Create project</button>
                </div>
              ) : (
                <div className="project-grid">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onOpen={openDetails}
                      onEdit={openEditProject}
                      onDelete={deleteProject}
                      onAI={(item) => {
                        setAiProject(item);
                        setAiResult(null);
                      }}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="two-column">
              <div className="panel task-panel" id="tasks">
                <div className="section-heading compact">
                  <div>
                    <span className="eyebrow">Execution</span>
                    <h2>Tasks</h2>
                  </div>
                  <button className="secondary-btn" onClick={() => openCreateTask()}>
                    <Plus size={16} /> Add
                  </button>
                </div>

                <div className="filters">
                  <label className="search-box">
                    <Search size={16} />
                    <input
                      placeholder="Search tasks…"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </label>

                  <select value={taskStatus} onChange={(e) => setTaskStatus(e.target.value)}>
                    <option value="all">All statuses</option>
                    <option value="todo">Todo</option>
                    <option value="in-progress">In progress</option>
                    <option value="done">Done</option>
                  </select>

                  <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}>
                    <option value="all">All priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div className="task-list">
                  {filteredTasks.length === 0 ? (
                    <div className="inline-empty">
                      <CheckCircle2 size={28} />
                      <p>No tasks match your filters.</p>
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onStatus={updateTaskStatus}
                        onDelete={deleteTask}
                      />
                    ))
                  )}
                </div>
              </div>

              <aside className="panel activity-panel">
                <div className="section-heading compact">
                  <div>
                    <span className="eyebrow">Timeline</span>
                    <h2>Recent activity</h2>
                  </div>
                </div>

                <div className="activity-list">
                  {dashboard.activities?.length ? dashboard.activities.map((item) => (
                    <div className="activity-item" key={item.id}>
                      <span className="activity-icon"><Sparkles size={15} /></span>
                      <div>
                        <strong>{item.message}</strong>
                        <small>{new Date(item.created_at).toLocaleString()}</small>
                      </div>
                    </div>
                  )) : (
                    <div className="inline-empty">
                      <p>Your activity will appear here.</p>
                    </div>
                  )}
                </div>
              </aside>
            </section>
          </>
        )}
      </main>

      {projectModal && (
        <Modal
          title={projectModal.mode === "create" ? "Create project" : "Edit project"}
          onClose={() => setProjectModal(null)}
        >
          <form className="modal-form" onSubmit={saveProject}>
            <label>
              Project name
              <input
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                placeholder="AI Project Manager"
                minLength={2}
                required
              />
            </label>
            <label>
              Description
              <textarea
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                placeholder="What are you building?"
                rows={4}
              />
            </label>
            <label>
              Status
              <select
                value={projectForm.status}
                onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <button className="primary-btn wide" disabled={busy}>
              {busy ? "Saving…" : "Save project"}
            </button>
          </form>
        </Modal>
      )}

      {taskModal && (
        <Modal title="Create task" onClose={() => setTaskModal(false)}>
          <form className="modal-form" onSubmit={saveTask}>
            <label>
              Project
              <select
                value={taskForm.projectId}
                onChange={(e) => setTaskForm({ ...taskForm, projectId: e.target.value })}
                required
              >
                <option value="" disabled>Select project</option>
                {projects.map((project) => (
                  <option value={project.id} key={project.id}>{project.name}</option>
                ))}
              </select>
            </label>
            <label>
              Task title
              <input
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                minLength={2}
                required
              />
            </label>
            <label>
              Description
              <textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                rows={3}
              />
            </label>

            <div className="form-row">
              <label>
                Priority
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </label>
              <label>
                Due date
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                />
              </label>
            </div>

            <button className="primary-btn wide" disabled={busy || projects.length === 0}>
              {busy ? "Creating…" : "Create task"}
            </button>
          </form>
        </Modal>
      )}

      {detailsProject && (
        <Modal title={detailsProject.name} onClose={() => setDetailsProject(null)}>
          <div className="project-detail">
            <p>{detailsProject.description || "No description."}</p>
            <div className="detail-meta">
              <span>Status: <strong>{detailsProject.status}</strong></span>
              <span>Tasks: <strong>{detailsProject.task_count || detailsProject.tasks?.length || 0}</strong></span>
            </div>
            <button
              className="primary-btn"
              onClick={() => {
                const id = detailsProject.id;
                setDetailsProject(null);
                openCreateTask(id);
              }}
            >
              <Plus size={16} /> Add task
            </button>

            <div className="detail-task-list">
              {(detailsProject.tasks || []).length ? detailsProject.tasks.map((task) => (
                <div key={task.id} className="detail-task">
                  <span>{task.title}</span>
                  <small>{task.status} · {task.priority}</small>
                </div>
              )) : <p className="muted">No tasks in this project yet.</p>}
            </div>
          </div>
        </Modal>
      )}

      {aiProject && (
        <Modal title={`AI plan · ${aiProject.name}`} onClose={() => setAiProject(null)}>
          <div className="ai-box">
            <span className="ai-orb"><Bot size={24} /></span>
            <h3>Generate a five-task project plan</h3>
            <p>
              DevFlow will use your local Ollama model when available. Generated tasks
              are saved directly into this project.
            </p>

            {!aiResult ? (
              <button className="primary-btn wide" onClick={generateAI} disabled={busy}>
                {busy ? "Generating…" : "Generate tasks"}
                {!busy && <Sparkles size={17} />}
              </button>
            ) : (
              <div className="ai-result">
                <div className={`mode-chip ${aiResult.mode}`}>
                  {aiResult.mode === "local-ai" ? "Local AI" : "Fallback planner"}
                </div>
                <p>{aiResult.message}</p>
                <ul>
                  {aiResult.tasks.map((task) => <li key={task.id}>{task.title}</li>)}
                </ul>
                <button className="secondary-btn wide" onClick={() => setAiProject(null)}>
                  Done
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  Clock3,
  Flame,
  FolderKanban,
  Plus,
} from "lucide-react";

import ActivityFeed from "./components/ActivityFeed";
import CommandPalette from "./components/CommandPalette";
import FocusTimer from "./components/FocusTimer";
import Header from "./components/Header";
import MiniCalendar from "./components/MiniCalendar";
import ProductivityChart from "./components/ProductivityChart";
import ProjectCard from "./components/ProjectCard";
import Sidebar from "./components/Sidebar";
import StatCard from "./components/StatCard";
import TaskBoard from "./components/TaskBoard";
import WeeklyActivity from "./components/WeeklyActivity";

import {
  activities,
  initialTasks,
  productivityData,
  projects,
  schedule,
  weeklyActivityData,
} from "./data/dashboardData";

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-orbit">
        <div className="loading-logo">
          DF
        </div>
      </div>

      <h2>Building your workspace</h2>

      <p>
        Loading focus data, projects and productivity
        insights...
      </p>

      <div className="loading-line">
        <div />
      </div>
    </div>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  const [activeItem, setActiveItem] =
    useState("Overview");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [commandOpen, setCommandOpen] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedFilter, setSelectedFilter] =
    useState("All");

  const [tasks, setTasks] =
    useState(initialTasks);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1100);

    return () => clearTimeout(timer);
  }, []);

  function toggleTask(id) {
    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id !== id) {
          return task;
        }

        return {
          ...task,
          status:
            task.status === "Done"
              ? "Todo"
              : "Done",
        };
      })
    );
  }

  const filteredTasks = useMemo(() => {
    const query = searchTerm
      .trim()
      .toLowerCase();

    return tasks.filter((task) => {
      const matchesStatus =
        selectedFilter === "All" ||
        task.status === selectedFilter;

      const matchesSearch =
        query === "" ||
        task.title
          .toLowerCase()
          .includes(query) ||
        task.project
          .toLowerCase()
          .includes(query) ||
        task.priority
          .toLowerCase()
          .includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [tasks, selectedFilter, searchTerm]);

  const filteredProjects = useMemo(() => {
    const query = searchTerm
      .trim()
      .toLowerCase();

    if (!query) {
      return projects;
    }

    return projects.filter(
      (project) =>
        project.title
          .toLowerCase()
          .includes(query) ||
        project.description
          .toLowerCase()
          .includes(query)
    );
  }, [searchTerm]);

  const completedTasks = tasks.filter(
    (task) => task.status === "Done"
  ).length;

  function clearFilters() {
    setSearchTerm("");
    setSelectedFilter("All");
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="app-shell">
      <Sidebar
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="main-content">
        <Header
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setSidebarOpen={setSidebarOpen}
          setCommandOpen={setCommandOpen}
        />

        <div className="dashboard">
          <section className="dashboard-welcome">
            <div>
              <span className="welcome-date">
                Tuesday · August 25
              </span>

              <h1>
                Good afternoon, Agrima
                <span> ✦</span>
              </h1>

              <p>
                You have{" "}
                <strong>
                  {tasks.length - completedTasks} tasks
                </strong>{" "}
                waiting and your productivity is up{" "}
                <strong>12%</strong> this week.
              </p>
            </div>

            <button className="create-task-button">
              <Plus size={17} />
              Create task
            </button>
          </section>

          <section className="stat-grid">
            <StatCard
              icon={CheckCircle2}
              label="Completed"
              value={completedTasks}
              change="12%"
              description="Tasks finished this week"
              variant="mint"
            />

            <StatCard
              icon={Clock3}
              label="Focus time"
              value="14.5h"
              change="9%"
              description="2.4 hours today"
              variant="teal"
            />

            <StatCard
              icon={FolderKanban}
              label="Active projects"
              value="3"
              change="8%"
              description="Across your workspace"
              variant="blue"
            />

            <StatCard
              icon={Flame}
              label="Focus streak"
              value="7"
              change="16%"
              description="Consecutive productive days"
              variant="lime"
            />
          </section>

          <section className="workspace-grid">
            <WeeklyActivity
              datasets={weeklyActivityData}
            />

            <FocusTimer />

            <TaskBoard
              tasks={filteredTasks}
              selectedFilter={selectedFilter}
              setSelectedFilter={setSelectedFilter}
              clearFilters={clearFilters}
              toggleTask={toggleTask}
            />

            <ProductivityChart
              data={productivityData}
            />

            <MiniCalendar schedule={schedule} />

            <ActivityFeed
              activities={activities}
            />
          </section>

          <section className="projects-section">
            <div className="projects-heading">
              <div>
                <span className="widget-kicker">
                  Workspace
                </span>

                <h2>Active projects</h2>
              </div>

              <button>View all projects →</button>
            </div>

            {filteredProjects.length ? (
              <div className="project-grid">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    project={project}
                    key={project.id}
                  />
                ))}
              </div>
            ) : (
              <div className="projects-empty">
                <h3>No projects found</h3>
                <p>
                  Try another search phrase.
                </p>

                <button
                  onClick={() => setSearchTerm("")}
                >
                  Clear search
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <CommandPalette
        open={commandOpen}
        setOpen={setCommandOpen}
        setActiveItem={setActiveItem}
      />
    </div>
  );
}

export default App;
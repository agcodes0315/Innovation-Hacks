import {
  BarChart3,
  CalendarDays,
  CheckSquare2,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Sparkles,
  TimerReset,
  X,
} from "lucide-react";

const items = [
  {
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    label: "Projects",
    icon: FolderKanban,
  },
  {
    label: "My Tasks",
    icon: CheckSquare2,
    badge: 6,
  },
  {
    label: "Analytics",
    icon: BarChart3,
  },
  {
    label: "Calendar",
    icon: CalendarDays,
  },
];

function Sidebar({
  activeItem,
  setActiveItem,
  sidebarOpen,
  setSidebarOpen,
}) {
  return (
    <>
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-logo">
              <Sparkles size={19} />
            </div>

            <div>
              <h1>DevFlow</h1>
              <p>Productivity OS</p>
            </div>
          </div>

          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="workspace-switcher">
          <div className="workspace-logo">IH</div>

          <div className="workspace-text">
            <span>Workspace</span>
            <strong>Innovation Hacks</strong>
          </div>

          <span className="online-dot" />
        </div>

        <p className="sidebar-label">Workspace</p>

        <nav className="sidebar-nav">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                className={`nav-item ${
                  activeItem === item.label ? "active" : ""
                }`}
                onClick={() => {
                  setActiveItem(item.label);
                  setSidebarOpen(false);
                }}
              >
                <div className="nav-item-left">
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button
            className={`nav-item ${
              activeItem === "Settings" ? "active" : ""
            }`}
            onClick={() => setActiveItem("Settings")}
          >
            <div className="nav-item-left">
              <Settings size={18} />
              <span>Settings</span>
            </div>
          </button>

          <div className="sidebar-focus-card">
            <div className="sidebar-focus-heading">
              <div className="focus-mini-icon">
                <TimerReset size={17} />
              </div>

              <div>
                <strong>Focus Mode</strong>
                <span>Deep work without distractions</span>
              </div>
            </div>

            <div className="focus-progress">
              <div />
            </div>

            <div className="focus-progress-copy">
              <span>Daily goal</span>
              <strong>72%</strong>
            </div>
          </div>

          <div className="sidebar-profile">
            <div className="avatar">AS</div>

            <div>
              <strong>Agrima Saxena</strong>
              <span>Developer</span>
            </div>

            <span className="profile-status" />
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
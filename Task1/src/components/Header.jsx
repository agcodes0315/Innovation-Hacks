import {
  Bell,
  Menu,
  Search,
  Sparkles,
} from "lucide-react";

function Header({
  searchTerm,
  setSearchTerm,
  setSidebarOpen,
  setCommandOpen,
}) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="menu-button"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>

        <div className="search-box">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search your workspace..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <button
            className="shortcut-button"
            onClick={() => setCommandOpen(true)}
          >
            Ctrl K
          </button>
        </div>
      </div>

      <div className="topbar-actions">
        <button
          className="ai-button"
          onClick={() => setCommandOpen(true)}
        >
          <Sparkles size={15} />
          Quick actions
        </button>

        <button className="notification-button">
          <Bell size={18} />
          <span />
        </button>

        <div className="topbar-divider" />

        <div className="topbar-profile">
          <div className="avatar">AS</div>

          <div>
            <strong>Agrima Saxena</strong>
            <span>Developer</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
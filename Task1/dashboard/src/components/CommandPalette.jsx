import { useEffect } from "react";

import {
  BarChart3,
  CheckSquare2,
  FolderKanban,
  Plus,
  Search,
  TimerReset,
  X,
} from "lucide-react";

function CommandPalette({
  open,
  setOpen,
  setActiveItem,
}) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setOpen((previous) => !previous);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [setOpen]);

  if (!open) {
    return null;
  }

  const commands = [
    {
      label: "Create a new task",
      icon: Plus,
      action: "My Tasks",
    },
    {
      label: "Open projects",
      icon: FolderKanban,
      action: "Projects",
    },
    {
      label: "View my tasks",
      icon: CheckSquare2,
      action: "My Tasks",
    },
    {
      label: "Open analytics",
      icon: BarChart3,
      action: "Analytics",
    },
    {
      label: "Start focus mode",
      icon: TimerReset,
      action: "Overview",
    },
  ];

  return (
    <div
      className="command-overlay"
      onClick={() => setOpen(false)}
    >
      <div
        className="command-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="command-search">
          <Search size={19} />

          <input
            autoFocus
            placeholder="What would you like to do?"
          />

          <button onClick={() => setOpen(false)}>
            <X size={17} />
          </button>
        </div>

        <span className="command-label">
          Quick actions
        </span>

        <div className="command-list">
          {commands.map((command) => {
            const Icon = command.icon;

            return (
              <button
                key={command.label}
                onClick={() => {
                  setActiveItem(command.action);
                  setOpen(false);
                }}
              >
                <div>
                  <Icon size={17} />
                  <span>{command.label}</span>
                </div>

                <kbd>↵</kbd>
              </button>
            );
          })}
        </div>

        <div className="command-footer">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd>
            Navigate
          </span>

          <span>
            <kbd>Esc</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
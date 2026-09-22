import { useEffect, useState } from "react";

import {
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";

const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

function FocusTimer() {
  const [mode, setMode] = useState("focus");
  const [seconds, setSeconds] = useState(FOCUS_TIME);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) {
      return undefined;
    }

    const interval = setInterval(() => {
      setSeconds((previous) => {
        if (previous <= 1) {
          setRunning(false);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  function selectMode(newMode) {
    setMode(newMode);
    setRunning(false);

    if (newMode === "focus") {
      setSeconds(FOCUS_TIME);
    } else {
      setSeconds(BREAK_TIME);
    }
  }

  function resetTimer() {
    setRunning(false);

    setSeconds(
      mode === "focus"
        ? FOCUS_TIME
        : BREAK_TIME
    );
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const percentage =
    mode === "focus"
      ? ((FOCUS_TIME - seconds) / FOCUS_TIME) * 100
      : ((BREAK_TIME - seconds) / BREAK_TIME) * 100;

  return (
    <section className="widget focus-widget">
      <div className="widget-heading">
        <div>
          <span className="widget-kicker">Deep Work</span>
          <h2>Focus timer</h2>
        </div>

        <span className="live-dot">
          <i />
          Ready
        </span>
      </div>

      <div
        className="timer-ring"
        style={{
          "--timer-progress": `${percentage * 3.6}deg`,
        }}
      >
        <div className="timer-inner">
          <strong>
            {String(minutes).padStart(2, "0")}:
            {String(remainingSeconds).padStart(2, "0")}
          </strong>

          <span>
            {mode === "focus"
              ? "Focus session"
              : "Recharge"}
          </span>
        </div>
      </div>

      <div className="timer-actions">
        <button
          className="timer-main-button"
          onClick={() => setRunning(!running)}
        >
          {running ? <Pause size={19} /> : <Play size={19} />}

          {running ? "Pause" : "Start"}
        </button>

        <button
          className="timer-reset"
          onClick={resetTimer}
        >
          <RotateCcw size={18} />
        </button>
      </div>

      <div className="timer-modes">
        <button
          className={mode === "focus" ? "active" : ""}
          onClick={() => selectMode("focus")}
        >
          <strong>25</strong>
          <span>Focus</span>
        </button>

        <button
          className={mode === "break" ? "active" : ""}
          onClick={() => selectMode("break")}
        >
          <strong>05</strong>
          <span>Break</span>
        </button>
      </div>
    </section>
  );
}

export default FocusTimer;
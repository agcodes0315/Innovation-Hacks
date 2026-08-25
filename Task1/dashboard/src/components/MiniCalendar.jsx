import {
  CalendarDays,
  Clock3,
} from "lucide-react";

function MiniCalendar({ schedule }) {
  const days = [
    27,
    28,
    29,
    30,
    31,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
    24,
    25,
    26,
    27,
    28,
    29,
    30,
  ];

  return (
    <section className="widget calendar-widget">
      <div className="widget-heading">
        <div>
          <span className="widget-kicker">Schedule</span>
          <h2>August 2026</h2>
        </div>

        <CalendarDays size={19} />
      </div>

      <div className="calendar-weekdays">
        {["M", "T", "W", "T", "F", "S", "S"].map(
          (day, index) => (
            <span key={`${day}-${index}`}>{day}</span>
          )
        )}
      </div>

      <div className="calendar-days">
        {days.map((day, index) => {
          const muted = index < 5;
          const today = day === 25 && index > 20;

          return (
            <button
              key={`${day}-${index}`}
              className={`${muted ? "muted" : ""} ${
                today ? "today" : ""
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="schedule-heading">
        <span>Upcoming</span>
        <button>View all</button>
      </div>

      <div className="schedule-list">
        {schedule.map((item) => (
          <div
            className="schedule-row"
            key={item.id}
          >
            <div className="schedule-time">
              <Clock3 size={13} />
              {item.time}
            </div>

            <div className="schedule-info">
              <strong>{item.title}</strong>
              <span>{item.type}</span>
            </div>

            <i />
          </div>
        ))}
      </div>
    </section>
  );
}

export default MiniCalendar;
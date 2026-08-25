import { useState } from "react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function WeeklyActivity({ datasets }) {
  const [range, setRange] = useState("week");

  const rangeLabels = {
    week: "7 Days",
    month: "30 Days",
    quarter: "3 Months",
  };

  return (
    <section className="widget activity-chart-widget">
      <div className="widget-heading">
        <div>
          <span className="widget-kicker">Productivity</span>
          <h2>Weekly activity</h2>
          <p>Your focus and completion trend.</p>
        </div>

        <div className="chart-filters">
          {Object.keys(rangeLabels).map((key) => (
            <button
              key={key}
              className={range === key ? "active" : ""}
              onClick={() => setRange(key)}
            >
              {rangeLabels[key]}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-summary">
        <div>
          <strong>14.5h</strong>
          <span>Focus this week</span>
        </div>

        <span className="positive-chip">+12.4%</span>
      </div>

      <div className="area-chart-container">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={datasets[range]}
            margin={{
              top: 10,
              right: 5,
              left: -25,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id="focusGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#27c6b8"
                  stopOpacity={0.35}
                />

                <stop
                  offset="95%"
                  stopColor="#27c6b8"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="4 4"
              stroke="rgba(255,255,255,.05)"
              vertical={false}
            />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#78919a",
                fontSize: 11,
              }}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#78919a",
                fontSize: 10,
              }}
            />

            <Tooltip
              contentStyle={{
                background: "#10252c",
                border: "1px solid #21434a",
                borderRadius: "12px",
                color: "#f3f7f5",
              }}
            />

            <Area
              type="monotone"
              dataKey="focus"
              stroke="#27c6b8"
              strokeWidth={3}
              fill="url(#focusGradient)"
            />

            <Area
              type="monotone"
              dataKey="tasks"
              stroke="#d9f27c"
              strokeWidth={2}
              fill="transparent"
              strokeDasharray="5 6"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-key">
        <span>
          <i className="key-dot teal" />
          Focus score
        </span>

        <span>
          <i className="key-dot lime" />
          Task completion
        </span>
      </div>
    </section>
  );
}

export default WeeklyActivity;
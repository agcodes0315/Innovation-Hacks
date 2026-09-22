import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const colors = [
  "#27c6b8",
  "#d9f27c",
  "#29414a",
];

function ProductivityChart({ data }) {
  return (
    <section className="widget productivity-widget">
      <div className="widget-heading">
        <div>
          <span className="widget-kicker">Performance</span>
          <h2>Productivity</h2>
        </div>

        <span className="score-label">Excellent</span>
      </div>

      <div className="productivity-chart-area">
        <ResponsiveContainer width="100%" height={190}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={78}
              paddingAngle={5}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={colors[index]}
                />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                background: "#10252c",
                border: "1px solid #21434a",
                borderRadius: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="productivity-center">
          <strong>83%</strong>
          <span>Productive</span>
        </div>
      </div>

      <div className="productivity-legend">
        {data.map((item, index) => (
          <div key={item.name}>
            <span>
              <i
                style={{
                  background: colors[index],
                }}
              />

              {item.name}
            </span>

            <strong>{item.value}%</strong>
          </div>
        ))}
      </div>

      <div className="productivity-insight">
        <span>↗</span>

        <div>
          <strong>12% improvement</strong>
          <p>from your previous week</p>
        </div>
      </div>
    </section>
  );
}

export default ProductivityChart;
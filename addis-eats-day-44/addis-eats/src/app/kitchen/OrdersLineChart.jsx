"use client";

export default function OrdersLineChart({ data }) {
  const width = 720;
  const height = 250;
  const left = 48;
  const right = 20;
  const top = 20;
  const bottom = 42;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const max = Math.max(1, ...data.map((item) => item.orders));
  const step = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;
  const points = data.map((item, index) => ({ ...item, x: left + step * index, y: top + chartHeight - (item.orders / max) * chartHeight }));
  const path = points.map((point, index) => `${index ? "L" : "M"}${point.x},${point.y}`).join(" ");

  return (
    <section className="dashboard-chart" id="orders-trend" aria-labelledby="orders-trend-heading">
      <div className="section-heading"><div><h2 id="orders-trend-heading">Orders per day · last 7 days</h2><p>Number of orders</p></div></div>
      <div className="chart-frame">
        <svg className="chart-svg line-chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="orders-trend-heading orders-trend-description">
          <desc id="orders-trend-description">A line chart showing the number of orders for each of the last seven days. The same values are listed in the table below.</desc>
          {[0, Math.ceil(max / 2), max].filter((value, index, values) => values.indexOf(value) === index).map((tick) => {
            const y = top + chartHeight - (tick / max) * chartHeight;
            return <g key={tick}><line x1={left} x2={width - right} y1={y} y2={y} className="chart-gridline" /><text x={left - 12} y={y + 4} textAnchor="end" className="chart-tick">{tick}</text></g>;
          })}
          <path d={path} className="chart-line" />
          {points.map((point) => <g key={point.date}><circle cx={point.x} cy={point.y} r="5" className="chart-point" /><text x={point.x} y={height - 14} textAnchor="middle" className="chart-label">{point.label}</text><text x={point.x} y={point.y - 10} textAnchor="middle" className="chart-value">{point.orders}</text></g>)}
        </svg>
      </div>
      <table className="chart-data-table"><caption>Orders per day for the last seven days</caption><thead><tr><th scope="col">Date</th><th scope="col">Orders</th></tr></thead><tbody>{data.map((item) => <tr key={item.date}><th scope="row">{item.label}</th><td>{item.orders}</td></tr>)}</tbody></table>
    </section>
  );
}

"use client";

const formatBirr = (amount) => `ETB ${new Intl.NumberFormat("en-ET", { maximumFractionDigits: 0 }).format(amount)}`;

export default function RevenueChart({ data }) {
  const width = 720;
  const height = 260;
  const left = 78;
  const right = 20;
  const top = 18;
  const bottom = 48;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const max = Math.max(0, ...data.map((item) => item.revenue));
  const axisMax = max > 0 ? Math.ceil(max / 100) * 100 : 100;
  const ticks = [0, axisMax / 2, axisMax];
  const barWidth = data.length ? Math.min(56, chartWidth / data.length * 0.55) : 0;

  return (
    <section className="dashboard-chart" aria-labelledby="revenue-heading">
      <div className="section-heading"><div><h2 id="revenue-heading">Revenue by neighborhood</h2><p>Order total · ETB</p></div></div>
      <div className="chart-frame">
        <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="revenue-heading revenue-description">
          <desc id="revenue-description">A bar chart of revenue in Ethiopian birr for each neighborhood. The vertical axis starts at zero.</desc>
          {ticks.map((tick) => {
            const y = top + chartHeight - (tick / axisMax) * chartHeight;
            return <g key={tick}><line x1={left} x2={width - right} y1={y} y2={y} className="chart-gridline" /><text x={left - 10} y={y + 4} textAnchor="end" className="chart-tick">{formatBirr(tick)}</text></g>;
          })}
          {data.map(({ neighborhood, revenue }, index) => {
            const slot = chartWidth / Math.max(1, data.length);
            const barHeight = (revenue / axisMax) * chartHeight;
            const x = left + slot * index + (slot - barWidth) / 2;
            const y = top + chartHeight - barHeight;
            return <g key={neighborhood}><rect x={x} y={y} width={barWidth} height={barHeight} className="chart-bar" /><text x={x + barWidth / 2} y={height - 20} textAnchor="middle" className="chart-label">{neighborhood}</text><text x={x + barWidth / 2} y={Math.max(top + 12, y - 6)} textAnchor="middle" className="chart-value">{formatBirr(revenue)}</text></g>;
          })}
        </svg>
      </div>
      <table className="chart-data-table"><caption>Revenue by neighborhood, Ethiopian birr</caption><thead><tr><th scope="col">Neighborhood</th><th scope="col">Revenue (ETB)</th></tr></thead><tbody>{data.map((item) => <tr key={item.neighborhood}><th scope="row">{item.neighborhood}</th><td>{new Intl.NumberFormat("en-ET").format(item.revenue)}</td></tr>)}</tbody></table>
    </section>
  );
}

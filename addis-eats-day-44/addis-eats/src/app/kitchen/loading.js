export default function Loading() {
  return (
    <main className="main">
      <section className="simple-panel"><p className="eyebrow">Staff only · Admin</p><h1>Dashboard loading.</h1></section>
      <div className="dashboard-table-skeleton" role="status" aria-label="Loading dashboard">
        <span className="sr-only">Loading dashboard data…</span>
        {Array.from({ length: 5 }, (_, index) => <div className="skeleton-row" key={index}><i /><i /><i /><i /></div>)}
      </div>
    </main>
  );
}

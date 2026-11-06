"use client";



export default function DataTable({ columns, rows, empty = "Nothing here yet." }) {
  if (!rows.length) return <p className="py-7 text-sm text-slate-500">{empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">{columns.map((column, index) => <th className="px-3 py-3 font-semibold" key={`${column.key}-${index}`}>{column.label}</th>)}</tr></thead>
        <tbody>{rows.map((row, index) => <tr className="border-b border-slate-50 last:border-0" key={row.id || row.email || index}>{columns.map((column, columnIndex) => <td className="px-3 py-4 text-slate-700" key={`${column.key}-${columnIndex}`}>{column.render ? column.render(row[column.key], row) : row[column.key] || "—"}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

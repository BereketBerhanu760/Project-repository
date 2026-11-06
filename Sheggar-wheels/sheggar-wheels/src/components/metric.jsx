"use client";



export default function Metric({ label, value, note, icon = "↗" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between text-sm text-slate-500"><span>{label}</span><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-lg text-orange-600">{icon}</span></div>
      <div className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
      {note && <div className="mt-1 text-sm text-slate-500">{note}</div>}
    </div>
  );
}

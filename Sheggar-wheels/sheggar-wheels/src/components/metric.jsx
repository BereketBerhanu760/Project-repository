"use client";



export default function Metric({ label, value, note, icon = "↗" }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex min-w-0 items-start justify-between gap-3 text-sm text-slate-500"><span className="min-w-0 break-words">{label}</span><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-lg text-orange-600">{icon}</span></div>
      <div className="mt-4 min-w-0 break-words text-2xl leading-tight font-semibold tracking-tight text-slate-950 [overflow-wrap:anywhere] sm:text-3xl">{value}</div>
      {note && <div className="mt-1 min-w-0 break-words text-sm leading-5 text-slate-500 [overflow-wrap:anywhere]">{note}</div>}
    </div>
  );
}

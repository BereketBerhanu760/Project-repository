"use client";



export default function EmptyState({ title, text }) {
  return <div className="rounded-xl border border-dashed border-slate-200 px-5 py-10 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-xl text-orange-600">✦</div><h3 className="mt-3 font-semibold text-slate-900">{title}</h3><p className="mt-1 text-sm text-slate-500">{text}</p></div>;
}

"use client";

import { cn } from "@/components/component-utils";

export default function Panel({ title, action, children, className }) {
  return (
    <section className={cn("rounded-2xl border border-slate-200 bg-white shadow-sm", className)}>
      {(title || action) && <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <h2 className="font-semibold text-slate-900">{title}</h2>{action}</div>}
      <div className="p-5">{children}</div>
    </section>
  );
}

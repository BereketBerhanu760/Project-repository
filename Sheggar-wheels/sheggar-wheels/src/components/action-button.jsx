"use client";

import { cn } from "@/components/component-utils";

export default function ActionButton({ children, tone = "neutral", className, ...props }) {
  const tones = {
    neutral: "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    positive: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    danger: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
  };
  return <button {...props} className={cn("inline-flex min-h-8 items-center justify-center whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500", tones[tone], className)}>{children}</button>;
}

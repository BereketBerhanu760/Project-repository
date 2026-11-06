"use client";

import { cn } from "@/components/component-utils";
import { displayStatus } from "@/components/demo-page-utils";

export default function Status({ children }) {
  const status = String(children || "pending");
  const style = /active|available|confirmed|approved|completed|reviewed|resolved|published|in_progress/i.test(status)
    ? "bg-emerald-50 text-emerald-700"
    : /reject|cancel|suspend|urgent|open/i.test(status)
      ? "bg-rose-50 text-rose-700"
      : "bg-amber-50 text-amber-700";
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", style)}>{displayStatus(status)}</span>;
}

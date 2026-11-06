"use client";

import Link from "next/link";
import { cn } from "@/components/component-utils";

export default function ButtonLink({ href, children, secondary = false }) {
  return (
    <Link href={href} className={cn("inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition", secondary ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "bg-slate-950 text-white hover:bg-orange-600")}>
      {children}
    </Link>
  );
}

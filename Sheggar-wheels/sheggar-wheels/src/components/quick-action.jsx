"use client";

import Link from "next/link";

export default function QuickAction({ href, title, text }) {
  return <Link href={href} className="block rounded-xl border border-slate-100 p-4 transition hover:border-orange-200 hover:bg-orange-50/50"><div className="flex items-center justify-between"><strong className="text-sm text-slate-900">{title}</strong><span className="text-orange-500">→</span></div><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></Link>;
}

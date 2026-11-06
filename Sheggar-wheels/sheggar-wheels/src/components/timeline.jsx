"use client";

import { cn } from "@/components/component-utils";

export default function Timeline({ items }) {
  return <div className="space-y-0">{items.map(([title,text],index)=><div key={title} className="relative flex gap-3 pb-5 last:pb-0"><div className="flex flex-col items-center"><span className={cn("z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",index===0?"bg-orange-100 text-orange-700":"bg-slate-100 text-slate-500")}>{index+1}</span>{index<items.length-1&&<span className="absolute top-7 bottom-0 w-px bg-slate-200"/>}</div><div className="pt-1"><p className="text-sm font-semibold text-slate-800">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></div></div>)}</div>;
}

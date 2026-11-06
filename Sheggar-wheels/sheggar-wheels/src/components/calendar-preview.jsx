"use client";

import { cn } from "@/components/component-utils";

export default function CalendarPreview() {
  return <div className="grid grid-cols-7 gap-1 text-center text-xs">{["M","T","W","T","F","S","S",...Array.from({length:30},(_,i)=>String(i+1))].map((day,index)=><span key={`${day}-${index}`} className={cn("flex h-9 items-center justify-center rounded-lg",index<7?"font-semibold text-slate-400":Number(day)%7===0?"bg-orange-100 font-semibold text-orange-700":"text-slate-600")}>{day}</span>)}</div>;
}

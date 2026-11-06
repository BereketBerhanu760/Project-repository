"use client";

import { cn } from "@/components/component-utils";

export default function Field({ label, name, type = "text", required = false, placeholder, defaultValue, options, min }) {
  const base = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100";
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {options ? <select className={base} name={name} defaultValue={defaultValue || options[0]?.value} required={required}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : type === "textarea" ? <textarea className={cn(base, "min-h-28 resize-y")} name={name} placeholder={placeholder} required={required} defaultValue={defaultValue} /> : <input className={base} name={name} type={type} placeholder={placeholder} required={required} defaultValue={defaultValue} min={min} />}
    </label>
  );
}

"use client";

import Panel from "@/components/panel";
import Field from "@/components/field";

export default function FormCard({ title, description, fields, onSubmit, submitLabel = "Save changes", message, children }) {
  return (
    <Panel title={title}>
      {description && <p className="mb-5 text-sm leading-6 text-slate-500">{description}</p>}
      <form action={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">{fields?.map((field) => <div className={field.full ? "sm:col-span-2" : ""} key={field.name}><Field {...field} /></div>)}</div>
        {children}
        {message && <p role="status" className="rounded-xl bg-orange-50 px-3 py-2 text-sm text-orange-800">{message}</p>}
        <button className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500" type="submit">{submitLabel}</button>
      </form>
    </Panel>
  );
}

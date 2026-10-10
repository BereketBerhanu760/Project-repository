"use client";

export default function MenuError({ reset }) {
  return <main className="main">
            <div className="simple-panel">
                <p className="eyebrow">Kitchen pause</p>
                <h1>That menu needs another minute.</h1>
                <p>Something interrupted the menu request. Try the again.</p>
                <button className="button" onClick={() => reset()}>Try again</button>
            </div>
        </main>;
}
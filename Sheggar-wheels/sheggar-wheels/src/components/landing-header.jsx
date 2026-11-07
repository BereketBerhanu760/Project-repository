"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";

export default function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative z-50 mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 pt-5 sm:px-8 sm:pt-6 md:px-12 lg:px-16">
      <div className="flex items-center gap-2 sm:gap-3">
        <Link href="/" className="text-sm font-bold tracking-[0.12em] text-white sm:text-lg sm:tracking-[0.16em]">
          SHEGGAR WHEELS
        </Link>
      </div>
      <div className="ml-auto flex items-center gap-2 md:ml-0">
        <ThemeToggle className="border-white/30 bg-slate-950/30 text-white backdrop-blur-sm hover:bg-white/10" />
        <button
          aria-controls="landing-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/30 bg-slate-950/30 text-white backdrop-blur-sm md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          <span aria-hidden="true" className="text-xl leading-none">{menuOpen ? "×" : "☰"}</span>
        </button>
      </div>
      <nav
        aria-label="Main navigation"
        className={`${menuOpen ? "absolute left-4 right-4 top-[calc(100%+0.75rem)] z-[60] flex flex-col rounded-xl border border-white/15 bg-slate-950/95 p-2 shadow-xl backdrop-blur md:static md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 md:shadow-none" : "hidden md:flex md:items-center"} gap-1 md:gap-6`}
        id="landing-navigation"
      >
        <Link href="/cars" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-100 hover:bg-white/10 hover:text-orange-300 md:p-0 md:hover:bg-transparent" onClick={() => setMenuOpen(false)}>Browse cars</Link>
        <Link href="/owner/cars/new" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-100 hover:bg-white/10 hover:text-orange-300 md:p-0 md:hover:bg-transparent" onClick={() => setMenuOpen(false)}>List your car</Link>
        <Link href="/signin" className="rounded-lg px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 md:rounded-full" onClick={() => setMenuOpen(false)}>Sign in</Link>
        <Link href="/signup" className="rounded-full bg-orange-500 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-orange-400" onClick={() => setMenuOpen(false)}>Sign up</Link>
      </nav>
    </header>
  );
}

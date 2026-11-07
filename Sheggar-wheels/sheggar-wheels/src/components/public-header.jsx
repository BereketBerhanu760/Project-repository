"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { normalizeRoles } from "@/components/demo-page-utils";
import { signOut as signOutDemo } from "@/lib/auth";
import ThemeToggle from "@/components/theme-toggle";

export default function PublicHeader({ session }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const roles = normalizeRoles(session.metadata);
  const accountPath = roles.includes("admin") ? "/admin" : roles.includes("owner") ? "/owner" : "/dashboard";
  function signOut() {
    signOutDemo();
    router.replace("/");
  }
  const linkClass = "block rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-orange-50 hover:text-orange-700 md:p-0 md:hover:bg-transparent";
  const ownerLink = session.userId && roles.includes("renter") && !roles.includes("owner");
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="relative mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm font-extrabold tracking-[0.16em] text-slate-950">SHEGGAR <span className="text-orange-500">WHEELS</span></Link>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <ThemeToggle />
          <button
            aria-controls="public-navigation"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-orange-50 md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            <span aria-hidden="true" className="text-xl leading-none">{menuOpen ? "×" : "☰"}</span>
          </button>
        </div>
        <nav
          aria-label="Main navigation"
          className={`${menuOpen ? "absolute left-3 right-3 top-[calc(100%+0.5rem)] flex flex-col rounded-xl border border-slate-200 bg-white p-2 shadow-lg md:static md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 md:shadow-none" : "hidden md:flex md:items-center"} gap-1 md:gap-6`}
          id="public-navigation"
        >
          <Link href="/cars" className={linkClass} onClick={() => setMenuOpen(false)}>Explore cars</Link>
          {ownerLink && <Link href="/signup" className={linkClass} onClick={() => setMenuOpen(false)}>Become an owner</Link>}
          {session.userId ? <>
            <Link href={accountPath} className={linkClass} onClick={() => setMenuOpen(false)}>{roles.includes("admin") ? "Dashboard" : "My account"}</Link>
            <button onClick={() => { setMenuOpen(false); signOut(); }} className="block rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 md:p-0 md:hover:bg-transparent" type="button">Sign out</button>
          </> : <>
            <Link href="/signin" className={linkClass} onClick={() => setMenuOpen(false)}>Sign in</Link>
            <Link href="/signup" className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400" onClick={() => setMenuOpen(false)}>Join</Link>
          </>}
        </nav>
      </div>
    </header>
  );
}

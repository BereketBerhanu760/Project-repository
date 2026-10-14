"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SignOutForm from "./SignOutForm";

export default function SiteHeader({ session }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") setIsMenuOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isMenuOpen]);

  return (
    <header className="site-header">
      <Link className="brand" href="/">Addis Eats</Link>
      <button
        className="menu-toggle"
        type="button"
        aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isMenuOpen}
        aria-controls="site-navigation"
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        <span aria-hidden="true">{isMenuOpen ? "×" : "☰"}</span>
      </button>
      <nav
        className={`nav${isMenuOpen ? " is-open" : ""}`}
        id="site-navigation"
        aria-label="Main navigation"
      >
        <Link href="/" onClick={closeMenu}>Home</Link>
        <Link href="/menu" onClick={closeMenu}>Menu</Link>
        {session?.role !== "staff" ? <Link className="cart-link" href="/cart" onClick={closeMenu}>Cart</Link> : null}
        {session && session.role !== "staff" ? <Link href="/Orders" onClick={closeMenu}>Orders</Link> : null}
        {session?.role === "staff" ? <Link href="/kitchen" onClick={closeMenu}>Admin</Link> : null}
        {session ? <SignOutForm /> : (
          <>
            <Link href="/signin" onClick={closeMenu}>Sign in</Link>
          </>
        )}
      </nav>
    </header>
  );
}

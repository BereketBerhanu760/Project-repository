"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutForm from "./SignOutForm";

export default function SiteHeader({ session, cartItems = [], cartCount = 0 }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const userKey = session?.id || "guest";
  const pathname = usePathname();

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

  useEffect(() => {
    const themeKey = `addis_theme:${userKey}`;
    let savedTheme = "light";
    try {
      savedTheme = window.localStorage.getItem(themeKey) === "dark" ? "dark" : "light";
    } catch {
      // Use the light theme when browser storage is unavailable.
    }
    setTheme(savedTheme);
    document.documentElement.dataset.theme = savedTheme;
  }, [userKey]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(`addis_cart:${userKey}`, JSON.stringify(cartItems));
    } catch {
      // The server cart remains available when session storage is unavailable.
    }
  }, [cartItems, userKey]);

  useEffect(() => {
    if (pathname !== "/kitchen" || !window.location.hash) return;
    const targetId = decodeURIComponent(window.location.hash.slice(1));
    requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  }, [pathname]);

  function centerDashboardSection(event, sectionId) {
    if (pathname !== "/kitchen") return;
    const target = document.getElementById(sectionId);
    if (!target) return;
    event.preventDefault();
    window.history.pushState(null, "", `/kitchen#${sectionId}`);
    target.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    try {
      window.localStorage.setItem(`addis_theme:${userKey}`, nextTheme);
    } catch {
      // Keep the selected theme for the current page if storage is unavailable.
    }
  }

  return (
    <header className="site-header">
      <Link className="brand" href="/">Addis Eats</Link>
      {session?.role !== "staff" ? (
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
      ) : null}
      <nav
        className={`nav${session?.role === "staff" ? " admin-sidebar-nav" : ""}${isMenuOpen ? " is-open" : ""}`}
        id="site-navigation"
        aria-label="Main navigation"
      >
        {session?.role === "staff" ? <p className="admin-nav-label">Staff workspace</p> : null}
        {session?.role !== "staff" ? <Link href="/" onClick={closeMenu}>Home</Link> : null}
        {session?.role !== "staff" ? <Link href="/menu" onClick={closeMenu}>Menu</Link> : null}
        {session?.role !== "staff" ? (
          <Link className="cart-link" href="/cart" onClick={closeMenu} aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}>
            Cart <span className="cart-count" aria-hidden="true">{cartCount}</span>
          </Link>
        ) : null}
        {session && session.role !== "staff" ? <Link href="/Orders" onClick={closeMenu}>Orders</Link> : null}
        {session?.role === "staff" ? (
          <>
            <Link className="admin-sidebar-section-link" href="/kitchen#dashboard-overview" onClick={(event) => { closeMenu(); centerDashboardSection(event, "dashboard-overview"); }}>Overview</Link>
            <Link className="admin-sidebar-section-link" href="/kitchen#revenue" onClick={(event) => { closeMenu(); centerDashboardSection(event, "revenue"); }}>Revenue by neighborhood</Link>
            <Link className="admin-sidebar-section-link" href="/kitchen#orders-trend" onClick={(event) => { closeMenu(); centerDashboardSection(event, "orders-trend"); }}>Orders per day</Link>
            <Link className="admin-sidebar-section-link" href="/kitchen#orders" onClick={(event) => { closeMenu(); centerDashboardSection(event, "orders"); }}>Orders</Link>
            <Link className="admin-sidebar-section-link" href="/kitchen#order-management" onClick={(event) => { closeMenu(); centerDashboardSection(event, "order-management"); }}>Order management</Link>
            <Link className="admin-sidebar-section-link" href="/kitchen#menu-management" onClick={(event) => { closeMenu(); centerDashboardSection(event, "menu-management"); }}>Menu management</Link>
          </>
        ) : null}
        {session ? <SignOutForm /> : (
          <>
            <Link href="/signin" onClick={closeMenu}>Sign in</Link>
          </>
        )}
        <button
          className="theme-toggle"
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
          <span className="theme-toggle-label">{theme === "dark" ? "Light" : "Dark"}</span>
        </button>
      </nav>
    </header>
  );
}

import Link from "next/link";
import { connection } from "next/server";
import { getMenuCategories } from "@/lib/menu-store";

export default async function MenuLayout({ children }) {
  await connection();
  const menuCategories = await getMenuCategories();
  return (
    <main className="main menu-layout">
      <aside className="menu-sidebar" aria-label="Menu categories">
        <p className="eyebrow">Browse the table</p>
        <nav className="menu-sidebar-nav">
          {["all", ...menuCategories].map((category) => (
            <Link href={category === "all" ? "/menu" : `/menu?category=${encodeURIComponent(category)}`} key={category}>
              {category === "all" ? "All" : category.replace(/\b\w/g, (letter) => letter.toUpperCase())}
            </Link>
          ))}
        </nav>
        <p className="sidebar-note">Warm plates and generous portions.</p>
      </aside>
      <section className="menu-content">{children}</section>
    </main>
  );
}

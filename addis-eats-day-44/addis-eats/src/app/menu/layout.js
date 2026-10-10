import Link from "next/link";

const categories = ["All", "Classics", "Vegan"];

export default function MenuLayout({ children }) {
  return (
    <main className="main menu-layout">
      <aside className="menu-sidebar" aria-label="Menu categories">
        <p className="eyebrow">Browse the table</p>
        <nav className="menu-sidebar-nav">
          {categories.map((category) => (
            <Link href={category === "All" ? "/menu" : `/menu?category=${category.toLowerCase()}`} key={category}>
              {category}
            </Link>
          ))}
        </nav>
        <p className="sidebar-note">Warm plates and generous portions.</p>
      </aside>
      <section className="menu-content">{children}</section>
    </main>
  );
}
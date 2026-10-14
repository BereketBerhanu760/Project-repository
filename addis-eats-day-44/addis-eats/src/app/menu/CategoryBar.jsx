"use client";

export default function CategoryBar({ children, categories, selected }) {
  return (
    <div>
      <nav className="category-bar" aria-label="Menu categories">
        {["all", ...categories].map((category) => (
          <a
            className={`category ${selected === category ? "is-active" : ""}`}
            aria-current={selected === category ? "page" : undefined}
            href={category === "all" ? "/menu" : `/menu?category=${encodeURIComponent(category)}`}
            key={category}
          >
            {category === "all" ? "All" : category.replace(/\b\w/g, (letter) => letter.toUpperCase())}
          </a>
        ))}
      </nav>
      {children}
    </div>
  );
}

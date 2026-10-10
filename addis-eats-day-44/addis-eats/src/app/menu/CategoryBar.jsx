"use client";

const categories = ["All", "Classics", "Vegan"];

export default function CategoryBar({ children }) {
  return (
    <div>
      <nav className="category-bar" aria-label="Menu categories">
        {categories.map((category) => (
          <a
            className="category"
            href={category === "All" ? "/menu" : `/menu?category=${category.toLowerCase()}`}
            key={category}
          >
            {category}
          </a>
        ))}
      </nav>
      {children}
    </div>
  );
}
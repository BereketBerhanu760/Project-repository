const categories = [
  { value: 'all', label: 'All Items' },
  { value: 'ethiopian', label: 'Ethiopian' },
  { value: 'burgers', label: 'Burgers' },
  { value: 'pizza', label: 'Pizza' },
  { value: 'drinks', label: 'Drinks' },
  { value: 'sides', label: 'Sides' },
];

function MenuControls({ searchTerm, category, favoritesOnly, onSearchChange, onCategoryChange, onFavoritesChange }) {
  return (
    <section id="menu-controls">
      <div className="search-container">
        <label htmlFor="search">Search Menu:</label>
        <input
          type="text"
          id="search"
          placeholder="Search dishes, drinks..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div id="category-filters">
        {categories.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={`filter-btn ${category === value ? 'active' : ''}`}
            data-category={value}
            onClick={() => onCategoryChange(value)}
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          className={`filter-btn favorites-filter ${favoritesOnly ? 'active' : ''}`}
          onClick={() => onFavoritesChange(!favoritesOnly)}
          aria-pressed={favoritesOnly}
        >
          {favoritesOnly ? '♥ Favorites' : '♡ Favorites'}
        </button>
      </div>
    </section>
  );
}

export default MenuControls;

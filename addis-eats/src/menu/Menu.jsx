import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { useAppStore } from '../store/useAppStore.js';
import MenuControls from './MenuControls.jsx';
import Card from './Card.jsx';
import SkeletonCard from './SkeletonCard.jsx';

function Menu() {
  const { data: dishes, loading, error } = useFetch('/dishes.json');
  const favorites = useAppStore((state) => state.favorites);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const filteredDishes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return dishes.filter((dish) => {
      if (dish.visible === false) {
        return false;
      }

      const matchesCategory =
        activeCategory === 'all' || dish.category?.toLowerCase() === activeCategory;
      const matchesFavorite = !favoritesOnly || favorites.includes(dish.id);

      if (!matchesCategory || !matchesFavorite) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        dish.name,
        dish.description,
        ...(dish.ingredients || []),
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [dishes, searchTerm, activeCategory, favoritesOnly, favorites]);

  return (
    <>
      <MenuControls
        searchTerm={searchTerm}
        category={activeCategory}
        favoritesOnly={favoritesOnly}
        onSearchChange={setSearchTerm}
        onCategoryChange={setActiveCategory}
        onFavoritesChange={setFavoritesOnly}
      />

      <section id="menu">
        <h2 id="menu-heading">Our Menu</h2>
        <div id="menu-list2" className={error ? 'menu-list-error' : ''}>
          {error && (
            <div className="menu-error-state">
              <p className="menu-error-title">Failed to load menu items.</p>
              <p className="menu-error-message">
                Please check your connection or try refreshing the page.
              </p>
            </div>
          )}

          {!error && loading && Array.from({ length: 6 }, (_, index) => (
            <SkeletonCard key={index} />
          ))}

          {!error && !loading && filteredDishes.length === 0 && (
            <p className="no-items">
              {favoritesOnly ? 'No favorite items in this category.' : 'No menu items found.'}
            </p>
          )}

          {!error &&
            !loading &&
            filteredDishes.map((dish) => <Card key={dish.id} item={dish} />)}
        </div>
        <div className="menu-checkout-action">
          <Link className="menu-checkout-button" to="/checkout">
            Proceed to Checkout
          </Link>
        </div>
      </section>
    </>
  );
}

export default Menu;

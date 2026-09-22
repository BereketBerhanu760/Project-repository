import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore.js';
import { useAuth } from '../auth/useAuth.js';

function Header() {
  const items = useAppStore((state) => state.items);
  const isDark = useAppStore((state) => state.isDark);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const openCart = useAppStore((state) => state.openCart);
  const { customer, customerLogout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const cartCount = items.reduce((total, item) => total + Number(item.quantity || 0), 0);

  useEffect(() => {
    const closeMenu = (event) => {
      if (!event.target.closest('#top-navbar')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, []);

  const handleOpenCart = (event) => {
    event.preventDefault();
    openCart();
  };

  return (
    <header>
      <nav id="top-navbar">
        <div id="nav-brand">Addis Eats</div>

        <button
          id="btn-hamburger"
          type="button"
          aria-label="Toggle Navigation Menu"
          aria-expanded={isMenuOpen}
          className={isMenuOpen ? 'open' : ''}
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        >
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
        </button>

        <div id="nav-controls" className={isMenuOpen ? 'active' : ''}>
          <button
            id="btn-theme-toggle"
            type="button"
            aria-label="Toggle Theme"
            onClick={toggleTheme}
          >
            {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>

          <div id="nav-links">
            <Link to="/" id="nav-link-home">Home</Link>
            <Link to="/menu" id="nav-link-order">Menu</Link>
            <Link to="/orders" id="nav-link-orders">Order</Link>
            <Link to="/admin/login" id="nav-link-admin">Admin</Link>

            <a href="#" id="nav-link-cart" onClick={handleOpenCart}>
              🛒 Cart <span id="cart-badge-count">{cartCount}</span>
            </a>

            {customer && (
              <button
                type="button"
                className="customer-logout-button"
                onClick={customerLogout}
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;

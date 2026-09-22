import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore.js';

function Cart() {
  const items = useAppStore((state) => state.items);
  const isOpen = useAppStore((state) => state.isCartOpen);
  const setIsCartOpen = useAppStore((state) => state.setIsCartOpen);
  const updateQuantity = useAppStore((state) => state.updateQuantity);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0),
    [items]
  );

  return (
    <>
      <div
        id="cart-overlay"
        className={isOpen ? 'active' : ''}
        onClick={() => setIsCartOpen(false)}
      />

      <aside id="nav-cart-container" className={isOpen ? 'active' : ''}>
        <div id="cart-header">
          <h3>Your Order</h3>
          <button
            id="btn-close-cart"
            aria-label="Close Cart"
            onClick={() => setIsCartOpen(false)}
          >
            &times;
          </button>
        </div>

        <div id="cart-items">
          {items.length === 0 ? (
            <p className="cart-empty-msg">Your cart is empty.</p>
          ) : (
            items.map((item) => (
              <div className="cart-item" key={item.name}>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-thumb"
                    style={{ width: '35px', height: '35px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                ) : null}

                <div className="cart-item-details">
                  <span className="cart-item-title">{item.name}</span>
                  <span className="cart-item-price">
                    {(Number(item.price) * Number(item.quantity)).toFixed(2)} ETB
                  </span>
                </div>

                <div className="cart-quantity-controls">
                  <button
                    type="button"
                    className="btn-qty btn-decrease"
                    onClick={() => updateQuantity(item.name, -1)}
                  >
                    -
                  </button>
                  <span className="cart-item-qty">{item.quantity}</span>
                  <button
                    type="button"
                    className="btn-qty btn-increase"
                    onClick={() => updateQuantity(item.name, 1)}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="btn-remove-item"
                  onClick={() => updateQuantity(item.name, -item.quantity)}
                >
                  &times;
                </button>
              </div>
            ))
          )}
        </div>

        <div id="cart-summary">
          <span id="cart-total">Total: {total.toFixed(2)} ETB</span>
          <Link to="/checkout" id="btn-cart-checkout" onClick={() => setIsCartOpen(false)}>
            Proceed to Checkout
          </Link>
        </div>
      </aside>
    </>
  );
}

export default Cart;

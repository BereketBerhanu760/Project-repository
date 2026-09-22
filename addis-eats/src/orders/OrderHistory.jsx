import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore.js';

const ORDERS_KEY = 'addiseats_orders';

function readOrders() {
  try {
    const savedOrders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    return Array.isArray(savedOrders) ? savedOrders : [];
  } catch {
    return [];
  }
}

function OrderHistory() {
  const [orders, setOrders] = useState(readOrders);
  const setItems = useAppStore((state) => state.setItems);
  const openCart = useAppStore((state) => state.openCart);
  const navigate = useNavigate();

  useEffect(() => {
    const syncOrders = () => setOrders(readOrders());

    window.addEventListener('storage', syncOrders);
    window.addEventListener('orders:updated', syncOrders);

    return () => {
      window.removeEventListener('storage', syncOrders);
      window.removeEventListener('orders:updated', syncOrders);
    };
  }, []);

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [orders]
  );

  const handleReorder = (order) => {
    const reorderedItems = Array.isArray(order.items)
      ? order.items.map((item) => ({
          ...item,
          quantity: Number(item.quantity || 1),
        }))
      : [];

    setItems(reorderedItems);
    openCart();
    navigate('/menu');
  };

  return (
    <main className="checkout-page">
      <section id="checkout-section" className="order-history-section">
        <h2>Order History</h2>
        <p className="checkout-kicker">Your recent orders</p>

        {sortedOrders.length === 0 ? (
          <div className="order-history-empty">
            <p className="order-history-empty-title">No orders yet</p>
            <p className="order-history-empty-text">
              Your completed orders will appear here after you place your first order.
            </p>
            <Link className="order-history-start-link" to="/menu">
              Start ordering
            </Link>
          </div>
        ) : (
          <div className="order-history-list">
            {sortedOrders.map((order) => (
              <article key={order.id} className="order-history-card">
                <div className="order-history-header">
                  <div>
                    <p className="order-history-id">{order.id}</p>
                    <p className="order-history-date">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="order-history-status">{order.status}</span>
                </div>

                <div className="order-history-details">
                  <div>
                    <strong>Customer:</strong> {order.customerName}
                  </div>
                  <div>
                    <strong>Phone:</strong> {order.phone}
                  </div>
                  <div>
                    <strong>Area:</strong> {order.area}
                  </div>
                </div>

                <ul className="order-history-items">
                  {order.items.map((item) => (
                    <li key={`${order.id}-${item.name}`}>
                      {item.name} × {item.quantity} - {(Number(item.price) * Number(item.quantity)).toFixed(2)} ETB
                    </li>
                  ))}
                </ul>

                <div className="order-history-footer">
                  <strong>Total: {Number(order.totalPrice || 0).toFixed(2)} ETB</strong>
                  <button type="button" className="btn-add-to-cart" onClick={() => handleReorder(order)}>
                    Reorder
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default OrderHistory;

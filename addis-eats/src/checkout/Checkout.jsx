import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore.js';
import { useAuth } from '../auth/useAuth.js';

const ORDERS_KEY = 'addiseats_orders';

function Checkout() {
  const navigate = useNavigate();
  const { customer } = useAuth();
  const cart = useAppStore((state) => state.items);
  const clearCart = useAppStore((state) => state.clearCart);
  const [formValues, setFormValues] = useState({ name: '', phone: '', area: '', instructions: '' });
  const [formError, setFormError] = useState('');
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    if (!customer) {
      navigate('/sign-in', { replace: true, state: { from: '/checkout' } });
    }
  }, [customer, navigate]);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0),
    [cart]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }));
    setFormError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!customer) {
      navigate('/sign-in', { replace: true, state: { from: '/checkout' } });
      return;
    }

    const name = formValues.name.trim();
    const phone = formValues.phone.trim();

    if (!name || !phone || !formValues.area) {
      setFormError('Please fill out all required fields.');
      return;
    }

    if (!/^(\+251|0)(9|7)\d{8}$/.test(phone)) {
      setFormError('Enter a valid Ethiopian phone number, such as 0911223344 or +251911223344.');
      return;
    }

    if (cart.length === 0) {
      setFormError('Your cart is empty. Add items before placing an order.');
      return;
    }

    const newOrder = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      customerName: name,
      phone,
      area: formValues.area,
      specialInstructions: formValues.instructions.trim(),
      items: cart,
      totalPrice: total,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const existingOrders = (() => {
      try {
        const savedOrders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
        return Array.isArray(savedOrders) ? savedOrders : [];
      } catch {
        return [];
      }
    })();

    const updatedOrders = [newOrder, ...existingOrders];
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
    window.dispatchEvent(new CustomEvent('orders:updated'));
    clearCart();
    setOrderId(newOrder.id);
  };

  if (orderId) {
    return (
      <main className="checkout-page">
        <section id="checkout-section" className="checkout-success">
          <p className="checkout-kicker">Order confirmed</p>
          <h2>Thank you, {formValues.name}.</h2>
          <p>Your order has been placed successfully. Keep your order number for reference.</p>
          <strong className="order-number">{orderId}</strong>
          <Link id="btn-submit-order" to="/menu">Continue ordering</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <section id="checkout-section">
        <h2>Checkout</h2>
        <p className="checkout-kicker">Almost there</p>
        <p className="checkout-intro">Add your delivery details and we will take care of the rest.</p>

        {cart.length > 0 && (
          <div className="checkout-total" aria-live="polite">
            <span>{cart.reduce((sum, item) => sum + Number(item.quantity), 0)} items</span>
            <strong>{total.toFixed(2)} ETB</strong>
          </div>
        )}

        {(formError || cart.length === 0) && (
          <p id="form-error" className="error" aria-live="polite">
            {formError || 'Your cart is empty. Add items before placing an order.'}
          </p>
        )}

        <form id="checkout" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="customer-name">Full Name</label>
            <input
              type="text"
              id="customer-name"
              name="name"
              value={formValues.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="customer-phone">Phone Number</label>
            <input
              type="tel"
              id="customer-phone"
              name="phone"
              value={formValues.phone}
              onChange={handleChange}
              placeholder="0911223344 or +251911223344"
              autoComplete="tel"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="area">Delivery Area</label>
            <select id="area" name="area" value={formValues.area} onChange={handleChange} required>
              <option value="">Select Delivery Area</option>
              <option value="bole">Bole</option>
              <option value="kazanchis">Kazanchis</option>
              <option value="megenagna">Megenagna</option>
              <option value="4-kilo">4 Kilo</option>
              <option value="piassa">Piassa</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="special-instructions">Special Instructions (Optional)</label>
            <textarea
              id="special-instructions"
              name="instructions"
              value={formValues.instructions}
              onChange={handleChange}
              placeholder="Add delivery or preparation notes..."
              rows="4"
              maxLength="300"
            />
          </div>

          <button type="submit" id="btn-submit-order" disabled={cart.length === 0}>
            Place Order
          </button>
        </form>
      </section>
    </main>
  );
}

export default Checkout;
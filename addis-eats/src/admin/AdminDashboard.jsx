import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';

const MENU_KEY = 'addiseats_menu';
const ORDERS_KEY = 'addiseats_orders';
const LEGACY_MENU_IDS = new Set(['d1', 'd2', 'd3', 'd4', 'd5']);

function readMenu() {
  try {
    const savedMenu = JSON.parse(localStorage.getItem(MENU_KEY) || '[]');
    return Array.isArray(savedMenu) ? savedMenu : [];
  } catch {
    return [];
  }
}

function readOrders() {
  try {
    const savedOrders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    return Array.isArray(savedOrders) ? savedOrders : [];
  } catch {
    return [];
  }
}

async function loadPublicMenu() {
  try {
    const response = await fetch('/dishes.json');

    if (!response.ok) {
      throw new Error('Unable to load public menu');
    }

    const publicMenu = await response.json();
    return Array.isArray(publicMenu) ? publicMenu : [];
  } catch {
    return [];
  }
}

async function ensureMenuSeed() {
  const currentMenu = readMenu();
  const seededMenu = await loadPublicMenu();

  const merged = seededMenu.map((item) => {
    const storedItem = currentMenu.find((savedItem) => String(savedItem.id) === String(item.id));

    if (!storedItem) {
      return { ...item, visible: item.visible ?? true };
    }

    return {
      ...item,
      ...storedItem,
      visible: storedItem.visible ?? item.visible ?? true,
    };
  });

  const extras = currentMenu.filter(
    (item) =>
      !LEGACY_MENU_IDS.has(String(item.id)) &&
      !seededMenu.some((seed) => String(seed.id) === String(item.id))
  );

  const finalMenu = [...merged, ...extras];
  localStorage.setItem(MENU_KEY, JSON.stringify(finalMenu));
  return finalMenu;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menu, setMenu] = useState(() => readMenu());
  const [orders, setOrders] = useState(() => readOrders());
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDishId, setEditingDishId] = useState('');
  const [formValues, setFormValues] = useState({
    name: '',
    category: 'ethiopian',
    price: '',
    image: '',
    description: '',
    ingredients: '',
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }

    const syncMenu = async () => {
      const nextMenu = await ensureMenuSeed();
      setMenu(nextMenu);
      setOrders(readOrders());
    };

    syncMenu();
  }, [navigate, user]);

  const filteredMenu = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return menu;

    return menu.filter((item) => {
      const searchableText = `${item.name} ${item.category} ${item.description || ''}`.toLowerCase();
      return searchableText.includes(query);
    });
  }, [menu, search]);

  const analytics = useMemo(() => {
    const totalRevenue = orders
      .filter((order) => order.status !== 'cancelled')
      .reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);

    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const dishSalesMap = {};
    orders.forEach((order) => {
      if (!Array.isArray(order.items)) return;
      order.items.forEach((item) => {
        const name = item.name;
        dishSalesMap[name] = (dishSalesMap[name] || 0) + Number(item.quantity || 0);
      });
    });

    const topSelling = Object.entries(dishSalesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const statusCounts = { pending: 0, preparing: 0, delivering: 0, delivered: 0 };
    orders.forEach((order) => {
      const status = order.status || 'pending';
      if (statusCounts[status] !== undefined) statusCounts[status] += 1;
    });

    return { totalRevenue, totalOrders, averageOrderValue, topSelling, statusCounts };
  }, [orders]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const updateStoredMenu = (nextMenu) => {
    setMenu(nextMenu);
    localStorage.setItem(MENU_KEY, JSON.stringify(nextMenu));
    window.dispatchEvent(new CustomEvent('menu:updated'));
  };

  const updateStoredOrders = (nextOrders) => {
    setOrders(nextOrders);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(nextOrders));
    window.dispatchEvent(new CustomEvent('orders:updated'));
  };

  const handleOpenModal = (dish = null) => {
    if (dish) {
      setEditingDishId(dish.id);
      setFormValues({
        name: dish.name || '',
        category: dish.category || 'ethiopian',
        price: dish.price || '',
        image: dish.image || '',
        description: dish.description || '',
        ingredients: Array.isArray(dish.ingredients) ? dish.ingredients.join(', ') : '',
      });
    } else {
      setEditingDishId('');
      setFormValues({
        name: '',
        category: 'ethiopian',
        price: '',
        image: '',
        description: '',
        ingredients: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDishId('');
    setFormValues({
      name: '',
      category: 'ethiopian',
      price: '',
      image: '',
      description: '',
      ingredients: '',
    });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }));
  };

  const handleSaveDish = (event) => {
    event.preventDefault();

    const nextDish = {
      id: editingDishId || `dish-${Date.now()}`,
      name: formValues.name.trim(),
      category: formValues.category.trim().toLowerCase(),
      price: Number(formValues.price),
      image: formValues.image.trim(),
      description: formValues.description.trim(),
      ingredients: formValues.ingredients
        .split(',')
        .map((ingredient) => ingredient.trim())
        .filter(Boolean),
      visible: true,
    };

    if (!nextDish.name || !nextDish.image || !nextDish.description || !Number.isFinite(nextDish.price)) {
      return;
    }

    const nextMenu = editingDishId
      ? menu.map((dish) => (dish.id === editingDishId ? { ...dish, ...nextDish } : dish))
      : [...menu, nextDish];

    updateStoredMenu(nextMenu);
    handleCloseModal();
  };

  const toggleDishVisibility = (dishId, visible) => {
    const nextMenu = menu.map((dish) => (dish.id === dishId ? { ...dish, visible } : dish));
    updateStoredMenu(nextMenu);
  };

  const deleteDish = (dishId) => {
    if (!window.confirm('Delete this dish from the menu?')) return;
    const nextMenu = menu.filter((dish) => dish.id !== dishId);
    updateStoredMenu(nextMenu);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const nextOrders = orders.map((order) =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    updateStoredOrders(nextOrders);
  };

  const deleteOrder = (orderId) => {
    if (!window.confirm('Delete this order?')) return;
    const nextOrders = orders.filter((order) => order.id !== orderId);
    updateStoredOrders(nextOrders);
  };

  const resetAllData = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset all data? This will permanently delete all customer orders and clear menu modifications.'
    );

    if (!confirmed) return;

    localStorage.removeItem(ORDERS_KEY);
    localStorage.removeItem(MENU_KEY);
    window.dispatchEvent(new CustomEvent('orders:updated'));
    const freshMenu = await ensureMenuSeed();
    setMenu(freshMenu);
    window.dispatchEvent(new CustomEvent('menu:updated'));
    setOrders([]);
    window.alert('All order records have been cleared and the menu reset.');
  };

  return (
    <div className="admin-dashboard-page">
      <aside className="admin-sidebar">
        <div className="admin-nav-brand">Addis Eats Admin</div>
        <nav className="admin-nav-links" aria-label="Admin navigation">
          <a href="#metrics-grid" onClick={(event) => {
            event.preventDefault();
            document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}>Analytics</a>
          <a href="#menu-management" onClick={(event) => {
            event.preventDefault();
            document.getElementById('menu-management')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}>Menu</a>
          <a href="#order-management" onClick={(event) => {
            event.preventDefault();
            document.getElementById('order-management')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}>Order</a>
          <button type="button" onClick={handleLogout}>Logout</button>
        </nav>
      </aside>

      <main className="admin-main-content">
        <div className="admin-container">
          <section className="admin-panel" id="dashboard">
          <h2>Dashboard Analytics</h2>
          <div className="metrics-grid" id="metrics-grid">
            <div className="metric-card">
              <h3>Total Revenue</h3>
              <p>{analytics.totalRevenue.toFixed(2)} ETB</p>
            </div>
            <div className="metric-card">
              <h3>Total Orders</h3>
              <p>{analytics.totalOrders}</p>
            </div>
            <div className="metric-card">
              <h3>Average Order Value</h3>
              <p>{analytics.averageOrderValue.toFixed(2)} ETB</p>
            </div>
          </div>

          <div className="analytics-row">
            <div className="analytics-box">
              <h3>Top Selling Dishes</h3>
              <ul id="top-selling-list">
                {analytics.topSelling.length === 0 ? (
                  <li>No sales data yet.</li>
                ) : (
                  analytics.topSelling.map(([name, count]) => (
                    <li key={name}>
                      <strong>{name}</strong>: {count} ordered
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="analytics-box">
              <h3>Order Status Distribution</h3>
              <div id="status-distribution">
                <p>⏳ Pending: <strong>{analytics.statusCounts.pending}</strong></p>
                <p>👨‍🍳 Preparing: <strong>{analytics.statusCounts.preparing}</strong></p>
                <p>🛵 Delivering: <strong>{analytics.statusCounts.delivering}</strong></p>
                <p>✅ Delivered: <strong>{analytics.statusCounts.delivered}</strong></p>
              </div>
            </div>
          </div>
        </section>

        <section className="admin-panel" id="menu-management">
          <div className="panel-header">
            <h2>Menu Management</h2>
            <button type="button" className="admin-btn-primary" onClick={() => handleOpenModal()}>
              + Add New Dish
            </button>
          </div>

          <input
            type="text"
            id="admin-dish-search"
            placeholder="Search dishes by name or category..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMenu.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">No dishes found.</td>
                </tr>
              ) : (
                filteredMenu.map((dish) => (
                  <tr key={dish.id}>
                    <td>
                      <img src={dish.image || 'https://via.placeholder.com/40'} alt={dish.name} />
                    </td>
                    <td><strong>{dish.name}</strong></td>
                    <td><span style={{ textTransform: 'capitalize' }}>{dish.category || 'uncategorized'}</span></td>
                    <td>{Number(dish.price).toFixed(2)} ETB</td>
                    <td>
                      <label className="toggle-row">
                        <input
                          type="checkbox"
                          checked={dish.visible !== false}
                          onChange={(event) => toggleDishVisibility(dish.id, event.target.checked)}
                        />
                        <span>{dish.visible !== false ? 'Visible' : 'Hidden'}</span>
                      </label>
                      <button type="button" className="btn-edit" onClick={() => handleOpenModal(dish)}>
                        Edit
                      </button>
                      <button type="button" className="btn-delete" onClick={() => deleteDish(dish.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="admin-panel" id="order-management">
          <h2>Order Management</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Instructions</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">No customer orders yet.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>#{order.id}</strong></td>
                    <td>
                      {order.customerName || 'Unknown'}
                      <br />
                      <small>{order.phone || ''} | {order.area || ''}</small>
                    </td>
                    <td style={{ maxWidth: '220px', fontSize: '0.85rem' }}>
                      {Array.isArray(order.items)
                        ? order.items.map((item) => `${item.name} (x${item.quantity || 1})`).join(', ')
                        : 'No items'}
                    </td>
                    <td className="order-instructions">
                      {order.specialInstructions || 'None'}
                    </td>
                    <td>{Number(order.totalPrice || 0).toFixed(2)} ETB</td>
                    <td>
                      <select
                        className="order-status-select"
                        value={order.status || 'pending'}
                        onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="delivering">Delivering</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>
                    <td>
                      <button type="button" className="btn-delete" onClick={() => deleteOrder(order.id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

          <button type="button" className="admin-reset-button" onClick={resetAllData}>
            Reset All Data
          </button>
        </div>
      </main>

      {isModalOpen && (
        <div className="modal" onClick={(event) => {
          if (event.target === event.currentTarget) handleCloseModal();
        }}>
          <div className="modal-content">
            <button type="button" className="close-modal" aria-label="Close" onClick={handleCloseModal}>
              &times;
            </button>
            <h3>{editingDishId ? 'Edit Dish' : 'Add New Dish'}</h3>

            <form className="admin-dish-form" onSubmit={handleSaveDish}>
              <div className="form-row">
                <label htmlFor="dish-name">Dish Name</label>
                <input id="dish-name" name="name" type="text" value={formValues.name} onChange={handleFormChange} required />
              </div>

              <div className="form-row">
                <label htmlFor="dish-category">Category</label>
                <select id="dish-category" name="category" value={formValues.category} onChange={handleFormChange} required>
                  <option value="ethiopian">Ethiopian</option>
                  <option value="pizza">Pizza</option>
                  <option value="burgers">Burgers</option>
                  <option value="drinks">Drinks</option>
                  <option value="sides">Sides</option>
                </select>
              </div>

              <div className="form-row">
                <label htmlFor="dish-price">Price (ETB)</label>
                <input id="dish-price" name="price" type="number" min="1" value={formValues.price} onChange={handleFormChange} required />
              </div>

              <div className="form-row">
                <label htmlFor="dish-image">Image Path</label>
                <input id="dish-image" name="image" type="text" value={formValues.image} onChange={handleFormChange} placeholder="Image URL" required />
              </div>

              <div className="form-row">
                <label htmlFor="dish-description">Description</label>
                <textarea id="dish-description" name="description" rows="3" value={formValues.description} onChange={handleFormChange} required />
              </div>

              <div className="form-row">
                <label htmlFor="dish-ingredients">Ingredients</label>
                <input id="dish-ingredients" name="ingredients" type="text" value={formValues.ingredients} onChange={handleFormChange} placeholder="Comma separated ingredients" required />
              </div>

              <button type="submit" className="admin-btn-primary modal-submit">
                {editingDishId ? 'Update Dish' : 'Save Dish'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

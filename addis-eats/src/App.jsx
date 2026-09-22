import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './header/Header.jsx';
import Footer from './footer/Footer.jsx';
import Menu from './menu/Menu.jsx';
import Cart from './cart/Cart.jsx';
import HomePage from './home/HomePage.jsx';
import Checkout from './checkout/Checkout.jsx';
import OrderHistory from './orders/OrderHistory.jsx';
import AdminLogin from './admin/AdminLogin.jsx';
import AdminDashboard from './admin/AdminDashboard.jsx';
import SignIn from './auth/SignIn.jsx';
import { useAppStore } from './store/useAppStore.js';
import './admin/admin.css';

function App() {
  const location = useLocation();
  const isDark = useAppStore((state) => state.isDark);
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    document.body.classList.toggle('dark-theme', isDark);
    window.localStorage.setItem('addiseats_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    );
  }

  return (
    <div id="page-body">
      <Header />
      <Cart />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<OrderHistory />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;

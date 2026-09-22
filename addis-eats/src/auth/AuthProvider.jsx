import { useState } from 'react';
import { AuthContext } from './AuthContext.js';
const AUTH_KEY = 'addiseats_admin_user';
const LEGACY_AUTH_KEY = 'adminLoggedIn';
const CUSTOMER_AUTH_KEY = 'addiseats_customer_user';

function readStoredUser() {
  try {
    const savedUser = sessionStorage.getItem(AUTH_KEY);

    if (savedUser) {
      return JSON.parse(savedUser);
    }

    if (sessionStorage.getItem(LEGACY_AUTH_KEY) === 'true') {
      return { username: 'bereket', role: 'admin' };
    }
  } catch {
    return null;
  }

  return null;
}

function readStoredCustomer() {
  try {
    const savedCustomer = sessionStorage.getItem(CUSTOMER_AUTH_KEY);
    return savedCustomer ? JSON.parse(savedCustomer) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [customer, setCustomer] = useState(readStoredCustomer);

  const login = (nextUser) => {
    setUser(nextUser);
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(nextUser));
    sessionStorage.setItem(LEGACY_AUTH_KEY, 'true');
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(LEGACY_AUTH_KEY);
  };

  const customerLogin = (nextCustomer) => {
    setCustomer(nextCustomer);
    sessionStorage.setItem(CUSTOMER_AUTH_KEY, JSON.stringify(nextCustomer));
  };

  const customerLogout = () => {
    setCustomer(null);
    sessionStorage.removeItem(CUSTOMER_AUTH_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, customer, customerLogin, customerLogout }}>
      {children}
    </AuthContext.Provider>
  );
}


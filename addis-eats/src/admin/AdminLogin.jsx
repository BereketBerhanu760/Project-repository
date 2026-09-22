import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';

function AdminLogin() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [formValues, setFormValues] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin');
    }
  }, [navigate, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }));
    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const username = formValues.username.trim();
    const password = formValues.password.trim();

    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    if (username === 'bereket' && password === 'bereket') {
      login({ username, role: 'admin' });
      navigate('/admin');
      return;
    }

    setError('Invalid username or password.');
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-logo">Addis Eats</div>
        <p className="admin-login-subtitle">Sign in to manage menu and orders</p>

        {error && <div className="admin-error-msg">{error}</div>}

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={formValues.username}
              onChange={handleChange}
              placeholder="Enter username"
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formValues.password}
              onChange={handleChange}
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Sign In
          </button>
        </form>

        <button
          type="button"
          className="admin-return-button"
          onClick={() => navigate('/')}
        >
          Return to customer site
        </button>
      </div>
    </main>
  );
}

export default AdminLogin;

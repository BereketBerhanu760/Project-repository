import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth.js';

function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { customer, customerLogin } = useAuth();
  const [formValues, setFormValues] = useState({ name: '', password: '' });
  const [error, setError] = useState('');
  const destination = location.state?.from || '/checkout';

  useEffect(() => {
    if (customer) {
      navigate(destination, { replace: true });
    }
  }, [customer, destination, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }));
    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const name = formValues.name.trim();
    const password = formValues.password.trim();

    if (!name || !password) {
      setError('Please enter your name and password.');
      return;
    }

    customerLogin({ name, role: 'customer' });
    navigate(destination, { replace: true });
  };

  return (
    <main className="customer-sign-in-page">
      <div className="customer-sign-in-card">
        <div className="customer-sign-in-logo">Addis Eats</div>
        <p className="customer-sign-in-subtitle">Sign in to continue to checkout</p>

        {error && <div className="customer-sign-in-error">{error}</div>}

        <form className="customer-sign-in-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="customer-sign-in-name">Full Name</label>
            <input
              id="customer-sign-in-name"
              name="name"
              type="text"
              value={formValues.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="customer-sign-in-password">Password</label>
            <input
              id="customer-sign-in-password"
              name="password"
              type="password"
              value={formValues.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="customer-sign-in-button">
            Sign In
          </button>
        </form>

      </div>
    </main>
  );
}

export default SignIn;
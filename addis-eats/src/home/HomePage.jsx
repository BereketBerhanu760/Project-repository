import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button.jsx';

function HomePage() {
  const navigate = useNavigate();

  return (
    <main>
      <div id="section-hero">
        <h1 id="hero-title">Welcome to Addis Eats</h1>
        <p id="hero-subtitle">
          Delicious food delivered straight to your doorstep across Addis Ababa.
        </p>
      </div>

      <div id="section-order-food">
        <h2 id="order-food-title">Order Your Food</h2>
        <p id="order-food-desc">
          Explore our full menu of Ethiopian dishes, pizzas, burgers, and drinks.
        </p>
        <Button id="btn-goto-menu" onClick={() => navigate('/menu')}>
          Browse Full Menu
        </Button>
      </div>
    </main>
  );
}

export default HomePage;

import { useAppStore } from '../store/useAppStore.js';

function Card({ item }) {
    const addToCart = useAppStore((state) => state.addToCart);
    const favorites = useAppStore((state) => state.favorites);
    const toggleFavorite = useAppStore((state) => state.toggleFavorite);
    const isFavorite = favorites.includes(item.id);

    const handleAddToCart = () => {
        addToCart({
            name: item.name,
            price: item.price,
            image: item.image,
        });
    };

    return (
        <article className="menu_card" data-name={item.name} data-price={item.price} data-category={item.category || ''}>
            {item.tag && <span className="tag">{item.tag}</span>}
            <button
                type="button"
                className={`favorite-button ${isFavorite ? 'active' : ''}`}
                onClick={() => toggleFavorite(item.id)}
                aria-label={isFavorite ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
                aria-pressed={isFavorite}
            >
                {isFavorite ? '♥' : '♡'}
            </button>
            <div className="menu_card_image">
                <img src={item.image} alt={item.imageAlt || item.name} />
            </div>
            <div className="menu_card_details">
                <h3 className="item_name">{item.name}</h3>
                <p className="description">{item.description}</p>
                <details className="dish-details">
                    <summary>View Ingredients &amp; Spiciness</summary>
                    <div className="dish-details_content">
                        <div className="dish-meta">
                            <span>Category: <strong>{item.category}</strong></span>
                            <span className={item.spicy ? 'spicy' : 'not-spicy'}>
                                {item.spicy ? 'Spicy' : 'Not Spicy'}
                            </span>
                        </div>
                        {item.ingredients?.length > 0 && (
                            <ul className="ingredients">
                                {item.ingredients.map((ingredient) => <li key={ingredient}>{ingredient}</li>)}
                            </ul>
                        )}
                    </div>
                </details>
                <div className="price">{item.price} ETB</div>
                <button
                    type="button"
                    className="btn-add-to-cart"
                    onClick={handleAddToCart}
                >
                    Add to Cart
                </button>
            </div>
        </article>
    );
}

export default Card
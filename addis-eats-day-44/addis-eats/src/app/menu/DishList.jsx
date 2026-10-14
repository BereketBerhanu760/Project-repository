import Link from "next/link";
import Image from "next/image";
import FavoriteButton from "./FavoriteButton";

export default function DishList({ dishes }) {
  return (
    <div className="dish-grid">
      {dishes.map((dish, index) => (
        <article className="dish-card" key={dish.id}>
          <div>
            <div className="dish-media">
              <FavoriteButton dishId={dish.id} />
              {dish.image ? (
                <Image
                  src={dish.image}
                  alt={dish.imageAlt || dish.name}
                  width={dish.imageWidth}
                  height={dish.imageHeight}
                  sizes="(max-width: 700px) calc(100vw - 5.5rem), (max-width: 1120px) calc((100vw - 30rem) / 3), 210px"
                  loading={index === 0 ? "eager" : "lazy"}
                  className="dish-image"
                />
              ) : (
                <div className="dish-emoji">{dish.emoji}</div>
              )}
            </div>
            {dish.tag ? <span className="dish-tag">{dish.tag}</span> : null}
            <h3>{dish.name}</h3>
            <p>{dish.description}</p>
            {dish.spicy ? <span className="dish-spicy">Spicy</span> : null}
          </div>
          <div className="price-row">
            <span>{dish.price} Birr</span>
            <Link className="text-link" href={`/menu/${dish.id}`}>
              Details →
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

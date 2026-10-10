import Link from "next/link";
import Image from "next/image";

export default function DishList({ dishes }) {
  return (
    <div className="dish-grid">
      {dishes.map((dish) => (
        <article className="dish-card" key={dish.id}>
          <div>
            <div className="dish-media">
              {dish.image ? (
                <Image
                  src={dish.image}
                  alt={dish.name}
                  width={dish.imageWidth}
                  height={dish.imageHeight}
                  sizes="(max-width: 700px) calc(100vw - 3rem), (max-width: 1120px) calc((100vw - 5rem) / 3), 347px"
                  className="dish-image"
                />
              ) : (
                <div className="dish-emoji">{dish.emoji}</div>
              )}
            </div>
            <h3>{dish.name}</h3>
            <p>{dish.description}</p>
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
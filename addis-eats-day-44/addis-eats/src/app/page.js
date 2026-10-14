import Link from "next/link";
import Image from "next/image";
import { dishes } from "@/app/menu/data";

export const metadata = {
  title: "Ethiopian food, delivered",
  description: "Discover Ethiopian favorites made for sharing, from slow-cooked Doro Wot to bright, gently spiced lentils.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main className="main">
        <section className="hero">
          <div>
            <p className="eyebrow">A taste of home</p>
            <h1>Good food.</h1>
            <p className="hero-copy">Slow-cooked stews, bright spices, and the generous welcome of an Ethiopian table, delivered to your door.</p>
            <Link className="button" href="/menu">Explore the menu</Link>
          </div>
          <div className="hero-art">
            <Image
              src="/images/doro_wat.jpg"
              alt="Doro Wot, an Ethiopian chicken stew"
              width={1024}
              height={732}
              sizes="(max-width: 700px) calc(100vw - 3rem), (max-width: 1120px) calc((100vw - 6rem) * 0.425), 435px"
              priority
              className="hero-image"
            />
          </div>
        </section>
        <section>
          <div className="section-heading"><h2>From our kitchen</h2><p>Made fresh in Addis, shared everywhere.</p></div>
          <div className="dish-grid">
            {dishes.slice(0, 3).map((dish) => <DishPreview key={dish.id} dish={dish} />)}
          </div>
        </section>
      </main>
  );
}

function DishPreview({ dish }) {
  return (
    <article className="dish-card">
      <div>
        <div className="dish-media">
          {dish?.image ? (
            <Image
              src={dish.image}
              alt={dish.imageAlt || dish.name}
              width={dish.imageWidth}
              height={dish.imageHeight}
              sizes="(max-width: 700px) calc(100vw - 5.5rem), (max-width: 1120px) calc((100vw - 12rem) / 3), 298px"
              className="dish-image"
            />
          ) : (
            <div className="dish-emoji">🍽️</div>
          )}
        </div>
        <h3>{dish.name}</h3>
        <p>{dish.description}</p>
      </div>
      <Link className="text-link" href={`/menu/${dish.id}`}>View dish →</Link>
    </article>
  );
}

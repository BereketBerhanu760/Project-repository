import Link from "next/link";
import Image from "next/image";

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
            <h1>Good food carries a story.</h1>
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
            <DishPreview emoji="🍛" name="Doro Wot" text="Berbere chicken stew with egg and a deep, warming finish." id="doro-wot" />
            <DishPreview emoji="🥘" name="Misir Wot" text="Earthy red lentils simmered with our house berbere blend." id="misir-wot" />
            <DishPreview emoji="🥬" name="Gomen" text="Slow-cooked collard greens brightened with garlic and ginger." id="gomen" />
          </div>
        </section>
      </main>
  );
}

function DishPreview({ emoji, name, text, id }) {
  return <article className="dish-card"><div><div className="dish-media">
                <div className="dish-emoji">{emoji}</div>
              </div><h3>{name}</h3><p>{text}</p></div><Link className="text-link" href={`/menu/${id}`}>View dish →</Link></article>;
}

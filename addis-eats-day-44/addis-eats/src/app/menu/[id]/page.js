import Link from "next/link";
import { notFound } from "next/navigation";
import { dishes, getDish } from "../data";
import { addToCart } from "@/app/cart/actions";
import { SITE_URL } from "@/lib/site-url";

export function generateStaticParams() {
    return dishes.map((dish) => ({ id: dish.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const dish = getDish(id);
  if (!dish) notFound();

  return {
    title: dish.name,
    description: dish.description,
    alternates: { canonical: `/menu/${dish.id}` },
    openGraph: {
      type: "website",
      title: `${dish.name} | Addis Eats`,
      description: dish.description,
      url: `/menu/${dish.id}`,
      images: [
        {
          url: new URL(`/menu/${dish.id}/opengraph-image`, SITE_URL),
          width: 1200,
          height: 630,
          alt: `${dish.name}, an Ethiopian dish from Addis Eats`,
        },
      ],
    },
  };
}

export default async function DishPage({ params }) {
  const { id } = await params;
  const dish = getDish(id);
  if (!dish) notFound();
  const dishJsonLd = {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: dish.name,
    description: dish.description,
    offers: {
      "@type": "Offer",
      price: dish.price,
      priceCurrency: "ETB",
    },
  };
  return (
    <main className="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(dishJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <article className="detail">
        <Link className="text-link" href="/menu">← Back to menu</Link>
        <div className="detail-mark">{dish.emoji}</div>
        <p className="eyebrow">{dish.category}</p>
        <h1>{dish.name}</h1>
        <p>{dish.description}</p>
        <div className="detail-meta">
          <span>{dish.price} Birr</span>
        </div>
        <form action={addToCart}>
          <input type="hidden" name="dishId" value={dish.id} />
          <button className="button" type="submit">Add to cart</button>
        </form>
      </article>
    </main>
  );
}
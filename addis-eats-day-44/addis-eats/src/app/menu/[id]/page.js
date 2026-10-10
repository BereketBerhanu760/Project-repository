import Link from "next/link";
import { notFound } from "next/navigation";
import { dishes, getDish } from "../data";
import { addToCart } from "@/app/cart/actions";

export function generateStaticParams() {
    return dishes.map((dish) => ({ id: dish.id }));
}

export default async function DishPage({ params }) {
  const { id } = await params;
  const dish = getDish(id);
  if (!dish) notFound();
  return <main className="main">
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
            </main>;
}
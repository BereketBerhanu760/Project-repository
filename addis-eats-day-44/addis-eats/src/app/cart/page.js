import Link from "next/link";
import { getCart } from "@/lib/cart";
import { removeFromCart } from "./actions";

export const metadata = {
    title: "Your cart",
    description: "Review the Ethiopian dishes in your Addis Eats cart before continuing to checkout.",
    alternates: { canonical: "/cart" },
    robots: { index: false, follow: false },
};

export default async function CartPage() {
    const items = await getCart();
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);

    return (
        <main className="main">
            <div className="simple-panel">
                <p className="eyebrow">Your order</p>
                <h1>{items.length ? "Ready when you are." : "Your cart is waiting."}</h1>
                {items.length ? (
                    <>
                        <div className="cart-list">
                            {items.map(({ dish, dishId, quantity, subtotal }) => (
                                <article className="cart-row" key={dishId}>
                                    <div className="cart-dish-mark" aria-hidden="true">{dish.emoji}</div>
                                    <div className="cart-dish-info">
                                        <h2>{dish.name}</h2>
                                        <p>Quantity {quantity} · {dish.price} Birr each</p>
                                    </div>
                                    <strong>{subtotal} Birr</strong>
                                    <form action={removeFromCart}>
                                        <input type="hidden" name="dishId" value={dishId} />
                                        <button className="text-link" type="submit">Remove</button>
                                    </form>
                                </article>
                            ))}
                        </div>
                        <div className="cart-total"><strong>Total</strong><strong>{total} Birr</strong></div>
                        <Link className="button" href="/checkout">Continue to checkout</Link>
                    </>
                ) : (
                    <>
                        <p>There is nothing here yet. Start with something warm, spiced, and made for sharing.</p>
                        <Link className="button" href="/menu">Browse the menu</Link>
                    </>
                )}
            </div>
        </main>
    );
}
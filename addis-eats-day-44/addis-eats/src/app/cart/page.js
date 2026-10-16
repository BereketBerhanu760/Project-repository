import Link from "next/link";
import { redirect } from "next/navigation";
import { getCart } from "@/lib/cart";
import { getSession } from "@/lib/session";
import CartItems from "./CartItems";

export const metadata = {
  title: "Your cart",
  description: "Review dishes in your Addis Eats cart before checkout.",
  alternates: { canonical: "/cart" },
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const session = await getSession();
  if (session?.role === "staff") redirect("/kitchen");
  const items = await getCart();
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <main className="main">
      <div className="simple-panel">
        <p className="eyebrow">Your order</p>
        <h1>{items.length ? "Ready when you are." : "Your cart is waiting."}</h1>
        {items.length ? (
          <>
            <CartItems items={items} />
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

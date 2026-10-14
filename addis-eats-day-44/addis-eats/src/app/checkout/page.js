import CheckoutForm from "./CheckoutForm";
import Image from "next/image";
import { cancelOrder } from "./actions";
import Link from "next/link";
import { getCart } from "@/lib/cart";
import { getDish } from "@/app/menu/data";
import { listOrdersForOwner } from "@/lib/order-store";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { appendSearchParams } from "@/lib/safe-return-to";
import { etb } from "@/lib/format";

export const metadata = {
  title: "Checkout",
  description: "Enter your delivery details to place an Addis Eats order.",
  alternates: { canonical: "/checkout" },
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({ searchParams }) {
  const session = await getSession();
  if (session?.role === "staff") redirect("/kitchen");
  if (!session) {
    const params = await searchParams;
    const returnTo = appendSearchParams("/checkout", params);
    redirect(`/signin?next=${encodeURIComponent(returnTo)}`);
  }
  const cart = await getCart();
  const orders = await listOrdersForOwner(session.id);

  return (
    <main className="main">
      <div className="account-bar">
        <span>Signed in as {session.username}</span>
      </div>
      <CheckoutForm items={cart} />
      {orders.length > 0 ? (
        <section className="order-history" aria-labelledby="orders-heading">
          <h2 id="orders-heading">Your recent orders</h2>
          {orders.map((order) => {
            const orderItems = order.items?.length
              ? order.items
              : [{ dishId: order.dishId, quantity: 1 }];

            return (
              <article className="order-row" key={order.id}>
                <div>
                  <strong>{order.name}</strong>
                  <div className="checkout-recent-items">
                    {orderItems.map(({ dishId, quantity }) => {
                      const dish = getDish(dishId);
                      return dish ? (
                        <span className="checkout-recent-item" key={dishId}>
                          <Image
                            src={dish.image}
                            alt={`${dish.imageAlt || dish.name} in a recent order`}
                            width={dish.imageWidth}
                            height={dish.imageHeight}
                            sizes="40px"
                          />
                          {dish.name} × {quantity}
                        </span>
                      ) : null;
                    })}
                  </div>
                  <p>{etb(order.totalETB)}</p>
                </div>
                <div className="order-actions">
                  <Link className="text-link" href={`/track/${order.id}`}>Track status</Link>
                  <form action={cancelOrder.bind(null, order.id)}>
                    <button className="text-link" type="submit">Cancel order</button>
                  </form>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}
    </main>
  );
}

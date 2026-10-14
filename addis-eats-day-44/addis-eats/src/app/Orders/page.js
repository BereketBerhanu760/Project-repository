import Link from "next/link";
import { redirect } from "next/navigation";
import { getDish } from "@/app/menu/data";
import { getSession } from "@/lib/session";
import { listOrders, listOrdersForOwner } from "@/lib/order-store";
import { etb, when } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Your orders",
  description: "Track your Addis Eats orders.",
  alternates: { canonical: "/Orders" },
  robots: { index: false, follow: false },
};

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/signin?next=%2FOrders");

  const isStaff = session.role === "staff";
  const orders = isStaff
    ? await listOrders()
    : await listOrdersForOwner(session.id);

  return (
    <main className="main">
      <section className="simple-panel">
        <p className="eyebrow">{isStaff ? "Staff view" : "Your account"}</p>
        <h1>{isStaff ? "All orders." : "Your orders."}</h1>
        <p>
          {isStaff
            ? "Review and track incoming customer orders."
            : "View your order history and track your deliveries."}
        </p>
      </section>

      <section
        className="order-history"
        aria-label={isStaff ? "All orders" : "Your orders"}
      >
        {orders.length ? (
          <div className="order-history-heading">
            <h2>Order history</h2>
          </div>
        ) : null}

        {orders.length ? (
          orders.map((order) => (
            <article className="order-row" key={order.id}>
              <div>
                <strong>{order.name}</strong>
                <p>
                  {order.items
                    ?.map(
                      ({ dishId, quantity }) =>
                        `${quantity} × ${getDish(dishId)?.name ?? dishId}`,
                    )
                    .join(", ") || order.dishId}{" "}
                  · {etb(order.totalETB)}
                </p>
                {isStaff ? <p>Placed {when(order.createdAt)}</p> : null}
              </div>

              <Link className="text-link" href={`/track/${order.id}`}>
                Track order
              </Link>
            </article>
          ))
        ) : (
          <p>
            {isStaff
              ? "No orders have been placed yet."
              : "You have no orders yet."}
          </p>
        )}
      </section>

      <Link className="button" href="/menu">
        Browse the menu
      </Link>
    </main>
  );
}

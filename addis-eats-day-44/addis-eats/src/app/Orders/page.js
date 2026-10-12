import Link from "next/link";
import { redirect } from "next/navigation";
import { getDish } from "@/app/menu/data";
import { getSession } from "@/lib/session";
import { listOrders, listOrdersForOwner } from "@/lib/order-store";
import OrderStatus from "./OrderStatus";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Your orders",
  description: "Track the status of your Addis Eats orders.",
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
        <p>{isStaff ? "Review and track incoming customer orders." : "Follow each order from receipt through delivery."}</p>
      </section>
      <section className="order-history" aria-label={isStaff ? "All orders" : "Your orders"}>
        {orders.length ? orders.map((order) => (
          <article className="order-row" key={order.id}>
            <div>
              <strong>{order.name}</strong>
              <p>{order.items?.map(({ dishId, quantity }) => `${quantity} × ${getDish(dishId)?.name ?? dishId}`).join(", ") || order.dishId} · {order.totalETB} Birr</p>
              {isStaff ? <p>Placed {new Date(order.createdAt).toLocaleString()}</p> : null}
            </div>
            <OrderStatus
              id={order.id}
              initialData={{
                order: {
                  id: order.id,
                  status: order.status || "pending",
                  createdAt: order.createdAt,
                },
              }}
            />
            <Link className="text-link" href={`/Orders/${order.id}`}>Track order</Link>
          </article>
        )) : <p>{isStaff ? "No orders have been placed yet." : "You have no orders yet."}</p>}
      </section>
      <Link className="button" href="/menu">Browse the menu</Link>
    </main>
  );
}
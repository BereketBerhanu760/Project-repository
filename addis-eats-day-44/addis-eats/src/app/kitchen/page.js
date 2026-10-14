import { notFound } from "next/navigation";
import { listOrders } from "@/lib/order-store";
import { getSession } from "@/lib/session";
import { deleteAllOrders, deleteOrder, updateOrderStatus } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Kitchen orders",
  description: "Staff view for preparing and checking incoming Addis Eats orders.",
  alternates: { canonical: "/kitchen" },
  robots: { index: false, follow: false },
};

export default async function KitchenPage() {
  const session = await getSession();
  if (!session) notFound();
  if (session.role !== "staff") notFound();

  const orders = await listOrders();

  return (
    <main className="main">
      <section className="simple-panel">
        <p className="eyebrow">Staff only · Kitchen</p>
        <h1>Incoming orders.</h1>
        <p>Signed in as {session.username}.</p>
        {orders.length ? (
          <details className="delete-all-orders">
            <summary>Clear all orders</summary>
            <p>This permanently deletes all {orders.length} orders and removes them from customer tracking.</p>
            <form action={deleteAllOrders}>
              <button className="danger-button" type="submit">Confirm clear all</button>
            </form>
          </details>
        ) : null}
      </section>
      <section className="order-history" aria-label="Kitchen order list">
        {orders.length ? orders.map((order) => {
          const currentStatus = ["pending", "delivering", "received"].includes(order.status?.toLowerCase())
            ? order.status.toLowerCase()
            : "pending";

          return (
            <article className="order-row" key={order.id}>
              <div>
                <strong>{order.name}</strong>
                <p>{order.items?.map(({ dishId, quantity }) => `${quantity} × ${dishId}`).join(", ") || order.dishId}</p>
                <p>Order {order.id}</p>
              </div>
              <form action={updateOrderStatus} className="order-status-form">
                <input type="hidden" name="orderId" value={order.id} />
                <label className="sr-only" htmlFor={`status-${order.id}`}>Status for order {order.id}</label>
                <select id={`status-${order.id}`} name="status" defaultValue={currentStatus}>
                  <option value="pending">Pending</option>
                  <option value="delivering">Delivering</option>
                  <option value="received">Received</option>
                </select>
                <button className="button" type="submit">Update status</button>
              </form>
              <details className="delete-order">
                <summary>Delete</summary>
                <form action={deleteOrder}>
                  <input type="hidden" name="orderId" value={order.id} />
                  <button className="danger-button" type="submit">Confirm delete</button>
                </form>
              </details>
            </article>
          );
        }) : <p>No orders are waiting.</p>}
      </section>
    </main>
  );
}

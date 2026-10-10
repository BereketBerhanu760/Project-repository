import { notFound } from "next/navigation";
import SignOutForm from "@/app/SignOutForm";
import { listOrders } from "@/lib/order-store";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

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
        <SignOutForm />
      </section>
      <section className="order-history" aria-label="Kitchen order list">
        {orders.length ? orders.map((order) => (
          <article className="order-row" key={order.id}>
            <div>
              <strong>{order.name}</strong>
              <p>{order.items?.map(({ dishId, quantity }) => `${quantity} × ${dishId}`).join(", ") || order.dishId}</p>
            </div>
            <span className="status">{order.status || "Received"}</span>
          </article>
        )) : <p>No orders are waiting.</p>}
      </section>
    </main>
  );
}

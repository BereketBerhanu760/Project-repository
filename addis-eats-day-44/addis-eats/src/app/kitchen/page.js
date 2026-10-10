import { notFound } from "next/navigation";
import { listOrders } from "@/lib/order-store";
import { getSession } from "@/lib/session";

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

import Link from "next/link";
import { notFound } from "next/navigation";
import OrderStatus from "@/app/Orders/OrderStatus";
import { getOrderForOwner } from "@/lib/order-store";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { appendSearchParams } from "@/lib/safe-return-to";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: "Track your order",
    description: "Check the latest status of your Addis Eats order.",
    alternates: { canonical: `/Orders/${id}` },
    robots: { index: false, follow: false },
  };
}

export default async function OrderPage({ params, searchParams }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    const query = await searchParams;
    const returnTo = appendSearchParams(`/Orders/${id}`, query);
    redirect(`/signin?next=${encodeURIComponent(returnTo)}`);
  }
  const order = await getOrderForOwner(id, session.id);

  if (!order) notFound();

  const initialData = {
    order: {
      id: order.id,
      status: order.status || "Received",
      createdAt: order.createdAt,
    },
  };

  return (
    <main className="main">
      <section className="simple-panel order-status-panel">
        <p className="eyebrow">Order tracking</p>
        <p>Signed in as {session.username}.</p>
        <h1>Your order is in good hands.</h1>
        <p>Reference: {order.id}</p>
        <p>Placed {new Date(order.createdAt).toLocaleString()}</p>
        <OrderStatus id={id} initialData={initialData} />
        <p className="menu-updating">Status refreshes automatically every five seconds.</p>
        <Link className="button" href="/menu">Back to the menu</Link>
      </section>
    </main>
  );
}

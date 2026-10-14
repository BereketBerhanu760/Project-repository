import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getOrderById, getOrderForOwner } from "@/lib/order-store";
import { getSession } from "@/lib/session";
import { etb, relative, when } from "@/lib/format";
import { trackingSnapshot } from "@/lib/tracking";
import { appendSearchParams } from "@/lib/safe-return-to";
import { getDish } from "@/app/menu/data";
import TrackingLive from "./TrackingLive";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Track your delivery",
  description: "See the latest status and delivery location for your Addis Eats order.",
  robots: { index: false, follow: false },
};

export default async function TrackOrderPage({ params, searchParams }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    const query = await searchParams;
    const returnTo = appendSearchParams(`/track/${id}`, query);
    redirect(`/signin?next=${encodeURIComponent(returnTo)}`);
  }

  const order = session.role === "staff"
    ? await getOrderById(id)
    : await getOrderForOwner(id, session.id);
  if (!order) notFound();

  const initialSnapshot = trackingSnapshot(order);
  const itemSummary = order.items?.map(({ dishId, quantity }) => {
    const dish = getDish(dishId);
    return `${quantity} × ${dish?.name ?? dishId}`;
  }).join(", ") || getDish(order.dishId)?.name || order.dishId;

  return (
    <main className="main track-order-page">
      <section className="simple-panel tracking-intro">
        <p className="eyebrow">Delivery tracking</p>
        <h1>Track your Addis Eats order.</h1>
        <p>Order reference: <span className="tracking-reference">{order.id}</span></p>
        <dl className="tracking-order-summary">
          <div><dt>Items</dt><dd>{itemSummary}</dd></div>
          <div><dt>Total</dt><dd>{etb(order.totalETB)}</dd></div>
          <div><dt>Placed</dt><dd><time dateTime={order.createdAt}>{when(order.createdAt)}</time> · {relative(order.createdAt)}</dd></div>
        </dl>
      </section>

      <TrackingLive
        id={id}
        initialSnapshot={initialSnapshot}
        initialRelative={relative(initialSnapshot.updatedAt)}
      />

      <div className="tracking-page-actions">
        <Link className="text-link" href="/Orders">Back to order history</Link>
        <Link className="button" href="/menu">Browse the menu</Link>
      </div>
    </main>
  );
}

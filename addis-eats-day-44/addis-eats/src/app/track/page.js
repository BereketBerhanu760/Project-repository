import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listOrdersForOwner } from "@/lib/order-store";
import { relative } from "@/lib/format";
import { trackingSnapshot } from "@/lib/tracking";
import TrackingLive from "./[id]/TrackingLive";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Track your delivery",
  description: "Watch the latest Addis Eats delivery move from the kitchen to you.",
  robots: { index: false, follow: false },
};

export default async function CustomerTrackingPage() {
  const session = await getSession();
  if (session?.role === "staff") redirect("/kitchen");
  if (!session) redirect("/signin?next=%2Ftrack");

  const orders = await listOrdersForOwner(session.id);
  const order = orders.at(-1);

  if (!order) {
    return (
      <main className="main track-order-page">
        <section className="simple-panel">
          <p className="eyebrow">Delivery tracking</p>
          <h1>No delivery to track yet.</h1>
          <p>Your latest delivery will appear here after you place an order.</p>
          <Link className="text-link" href="/menu">Browse the menu</Link>
        </section>
      </main>
    );
  }

  const snapshot = trackingSnapshot(order);
  return (
    <main className="main track-order-page">
      <TrackingLive id={order.id} initialSnapshot={snapshot} initialRelative={relative(snapshot.updatedAt)} />
    </main>
  );
}

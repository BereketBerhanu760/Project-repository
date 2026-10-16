"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDish } from "@/app/menu/data";
import { etb, relative, when } from "@/lib/format";
import { trackingSnapshot } from "@/lib/tracking";
import TrackingLive from "./TrackingLive";

function findSavedOrder(customerId, id) {
  try {
    const orders = JSON.parse(window.localStorage.getItem(`addis_orders:${customerId}`) || "[]");
    return Array.isArray(orders) ? orders.find((order) => order?.id === id) ?? null : null;
  } catch {
    return null;
  }
}

export default function LocalOrderTrackingFallback({ id, customerId }) {
  const [order, setOrder] = useState(undefined);

  useEffect(() => {
    setOrder(findSavedOrder(customerId, id));
  }, [customerId, id]);

  if (order === undefined) {
    return <main className="main"><section className="simple-panel"><p role="status">Looking for this order on this device…</p></section></main>;
  }

  if (!order) {
    return (
      <main className="main">
        <section className="simple-panel">
          <p className="eyebrow">Order unavailable</p>
          <h1>We couldn’t find this order.</h1>
          <p>This browser doesn’t have a saved copy of the order. Open the order link on the device where you placed it, or check with the restaurant.</p>
          <Link className="button" href="/Orders">Back to order history</Link>
        </section>
      </main>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const itemSummary = items.map(({ dishId, quantity }) => `${quantity} × ${getDish(dishId)?.name ?? dishId}`).join(", ")
    || getDish(order.dishId)?.name
    || order.dishId;
  const snapshot = trackingSnapshot(order);

  return (
    <main className="main track-order-page">
      <section className="simple-panel tracking-intro">
        <p className="eyebrow">Delivery tracking</p>
        <h1>Track your Addis Eats order.</h1>
        <p>Order reference: <span className="tracking-reference">{order.id}</span></p>
        <p>{itemSummary} · {etb(order.totalETB)}</p>
        <p>Placed {when(order.createdAt)} · {relative(order.createdAt)}</p>
        {order.phone ? <p>Phone: {order.phone}</p> : null}
        {order.address ? <p>Delivery location: {order.address}</p> : null}
        <p role="status">Showing the saved order on this device. Live staff updates need a server-side persistent store.</p>
      </section>
      <TrackingLive
        id={id}
        initialSnapshot={snapshot}
        initialRelative={relative(snapshot.updatedAt)}
        liveUpdates={false}
      />
      <div className="tracking-page-actions">
        <Link className="text-link" href="/Orders">Back to order history</Link>
        <Link className="button" href="/menu">Browse the menu</Link>
      </div>
    </main>
  );
}

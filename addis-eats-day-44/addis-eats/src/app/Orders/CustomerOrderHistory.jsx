"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDish } from "@/app/menu/data";
import { etb, when } from "@/lib/format";

function safeLocalOrder(order) {
  if (!order || typeof order.id !== "string") return null;
  return {
    id: order.id,
    name: typeof order.name === "string" ? order.name : "Customer",
    phone: typeof order.phone === "string" ? order.phone : "",
    address: typeof order.address === "string" ? order.address : "",
    items: Array.isArray(order.items)
      ? order.items.filter((item) => typeof item?.dishId === "string" && Number.isInteger(item.quantity) && item.quantity > 0)
      : [],
    dishId: typeof order.dishId === "string" ? order.dishId : "",
    totalETB: Number.isFinite(Number(order.totalETB)) ? Number(order.totalETB) : 0,
    status: typeof order.status === "string" ? order.status : "pending",
    createdAt: typeof order.createdAt === "string" ? order.createdAt : "",
  };
}

export default function CustomerOrderHistory({ customerId, initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);

  useEffect(() => {
    if (!customerId) return;
    const storageKey = `addis_orders:${customerId}`;
    let savedOrders = [];
    try {
      const parsed = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
      if (Array.isArray(parsed)) savedOrders = parsed.map(safeLocalOrder).filter(Boolean);
    } catch {
      // Continue with the server-provided orders if local storage is unavailable.
    }

    const byId = new Map(savedOrders.map((order) => [order.id, order]));
    for (const order of initialOrders) {
      const safeOrder = safeLocalOrder(order);
      if (safeOrder) byId.set(safeOrder.id, safeOrder);
    }
    const merged = Array.from(byId.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 15);
    setOrders(merged);

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(merged));
    } catch {
      // The server-provided order history remains available if storage is blocked or full.
    }
  }, [customerId, initialOrders]);

  return (
    <>
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
                {order.items.length
                  ? order.items.map(({ dishId, quantity }) => `${quantity} × ${getDish(dishId)?.name ?? dishId}`).join(", ")
                  : getDish(order.dishId)?.name ?? order.dishId} · {etb(order.totalETB)}
              </p>
              {order.phone ? <p>Phone: {order.phone}</p> : null}
              {order.address ? <p>Delivery location: {order.address}</p> : null}
              <p>Placed {when(order.createdAt)}</p>
            </div>
            <Link className="text-link" href={`/track/${encodeURIComponent(order.id)}`}>
              Track order
            </Link>
          </article>
        ))
      ) : (
        <p>You have no orders yet.</p>
      )}
    </>
  );
}

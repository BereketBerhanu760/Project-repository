"use client";

import { useEffect, useState } from "react";
import { getDish } from "@/app/menu/data";
import { etb, when } from "@/lib/format";

function readLocalOrders() {
  const ordersById = new Map();

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith("addis_orders:")) continue;

    try {
      const saved = JSON.parse(window.localStorage.getItem(key) || "[]");
      if (!Array.isArray(saved)) continue;
      for (const order of saved) {
        if (!order || typeof order.id !== "string" || !order.id) continue;
        ordersById.set(order.id, {
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
        });
      }
    } catch {
      // Ignore malformed or inaccessible browser entries.
    }
  }

  return [...ordersById.values()].sort((left, right) => (
    new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  ));
}

function describeItems(order) {
  if (order.items.length) {
    return order.items.map(({ dishId, quantity }) => `${quantity} × ${getDish(dishId)?.name ?? dishId}`).join(", ");
  }
  return getDish(order.dishId)?.name ?? order.dishId ?? "Order items unavailable";
}

export default function LocalBrowserOrders({ serverOrderIds }) {
  const [orders, setOrders] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const serverIds = new Set(serverOrderIds);
  const localOnlyOrders = orders.filter((order) => !serverIds.has(order.id));

  useEffect(() => {
    setOrders(readLocalOrders());
    setLoaded(true);
  }, []);

  return (
    <section className="dashboard-orders" aria-labelledby="browser-orders-heading">
      <div className="section-heading">
        <div>
          <h2 id="browser-orders-heading">Orders saved on this browser</h2>
          <p>Customer order copies in this browser’s local storage</p>
        </div>
      </div>
      {!loaded ? <p role="status">Checking this browser for saved orders…</p> : null}
      {loaded && localOnlyOrders.length ? (
        <div className="order-history" aria-label="Orders saved on this browser">
          {localOnlyOrders.map((order) => (
            <article className="order-row" key={order.id}>
              <div>
                <strong>{order.name}</strong>
                <p>{describeItems(order)} · {etb(order.totalETB)}</p>
                {order.phone ? <p>Phone: {order.phone}</p> : null}
                {order.address ? <p>Delivery location: {order.address}</p> : null}
                <p>Order {order.id}</p>
              </div>
              <div>
                <strong>{order.status}</strong>
                {order.createdAt ? <p>Placed {when(order.createdAt)}</p> : null}
              </div>
            </article>
          ))}
        </div>
      ) : null}
      {loaded && !localOnlyOrders.length ? <p>No extra customer orders were found in this browser’s local storage.</p> : null}
    </section>
  );
}

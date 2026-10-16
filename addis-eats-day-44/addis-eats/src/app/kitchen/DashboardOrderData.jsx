"use client";

import { useEffect, useState } from "react";
import { getDish } from "@/app/menu/data";
import { etb, when } from "@/lib/format";
import OrderHistoryExport from "../Orders/OrderHistoryExport";
import OrderTable from "./OrderTable";
import OrdersLineChart from "./OrdersLineChart";
import RevenueChart from "./RevenueChart";

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
          localStorageCopy: true,
        });
      }
    } catch {
      // Ignore malformed or inaccessible browser entries.
    }
  }
  return [...ordersById.values()];
}

function getNeighborhood(address) {
  const part = String(address || "Unknown").split(",")[0].trim();
  return part ? part.replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Unknown";
}

function dateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function buildOrdersByDay(orders) {
  const counts = new Map();
  const today = new Date();
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
    const key = dateKey(date);
    counts.set(key, {
      date: key,
      label: date.toLocaleDateString("en-ET", { month: "short", day: "numeric" }),
      orders: 0,
    });
  }
  for (const order of orders) {
    const key = dateKey(order.createdAt);
    if (key && counts.has(key)) counts.get(key).orders += 1;
  }
  return [...counts.values()];
}

function buildRevenueByNeighborhood(orders) {
  const totals = new Map();
  for (const order of orders) {
    const neighborhood = getNeighborhood(order.address);
    totals.set(neighborhood, (totals.get(neighborhood) || 0) + Number(order.totalETB || 0));
  }
  return [...totals].map(([neighborhood, revenue]) => ({ neighborhood, revenue }))
    .sort((left, right) => right.revenue - left.revenue || left.neighborhood.localeCompare(right.neighborhood));
}

function describeItems(order) {
  if (order.items?.length) {
    return order.items.map(({ dishId, quantity }) => `${quantity} × ${getDish(dishId)?.name ?? dishId}`).join(", ");
  }
  return getDish(order.dishId)?.name ?? order.dishId ?? "Order items unavailable";
}

function removeLocalOrder(id) {
  for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith("addis_orders:")) continue;
    try {
      const saved = JSON.parse(window.localStorage.getItem(key) || "[]");
      if (!Array.isArray(saved)) continue;
      const remaining = saved.filter((order) => order?.id !== id);
      if (remaining.length !== saved.length) {
        if (remaining.length) window.localStorage.setItem(key, JSON.stringify(remaining));
        else window.localStorage.removeItem(key);
      }
    } catch {
      // Leave malformed entries untouched.
    }
  }
}

function clearLocalOrders() {
  for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
    const key = window.localStorage.key(index);
    if (key?.startsWith("addis_orders:")) window.localStorage.removeItem(key);
  }
}

export default function DashboardOrderData({ serverOrders, searchParams, deleteOrder, deleteAllOrders }) {
  const [orders, setOrders] = useState(serverOrders);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const serverIds = new Set(serverOrders.map((order) => order.id));
    const localOnly = readLocalOrders().filter((order) => !serverIds.has(order.id));
    setOrders([...serverOrders, ...localOnly]);
    setLoaded(true);
  }, [serverOrders]);

  const revenueByNeighborhood = buildRevenueByNeighborhood(orders);
  const ordersByDay = buildOrdersByDay(orders);

  async function clearEverywhereOnThisBrowser() {
    clearLocalOrders();
    setOrders([]);
    await deleteAllOrders();
  }

  function deleteLocalCopy(id) {
    removeLocalOrder(id);
    setOrders((current) => current.filter((order) => order.id !== id));
  }

  return (
    <>
      <section className="dashboard-chart" aria-label="Order overview">
        <p>{loaded ? `${orders.length} total orders` : `${serverOrders.length} server orders`}</p>
        {orders.length ? (
          <details className="delete-all-orders">
            <summary>Clear all orders</summary>
            <p>This removes the {orders.length} server and browser-saved orders visible in this dashboard.</p>
            <button className="danger-button" type="button" onClick={clearEverywhereOnThisBrowser}>Confirm clear all</button>
          </details>
        ) : null}
      </section>

      <RevenueChart data={revenueByNeighborhood} />
      <OrdersLineChart data={ordersByDay} />

      <section className="dashboard-orders" id="orders" aria-labelledby="orders-heading">
        <div className="section-heading">
          <div>
            <h2 id="orders-heading">Orders</h2>
            <p>{loaded ? orders.length : serverOrders.length} total</p>
          </div>
          {orders.length ? <OrderHistoryExport
            rows={orders.map((order) => [order.id, order.name, describeItems(order), etb(order.totalETB), when(order.createdAt)])}
          /> : null}
        </div>
        <OrderTable orders={orders} searchParams={searchParams} />
      </section>

      <section className="kitchen-management" id="order-management" aria-labelledby="kitchen-heading">
        <div className="section-heading"><h2 id="kitchen-heading">Order management</h2><p>Remove an order</p></div>
        <div className="order-history" aria-label="Kitchen order management">
          {orders.length ? orders.map((order) => (
            <article className="order-row" key={order.id}>
              <div>
                <strong>{order.name}</strong>
                <p>{describeItems(order)} · {etb(order.totalETB)}</p>
                {order.phone ? <p>Phone: {order.phone}</p> : null}
                {order.address ? <p>Delivery location: {order.address}</p> : null}
                <p>Order {order.id}</p>
                {order.localStorageCopy ? <p>Saved in this browser · {order.status}</p> : null}
              </div>
              {order.localStorageCopy ? (
                <details className="delete-order">
                  <summary>Delete</summary>
                  <button className="danger-button" type="button" onClick={() => deleteLocalCopy(order.id)}>Remove from this browser</button>
                </details>
              ) : (
                <details className="delete-order">
                  <summary>Delete</summary>
                  <form action={deleteOrder}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <button className="danger-button" type="submit">Confirm delete</button>
                  </form>
                </details>
              )}
            </article>
          )) : <p>{loaded ? "No orders to manage." : "Loading orders…"}</p>}
        </div>
      </section>
    </>
  );
}

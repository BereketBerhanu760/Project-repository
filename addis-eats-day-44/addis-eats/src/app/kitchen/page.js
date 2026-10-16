import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { listOrders } from "@/lib/order-store";
import OrderTable from "./OrderTable";
import RevenueChart from "./RevenueChart";
import OrdersLineChart from "./OrdersLineChart";
import { deleteAllOrders, deleteOrder } from "./actions";
import { getDish } from "@/app/menu/data";
import { etb, when } from "@/lib/format";
import OrderHistoryExport from "../Orders/OrderHistoryExport";
import MenuManagement from "./menu/MenuManagement";
import { listMenuDishes } from "@/lib/menu-store";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Admin dashboard",
  description: "Revenue and order activity for Addis Eats staff.",
  alternates: { canonical: "/kitchen" },
  robots: { index: false, follow: false },
};

function getNeighborhood(address) {
  const firstPart = String(address || "Unknown").split(",")[0].trim();
  return firstPart ? firstPart.replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Unknown";
}

function getDateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function buildOrdersByDay(orders) {
  const counts = new Map();
  const today = new Date();
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
    counts.set(getDateKey(date), { date: getDateKey(date), label: date.toLocaleDateString("en-ET", { month: "short", day: "numeric" }), orders: 0 });
  }
  for (const order of orders) {
    const key = getDateKey(order.createdAt);
    if (key && counts.has(key)) counts.get(key).orders += 1;
  }
  return Array.from(counts.values());
}

function buildRevenueByNeighborhood(orders) {
  const totals = new Map();
  for (const order of orders) {
    const neighborhood = getNeighborhood(order.address);
    totals.set(neighborhood, (totals.get(neighborhood) || 0) + Number(order.totalETB || 0));
  }
  return Array.from(totals, ([neighborhood, revenue]) => ({ neighborhood, revenue }))
    .sort((a, b) => b.revenue - a.revenue || a.neighborhood.localeCompare(b.neighborhood));
}

function getParam(value, fallback) {
  return typeof value === "string" ? value : fallback;
}

export default async function KitchenPage({ searchParams }) {
  const session = await getSession();
  if (!session || session.role !== "staff") notFound();

  const params = await searchParams;
  const demoState = getParam(params?.state, "");
  if (demoState === "error") throw new Error("Dashboard error state preview.");
  if (demoState === "loading") {
    return <main className="main"><section className="simple-panel"><p className="eyebrow">Staff only · Admin</p><h1>Dashboard loading.</h1></section><div className="dashboard-table-skeleton" role="status" aria-label="Loading dashboard"><span className="sr-only">Loading dashboard data…</span>{Array.from({ length: 5 }, (_, index) => <div className="skeleton-row" key={index}><i /><i /><i /><i /></div>)}</div></main>;
  }

  const [orders, menuDishes] = await Promise.all([
    demoState === "empty" ? Promise.resolve([]) : listOrders(),
    listMenuDishes({ includeHidden: true }),
  ]);
  const menuCategories = [...new Set(menuDishes.map((dish) => dish.category))];
  const revenueByNeighborhood = buildRevenueByNeighborhood(orders);
  const ordersByDay = buildOrdersByDay(orders);
  const menuNotice = params?.menuDeleted
    ? "Dish deleted from the customer and admin menus."
    : params?.menuUpdated === "add"
      ? "Dish added to the menu."
      : params?.menuUpdated === "edit"
        ? "Dish updated."
        : "";
  return (
    <main className="main admin-dashboard">
      <section className="simple-panel" id="dashboard-overview">
        <p className="eyebrow">Staff only · Admin</p>
        <h1>Addis Eats dashboard.</h1>
        <p>Signed in as {session.username}. Revenue is grouped by neighborhood; order activity covers the last seven days.</p>
        {!orders.length ? <p role="status">No orders yet. Dashboard sections will fill in when customers place orders.</p> : null}
        {orders.length ? <details className="delete-all-orders"><summary>Clear all orders</summary><p>This permanently deletes all {orders.length} orders and removes them from customer tracking.</p><form action={deleteAllOrders}><button className="danger-button" type="submit">Confirm clear all</button></form></details> : null}
      </section>

      <>
          <RevenueChart data={revenueByNeighborhood} />
          <OrdersLineChart data={ordersByDay} />
          <section className="dashboard-orders" id="orders" aria-labelledby="orders-heading">
            <div className="section-heading">
              <div>
                <h2 id="orders-heading">Orders</h2>
                <p>{orders.length} total</p>
              </div>
              {orders.length ? <OrderHistoryExport
                rows={orders.map((order) => [
                  order.id,
                  order.name,
                  order.items
                    ?.map(
                      ({ dishId, quantity }) =>
                        `${quantity} × ${getDish(dishId)?.name ?? dishId}`,
                    )
                    .join(", ") || order.dishId,
                  etb(order.totalETB),
                  when(order.createdAt),
                ])}
              /> : null}
            </div>
            <OrderTable orders={orders} searchParams={params} />
          </section>
          <section className="kitchen-management" id="order-management" aria-labelledby="kitchen-heading">
            <div className="section-heading"><h2 id="kitchen-heading">Order management</h2><p>Remove an order</p></div>
            <div className="order-history" aria-label="Kitchen order management">
              {orders.length ? orders.map((order) => (
                <article className="order-row" key={order.id}>
                  <div><strong>{order.name}</strong><p>{order.items?.map(({ dishId, quantity }) => `${quantity} × ${dishId}`).join(", ") || order.dishId}</p><p>Order {order.id}</p></div>
                  <details className="delete-order"><summary>Delete</summary><form action={deleteOrder}><input type="hidden" name="orderId" value={order.id} /><button className="danger-button" type="submit">Confirm delete</button></form></details>
                </article>
              )) : <p>No orders to manage.</p>}
            </div>
          </section>
          <MenuManagement
            dishes={menuDishes}
            categories={menuCategories}
            error={params?.menuError || ""}
            notice={menuNotice}
          />
      </>
    </main>
  );
}

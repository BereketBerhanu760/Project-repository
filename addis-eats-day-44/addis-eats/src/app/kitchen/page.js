import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { listOrders } from "@/lib/order-store";
import { deleteAllOrders, deleteOrder } from "./actions";
import MenuManagement from "./menu/MenuManagement";
import { listMenuDishes } from "@/lib/menu-store";
import DashboardOrderData from "./DashboardOrderData";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Admin dashboard",
  description: "Revenue and order activity for Addis Eats staff.",
  alternates: { canonical: "/kitchen" },
  robots: { index: false, follow: false },
};

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
      </section>

      <>
          <DashboardOrderData
            serverOrders={orders}
            searchParams={params}
            deleteOrder={deleteOrder}
            deleteAllOrders={deleteAllOrders}
          />
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

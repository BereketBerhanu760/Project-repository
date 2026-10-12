"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { deleteAllOrders as clearOrderStore, deleteOrderById, updateOrderStatus as saveOrderStatus } from "@/lib/order-store";

const statuses = new Set(["pending", "delivering", "received"]);

export async function updateOrderStatus(formData) {
  try {
    if ((await getSession())?.role !== "staff") return;
    const id = formData.get("orderId");
    const status = formData.get("status");
    if (typeof id !== "string" || !id || !statuses.has(status)) return;
    if (!(await saveOrderStatus(id, status))) return;
    revalidatePath("/kitchen");
    revalidatePath("/Orders");
    revalidatePath(`/Orders/${id}`);
  } catch (error) {
    console.error("updateOrderStatus failed:", error);
  }
}

export async function deleteOrder(formData) {
  try {
    if ((await getSession())?.role !== "staff") return;
    const id = formData.get("orderId");
    if (typeof id !== "string" || !id || !(await deleteOrderById(id))) return;
    revalidatePath("/kitchen");
    revalidatePath("/Orders");
    revalidatePath(`/Orders/${id}`);
  } catch (error) {
    console.error("deleteOrder failed:", error);
  }
}

export async function deleteAllOrders() {
  try {
    if ((await getSession())?.role !== "staff") return;
    if (!(await clearOrderStore())) return;
    revalidatePath("/kitchen");
    revalidatePath("/Orders");
  } catch (error) {
    console.error("deleteAllOrders failed:", error);
  }
}
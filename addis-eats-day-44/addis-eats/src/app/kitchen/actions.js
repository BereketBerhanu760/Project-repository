"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { deleteAllOrders as clearOrderStore, deleteOrderById, updateOrderStatus as saveOrderStatus } from "@/lib/order-store";

const statuses = new Set(["pending", "delivering", "received"]);

export async function updateOrderStatus(formData) {
  if ((await getSession())?.role !== "staff") return;
  const id = formData.get("orderId");
  const status = formData.get("status");
  if (typeof id !== "string" || !id || !statuses.has(status)) return;
  if (!(await saveOrderStatus(id, status))) return;
  revalidatePath("/kitchen");
  revalidatePath("/Orders");
  revalidatePath(`/Orders/${id}`);
}

export async function deleteOrder(formData) {
  if ((await getSession())?.role !== "staff") return;
  const id = formData.get("orderId");
  if (typeof id !== "string" || !id || !(await deleteOrderById(id))) return;
  revalidatePath("/kitchen");
  revalidatePath("/Orders");
  revalidatePath(`/Orders/${id}`);
}

export async function deleteAllOrders() {
  if ((await getSession())?.role !== "staff") return;
  if (!(await clearOrderStore())) return;
  revalidatePath("/kitchen");
  revalidatePath("/Orders");
}
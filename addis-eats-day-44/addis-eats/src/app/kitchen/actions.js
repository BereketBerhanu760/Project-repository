"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import {
  deleteAllOrders as clearOrderStore,
  deleteOrderById,
  updateOrderStatus as saveOrderStatus,
} from "@/lib/order-store";

const orderStatuses = new Set(["pending", "delivering", "received"]);

export async function updateOrderStatus(formData) {
  const session = await getSession();
  if (session?.role !== "staff") return;

  const orderId = formData.get("orderId");
  const status = formData.get("status");
  if (typeof orderId !== "string" || !orderId || !orderStatuses.has(status)) return;

  if (!(await saveOrderStatus(orderId, status))) return;

  revalidatePath("/kitchen");
  revalidatePath("/Orders");
  revalidatePath(`/Orders/${orderId}`);
}

export async function deleteOrder(formData) {
  const session = await getSession();
  if (session?.role !== "staff") return;

  const orderId = formData.get("orderId");
  if (typeof orderId !== "string" || !orderId) return;
  if (!(await deleteOrderById(orderId))) return;

  revalidatePath("/kitchen");
  revalidatePath("/Orders");
  revalidatePath(`/Orders/${orderId}`);
}

export async function deleteAllOrders() {
  const session = await getSession();
  if (session?.role !== "staff") return;
  if (!(await clearOrderStore())) return;

  revalidatePath("/kitchen");
  revalidatePath("/Orders");
}
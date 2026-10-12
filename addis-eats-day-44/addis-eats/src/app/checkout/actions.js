"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { orderSchema, flattenZodErrors } from "@/lib/schema";
import { getCart, saveCart } from "@/lib/cart";
import { removeOrderForOwner, saveOrder } from "@/lib/order-store";
import { getSession } from "@/lib/session";

export async function placeOrder(_previousState, formData) {
  const session = await getSession();
  if (session?.role === "staff") redirect("/kitchen");
  if (session?.role !== "customer") {
    return { status: "error", message: "Sign in with a customer account before ordering.", signInRequired: true, fieldErrors: {} };
  }

  const cart = await getCart();
  if (cart.length === 0) return { status: "error", message: "Add a dish to your cart before checking out.", fieldErrors: {} };

  const result = orderSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    totalETB: cart.reduce((sum, item) => sum + item.subtotal, 0),
    dishId: cart[0].dishId,
  });
  if (!result.success) {
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors: flattenZodErrors(result.error) };
  }

  const order = await saveOrder({
    ...result.data,
    items: cart.map(({ dishId, quantity }) => ({ dishId, quantity })),
    id: crypto.randomUUID(),
    owner: session.id,
    status: "pending",
    createdAt: new Date().toISOString(),
  });
  await saveCart([]);
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/Orders");
  return { status: "success", message: "Order placed successfully.", fieldErrors: {}, orderId: order.id };
}

export async function cancelOrder(orderId) {
  const session = await getSession();
  if (session?.role !== "customer" || !(await removeOrderForOwner(orderId, session.id))) {
    return { status: "error", message: "You cannot cancel this order." };
  }
  revalidatePath("/checkout");
  revalidatePath("/Orders");
  return { status: "success", message: "Order cancelled." };
}
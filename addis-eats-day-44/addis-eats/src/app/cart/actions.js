"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getMenuDish } from "@/lib/menu-store";
import { getCart, saveCart } from "@/lib/cart";
import { getSession } from "@/lib/session";

export async function addToCart(formData) {
  const session = await getSession();
  if (session?.role === "staff") redirect("/kitchen");

  const dishId = formData.get("dishId");
  if (typeof dishId !== "string" || !(await getMenuDish(dishId))) redirect("/menu");
  const cart = await getCart();
  const existing = cart.find((item) => item.dishId === dishId);
  const next = existing
    ? cart.map((item) => item.dishId === dishId
      ? { dishId, quantity: Math.min(10, item.quantity + 1) }
      : { dishId: item.dishId, quantity: item.quantity })
    : [...cart.map(({ dishId: id, quantity }) => ({ dishId: id, quantity })), { dishId, quantity: 1 }];

  await saveCart(next);
  revalidatePath("/cart");
  revalidatePath("/", "layout");
  redirect("/cart");
}

export async function removeFromCart(formData) {
  if ((await getSession())?.role === "staff") redirect("/kitchen");
  const dishId = formData.get("dishId");
  const cart = await getCart();
  await saveCart(cart.filter((item) => item.dishId !== dishId)
    .map(({ dishId: id, quantity }) => ({ dishId: id, quantity })));
  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function updateCartQuantity(formData) {
  if ((await getSession())?.role === "staff") redirect("/kitchen");
  const dishId = formData.get("dishId");
  const delta = Number(formData.get("delta"));
  if (typeof dishId !== "string" || ![-1, 1].includes(delta)) redirect("/cart");

  const cart = await getCart();
  const existing = cart.find((item) => item.dishId === dishId);
  if (!existing) redirect("/cart");
  const nextQuantity = existing.quantity + delta;
  const next = nextQuantity < 1
    ? cart.filter((item) => item.dishId !== dishId)
    : cart.map((item) => item.dishId === dishId
      ? { dishId, quantity: Math.min(10, nextQuantity) }
      : { dishId: item.dishId, quantity: item.quantity });

  await saveCart(next);
  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

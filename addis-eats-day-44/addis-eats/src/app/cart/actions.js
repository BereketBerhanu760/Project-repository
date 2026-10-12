"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDish } from "@/app/menu/data";
import { getCart, saveCart } from "@/lib/cart";
import { getSession } from "@/lib/session";

async function redirectStaffToKitchen() {
  if ((await getSession())?.role === "staff") redirect("/kitchen");
}

export async function addToCart(formData) {
  await redirectStaffToKitchen();
  const dishId = formData.get("dishId");
  const dish = typeof dishId === "string" ? getDish(dishId) : undefined;
  if (!dish) redirect("/menu");

  const cart = await getCart();
  const existingItem = cart.find((item) => item.dishId === dish.id);
  const updatedCart = existingItem
    ? cart.map((item) => item.dishId === dish.id
      ? { dishId, quantity: Math.min(10, item.quantity + 1) }
      : { dishId: item.dishId, quantity: item.quantity })
    : [...cart.map(({ dishId: itemId, quantity }) => ({ dishId: itemId, quantity })), { dishId, quantity: 1 }];

  await saveCart(updatedCart);
  revalidatePath("/cart");
  redirect("/cart");
}

export async function removeFromCart(formData) {
  await redirectStaffToKitchen();
  const dishId = formData.get("dishId");
  const cart = await getCart();
  await saveCart(cart
    .filter((item) => item.dishId !== dishId)
    .map(({ dishId: itemId, quantity }) => ({ dishId: itemId, quantity })));
  revalidatePath("/cart");
}
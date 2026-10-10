"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDish } from "@/app/menu/data";
import { getCart } from "@/lib/cart";
import { isSecureRequest } from "@/lib/session";

const cartCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

async function saveCart(cart) {
  const cookieStore = await cookies();
  if (cart.length === 0) {
    cookieStore.delete("cart");
    return;
  }

  cookieStore.set("cart", JSON.stringify(cart), {
    ...cartCookieOptions,
    secure: await isSecureRequest(),
  });
}

export async function addToCart(formData) {
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
  const dishId = formData.get("dishId");
  const cart = await getCart();
  await saveCart(cart
    .filter((item) => item.dishId !== dishId)
    .map(({ dishId: itemId, quantity }) => ({ dishId: itemId, quantity })));
  revalidatePath("/cart");
}
import "server-only";

import { cookies } from "next/headers";
import { getDish } from "@/app/menu/data";
import { getSession } from "@/lib/session";

const anonymousCartCookie = "cart";
const cartLifetimeSeconds = 60 * 60 * 24 * 7;

function getCartCookieName(session) {
  return session
    ? `cart_${Buffer.from(session.id).toString("base64url")}`
    : anonymousCartCookie;
}

function cartCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: cartLifetimeSeconds,
  };
}

function decodeCart(value) {
  if (!value) return [];

  try {
    const savedItems = JSON.parse(value);
    if (!Array.isArray(savedItems)) return [];

    const quantities = new Map();
    for (const item of savedItems) {
      const dish = getDish(item?.dishId);
      const quantity = Number(item?.quantity);
      if (!dish || !Number.isInteger(quantity) || quantity < 1) continue;
      quantities.set(dish.id, Math.min(10, (quantities.get(dish.id) || 0) + quantity));
    }

    return [...quantities].map(([dishId, quantity]) => ({
      dishId,
      quantity,
      dish: getDish(dishId),
      subtotal: getDish(dishId).price * quantity,
    }));
  } catch {
    return [];
  }
}

export async function getCart() {
  const session = await getSession();
  const value = (await cookies()).get(getCartCookieName(session))?.value;
  return decodeCart(value);
}

export async function saveCart(items) {
  const session = await getSession();
  const cookieStore = await cookies();
  const name = getCartCookieName(session);

  if (items.length === 0) {
    cookieStore.delete(name);
    return;
  }

  cookieStore.set(name, JSON.stringify(items), cartCookieOptions());
}

export async function claimAnonymousCart(userId) {
  const cookieStore = await cookies();
  const anonymousCart = cookieStore.get(anonymousCartCookie)?.value;
  if (!anonymousCart) return;

  const userCartCookie = getCartCookieName({ id: userId });
  if (!cookieStore.get(userCartCookie)?.value) {
    cookieStore.set(userCartCookie, anonymousCart, cartCookieOptions());
  }
  cookieStore.delete(anonymousCartCookie);
}
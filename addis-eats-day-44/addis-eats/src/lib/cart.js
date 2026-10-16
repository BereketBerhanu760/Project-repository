import "server-only";

import { cookies } from "next/headers";
import { getMenuDish } from "@/lib/menu-store";
import { getSession } from "@/lib/session";

const anonymousCartCookie = "cart";
const cartLifetimeSeconds = 60 * 60 * 24 * 7;

function cartCookieName(session) {
  return session ? `cart_${Buffer.from(session.id).toString("base64url")}` : anonymousCartCookie;
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

async function decodeCart(value) {
  try {
    const entries = JSON.parse(value || "[]");
    if (!Array.isArray(entries)) return [];
    const merged = new Map();
    for (const entry of entries) {
      const dish = await getMenuDish(entry?.dishId);
      const quantity = Number(entry?.quantity);
      if (!dish || !Number.isInteger(quantity) || quantity < 1) continue;
      merged.set(dish.id, Math.min(10, (merged.get(dish.id) || 0) + quantity));
    }
    return [...merged].map(([dishId, quantity]) => ({ dishId, quantity }));
  } catch {
    return [];
  }
}

export async function getCart() {
  const session = await getSession();
  if (session?.role === "staff") return [];
  const value = (await cookies()).get(cartCookieName(session))?.value;
  const entries = await decodeCart(value);
  return Promise.all(entries.map(async ({ dishId, quantity }) => {
    const dish = await getMenuDish(dishId);
    return dish ? { dish, dishId, quantity, subtotal: dish.price * quantity } : null;
  })).then((items) => items.filter(Boolean));
}

export async function saveCart(items) {
  const session = await getSession();
  const cookieStore = await cookies();
  if (session?.role === "staff") {
    cookieStore.delete(cartCookieName(session));
    return;
  }
  const name = cartCookieName(session);
  if (!items.length) {
    cookieStore.delete(name);
    return;
  }
  cookieStore.set(name, JSON.stringify(items), cartCookieOptions());
}

export async function claimAnonymousCart(userId) {
  const session = await getSession();
  if (session?.role !== "customer" || session.id !== userId) return;
  const cookieStore = await cookies();
  const anonymous = cookieStore.get(anonymousCartCookie)?.value;
  if (!anonymous) return;
  const userCookie = cartCookieName(session);
  if (!cookieStore.get(userCookie)?.value) cookieStore.set(userCookie, anonymous, cartCookieOptions());
  cookieStore.delete(anonymousCartCookie);
}

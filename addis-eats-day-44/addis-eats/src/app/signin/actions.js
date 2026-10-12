"use server";

import { redirect } from "next/navigation";
import { authenticate } from "@/lib/auth";
import { claimAnonymousCart, saveCart } from "@/lib/cart";
import { getSafeReturnTo } from "@/lib/safe-return-to";
import { clearSession, setSession } from "@/lib/session";

export async function signIn(_previousState, formData) {
  const username = formData.get("username");
  const password = formData.get("password");
  const next = getSafeReturnTo(formData.get("next"));
  const rememberUsername = formData.get("rememberUsername") === "on";

  if (typeof username !== "string" || typeof password !== "string") {
    return { status: "error", message: "Enter your username and password." };
  }

  let user;
  try {
    user = await authenticate(username, password);
  } catch (error) {
    console.error("Sign-in authentication failed:", error);
    return { status: "error", message: "Sign-in is temporarily unavailable. Please try again later." };
  }

  if (!user) return { status: "error", message: "The username or password is incorrect." };

  await setSession(user);
  if (user.role === "staff") {
    await saveCart([]);
    return { status: "success", role: user.role, next: "/kitchen", username: user.username, rememberUsername };
  }

  await claimAnonymousCart(user.id);
  return { status: "success", role: user.role, next, username: user.username, rememberUsername };
}

export async function signOut() {
  await clearSession();
  redirect("/signin");
}
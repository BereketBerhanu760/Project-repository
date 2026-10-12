"use server";

import { redirect } from "next/navigation";
import { authenticate } from "@/lib/auth";
import { clearSession, setSession } from "@/lib/session";
import { claimAnonymousCart, saveCart } from "@/lib/cart";
import { getSafeReturnTo } from "@/lib/safe-return-to";

export async function signIn(_previousState, formData) {
  const username = formData.get("username");
  const password = formData.get("password");
  const returnTo = getSafeReturnTo(formData.get("next"));

  if (typeof username !== "string" || typeof password !== "string") {
    return { message: "Enter your username and password." };
  }

  const user = await authenticate(username, password);
  if (!user) {
    return { message: "The username or password is incorrect." };
  }

  await setSession(user);
  if (user.role === "staff") {
    await saveCart([]);
    redirect("/kitchen");
  }

  await claimAnonymousCart(user.id);
  redirect(returnTo);
}

export async function signOut() {
  await clearSession();
  redirect("/signin");
}

"use server";

import { redirect } from "next/navigation";
import { claimAnonymousCart } from "@/lib/cart";
import { registerCustomer } from "@/lib/auth";
import { setSession } from "@/lib/session";
import { getSafeReturnTo } from "@/lib/safe-return-to";

const usernamePattern = /^[a-z0-9][a-z0-9._-]{2,29}$/i;

export async function signUp(_previousState, formData) {
  const username = formData.get("username");
  const password = formData.get("password");
  const confirmation = formData.get("confirmation");

  if (typeof username !== "string" || typeof password !== "string" || typeof confirmation !== "string") {
    return { message: "Complete all fields to create your account." };
  }

  const normalizedUsername = username.trim().toLowerCase();
  if (!usernamePattern.test(normalizedUsername)) {
    return { message: "Use 3-30 letters, numbers, periods, underscores, or hyphens for your username." };
  }
  if (password.length < 12 || password.length > 128) {
    return { message: "Choose a password between 12 and 128 characters." };
  }
  if (password !== confirmation) {
    return { message: "The passwords do not match." };
  }

  const user = await registerCustomer(normalizedUsername, password);
  if (!user) return { message: "That username is already taken." };

  await setSession(user);
  await claimAnonymousCart(user.id);
  redirect(getSafeReturnTo(formData.get("next")));
}
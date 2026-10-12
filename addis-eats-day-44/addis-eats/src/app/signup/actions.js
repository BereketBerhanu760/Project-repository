"use server";

import { registerCustomer } from "@/lib/auth";
import { claimAnonymousCart } from "@/lib/cart";
import { getSafeReturnTo } from "@/lib/safe-return-to";
import { setSession } from "@/lib/session";

const usernamePattern = /^[a-z0-9][a-z0-9._-]{2,29}$/i;

export async function signUp(_previousState, formData) {
  const username = formData.get("username");
  const password = formData.get("password");
  const confirmation = formData.get("confirmation");
  const next = getSafeReturnTo(formData.get("next"));

  if (typeof username !== "string" || typeof password !== "string" || typeof confirmation !== "string") {
    return { status: "error", message: "Complete all fields to create your account." };
  }

  const normalizedUsername = username.trim().toLowerCase();
  if (!usernamePattern.test(normalizedUsername)) {
    return { status: "error", message: "Use 3-30 letters, numbers, periods, underscores, or hyphens for your username." };
  }
  if (password.length < 12 || password.length > 128) {
    return { status: "error", message: "Choose a password between 12 and 128 characters." };
  }
  if (password !== confirmation) return { status: "error", message: "The passwords do not match." };

  let user;
  try {
    user = await registerCustomer(normalizedUsername, password);
  } catch (error) {
    console.error("Customer registration failed:", error);
    return { status: "error", message: "Account creation is temporarily unavailable. Please try again later." };
  }
  if (!user) return { status: "error", message: "That username is already taken." };

  await setSession(user);
  await claimAnonymousCart(user.id);
  return { status: "success", role: user.role, next, username: user.username };
}
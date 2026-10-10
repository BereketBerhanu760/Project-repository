import "server-only";

import { timingSafeEqual } from "node:crypto";

const developmentUsers = [
  { id: "customer", username: "customer", password: "AddisEatsDemo!42", role: "customer" },
  { id: "staff", username: "staff", password: "KitchenDemo!42", role: "staff" },
];

function getUsers() {
  const configuredUsers = process.env.AUTH_USERS;
  if (!configuredUsers) {
    return process.env.NODE_ENV === "production" ? [] : developmentUsers;
  }

  let users;
  try {
    users = JSON.parse(configuredUsers);
  } catch {
    throw new Error("AUTH_USERS must be a JSON array of configured account records.");
  }

  if (!Array.isArray(users)) {
    throw new Error("AUTH_USERS must be a JSON array of configured account records.");
  }

  return users.map((user) => {
    if (
      typeof user.username !== "string"
      || typeof user.password !== "string"
      || user.password.length < 12
      || !["customer", "staff"].includes(user.role)
    ) {
      throw new Error("Each AUTH_USERS entry requires a username, a 12-character password, and a customer or staff role.");
    }

    const username = user.username.trim().toLowerCase();
    if (!username) throw new Error("AUTH_USERS usernames must not be empty.");

    return {
      id: username,
      username,
      password: user.password,
      role: user.role,
    };
  });
}

function passwordsMatch(candidate, expected) {
  const candidateBytes = Buffer.from(candidate);
  const expectedBytes = Buffer.from(expected);
  return candidateBytes.length === expectedBytes.length
    && timingSafeEqual(candidateBytes, expectedBytes);
}

export function authenticate(username, password) {
  const normalizedUsername = username.trim().toLowerCase();
  const user = getUsers().find((account) => account.username === normalizedUsername);
  if (!user || !passwordsMatch(password, user.password)) return null;

  return { id: user.id, username: user.username, role: user.role };
}

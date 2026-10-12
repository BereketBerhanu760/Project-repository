import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { promisify } from "node:util";
import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { getPersistenceMode, redisCommand } from "@/lib/storage";

const scrypt = promisify(scryptCallback);
const usersKey = "addis-eats:users";
const usersCookieName = "addis_users";
const passwordHashLength = 64;
let pendingWrite = Promise.resolve();

if (!globalThis.__addisEatsUsers) {
  globalThis.__addisEatsUsers = new Map();
}

const developmentUsers = [
  { id: "customer", username: "customer", password: "AddisEatsDemo!42", role: "customer" },
  { id: "staff", username: "staff", password: "KitchenDemo!42", role: "staff" },
];

function getConfiguredUsers() {
  const configuredUsers = process.env.AUTH_USERS;
  if (!configuredUsers) return developmentUsers;

  let users;
  try {
    users = JSON.parse(configuredUsers);
  } catch {
    throw new Error("AUTH_USERS must be a JSON array of account records.");
  }
  if (!Array.isArray(users)) throw new Error("AUTH_USERS must be a JSON array of account records.");

  return users.map((user) => {
    if (
      typeof user.username !== "string"
      || typeof user.password !== "string"
      || user.password.length < 12
      || !["customer", "staff"].includes(user.role)
    ) throw new Error("Each AUTH_USERS account requires a username, a 12-character password, and a customer or staff role.");

    const username = user.username.trim().toLowerCase();
    if (!username) throw new Error("AUTH_USERS usernames must not be empty.");
    return { id: username, username, password: user.password, role: user.role };
  });
}

function passwordsMatch(candidate, expected) {
  const candidateBytes = Buffer.from(candidate);
  const expectedBytes = Buffer.from(expected);
  return candidateBytes.length === expectedBytes.length && timingSafeEqual(candidateBytes, expectedBytes);
}

async function passwordMatches(password, user) {
  if (user.salt && user.passwordHash) {
    const candidate = Buffer.from(await scrypt(password, user.salt, passwordHashLength));
    const expected = Buffer.from(user.passwordHash, "hex");
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  }
  return typeof user.password === "string" && passwordsMatch(password, user.password);
}

function getUserStorePaths() {
  const isServerless = Boolean(
    process.env.VERCEL
    || process.env.AWS_LAMBDA_FUNCTION_NAME
    || process.env.VERCEL_ENV
  );

  if (isServerless) {
    return {
      directory: tmpdir(),
      filePath: join(tmpdir(), "addis_eats_users.json"),
    };
  }

  return {
    directory: join(process.cwd(), ".data"),
    filePath: join(process.cwd(), ".data", "users.json"),
  };
}

async function getCookieUsers() {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const raw = cookieStore.get(usersCookieName)?.value;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function setCookieUsers(users) {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const compact = users.slice(-5);
    cookieStore.set(usersCookieName, JSON.stringify(compact), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  } catch {
    // Non-mutation context
  }
}

async function readLocalUsers() {
  const { filePath } = getUserStorePaths();
  try {
    return JSON.parse(await readFile(/*turbopackIgnore: true*/ filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      try {
        const fallbackPath = join(tmpdir(), "addis_eats_users.json");
        return JSON.parse(await readFile(/*turbopackIgnore: true*/ fallbackPath, "utf8"));
      } catch {
        return [];
      }
    }
    return [];
  }
}

async function writeLocalUsers(users) {
  const { directory, filePath } = getUserStorePaths();
  try {
    await mkdir(directory, { recursive: true });
    const temporaryPath = `${filePath}.${randomUUID()}.tmp`;
    await writeFile(temporaryPath, JSON.stringify(users, null, 2), "utf8");
    await rename(temporaryPath, filePath);
  } catch (error) {
    if (directory !== tmpdir()) {
      try {
        const fallbackPath = join(tmpdir(), "addis_eats_users.json");
        const temporaryPath = `${fallbackPath}.${randomUUID()}.tmp`;
        await writeFile(temporaryPath, JSON.stringify(users, null, 2), "utf8");
        await rename(temporaryPath, fallbackPath);
      } catch (fallbackError) {
        console.warn("User disk write failed:", fallbackError.message);
      }
    } else {
      console.warn("User disk write failed:", error.message);
    }
  }
}

function serialize(operation) {
  const result = pendingWrite.then(operation, operation);
  pendingWrite = result.catch(() => {});
  return result;
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const passwordHash = Buffer.from(await scrypt(password, salt, passwordHashLength)).toString("hex");
  return { salt, passwordHash };
}

export async function authenticate(username, password) {
  const normalizedUsername = username.trim().toLowerCase();
  const configuredUser = getConfiguredUsers().find((user) => user.username === normalizedUsername);
  if (configuredUser) {
    return await passwordMatches(password, configuredUser)
      ? { id: configuredUser.id, username: configuredUser.username, role: configuredUser.role }
      : null;
  }

  // Populate from cookie if available
  const cookieUsers = await getCookieUsers();
  for (const u of cookieUsers) {
    if (u?.username) globalThis.__addisEatsUsers.set(u.username, u);
  }

  if (globalThis.__addisEatsUsers.has(normalizedUsername)) {
    const cachedUser = globalThis.__addisEatsUsers.get(normalizedUsername);
    if (await passwordMatches(password, cachedUser)) {
      return { id: cachedUser.id, username: cachedUser.username, role: cachedUser.role };
    }
  }

  await pendingWrite;
  let user;
  if (getPersistenceMode() === "redis") {
    try {
      const saved = await redisCommand("HGET", usersKey, normalizedUsername);
      user = saved ? JSON.parse(saved) : null;
    } catch {
      user = null;
    }
  }
  if (!user) {
    user = (await readLocalUsers()).find((account) => account.username === normalizedUsername) ?? null;
  }

  if (user) {
    globalThis.__addisEatsUsers.set(normalizedUsername, user);
  }

  if (!user || !(await passwordMatches(password, user))) return null;
  return { id: user.id, username: user.username, role: user.role };
}

export async function registerCustomer(username, password) {
  const normalizedUsername = username.trim().toLowerCase();
  const configuredUsers = getConfiguredUsers();
  if (configuredUsers.some((user) => user.username === normalizedUsername)) return null;
  const credentials = await hashPassword(password);

  return serialize(async () => {
    const user = {
      id: randomUUID(),
      username: normalizedUsername,
      role: "customer",
      ...credentials,
    };

    globalThis.__addisEatsUsers.set(normalizedUsername, user);

    // Save to cookie backup for serverless persistence
    const currentUsers = [...(await readLocalUsers()), ...(await getCookieUsers())];
    const nextUsers = [...currentUsers.filter((u) => u.username !== normalizedUsername), user];
    await setCookieUsers(nextUsers);

    if (getPersistenceMode() === "redis") {
      try {
        const created = await redisCommand("HSETNX", usersKey, normalizedUsername, JSON.stringify(user));
        if (Number(created) === 1) {
          return { id: user.id, username: user.username, role: user.role };
        }
      } catch (err) {
        console.warn("Redis registerCustomer failed:", err.message);
      }
    }

    const localUsers = await readLocalUsers();
    if (localUsers.some((account) => account.username === normalizedUsername)) return null;
    await writeLocalUsers([...localUsers, user]);
    return { id: user.id, username: user.username, role: user.role };
  });
}
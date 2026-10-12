import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";

const scrypt = promisify(scryptCallback);
const userStorePath = join(process.cwd(), ".data", "users.json");
const passwordHashLength = 64;
let pendingWrite = Promise.resolve();

const developmentUsers = [
  { id: "customer", username: "customer", password: "AddisEatsDemo!42", role: "customer" },
  { id: "staff", username: "staff", password: "KitchenDemo!42", role: "staff" },
];

function getConfiguredUsers() {
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

async function passwordMatches(password, user) {
  if (user.salt && user.passwordHash) {
    const candidate = Buffer.from(await scrypt(password, user.salt, passwordHashLength));
    const expected = Buffer.from(user.passwordHash, "hex");
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  }

  return typeof user.password === "string" && passwordsMatch(password, user.password);
}

async function readRegisteredUsers() {
  try {
    return JSON.parse(await readFile(userStorePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

function serialize(operation) {
  const result = pendingWrite.then(operation, operation);
  pendingWrite = result.catch(() => {});
  return result;
}

async function writeRegisteredUsers(users) {
  const directory = join(process.cwd(), ".data");
  await mkdir(directory, { recursive: true });
  const temporaryPath = `${userStorePath}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(users, null, 2), "utf8");
  await rename(temporaryPath, userStorePath);
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const passwordHash = Buffer.from(await scrypt(password, salt, passwordHashLength)).toString("hex");
  return { salt, passwordHash };
}

export async function authenticate(username, password) {
  const normalizedUsername = username.trim().toLowerCase();
  await pendingWrite;
  const users = [...getConfiguredUsers(), ...(await readRegisteredUsers())];
  const user = users.find((account) => account.username === normalizedUsername);
  if (!user || !(await passwordMatches(password, user))) return null;

  return { id: user.id, username: user.username, role: user.role };
}

export async function registerCustomer(username, password) {
  const normalizedUsername = username.trim().toLowerCase();
  const credentials = await hashPassword(password);

  return serialize(async () => {
    const configuredUsers = getConfiguredUsers();
    const registeredUsers = await readRegisteredUsers();
    const usernameTaken = [...configuredUsers, ...registeredUsers]
      .some((user) => user.username === normalizedUsername);
    if (usernameTaken) return null;

    const user = {
      id: randomUUID(),
      username: normalizedUsername,
      role: "customer",
      ...credentials,
    };
    await writeRegisteredUsers([...registeredUsers, user]);
    return { id: user.id, username: user.username, role: user.role };
  });
}

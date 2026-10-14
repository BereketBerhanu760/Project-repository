import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { getPersistenceMode, redisCommand } from "@/lib/storage";

const ordersKey = "addis-eats:orders";
let pendingWrite = Promise.resolve();

// Maintain an in-memory cache on globalThis for serverless resilience
if (!globalThis.__addisEatsOrders) {
  globalThis.__addisEatsOrders = new Map();
}

function getStorePaths() {
  const isServerless = Boolean(
    process.env.VERCEL
    || process.env.AWS_LAMBDA_FUNCTION_NAME
    || process.env.VERCEL_ENV
  );

  if (isServerless) {
    return {
      directory: tmpdir(),
      filePath: join(tmpdir(), "addis_eats_orders.json"),
    };
  }

  return {
    directory: join(process.cwd(), ".data"),
    filePath: join(process.cwd(), ".data", "orders.json"),
  };
}

async function readLocalOrders() {
  const { filePath } = getStorePaths();
  try {
    return JSON.parse(await readFile(/*turbopackIgnore: true*/ filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      try {
        const fallbackPath = join(tmpdir(), "addis_eats_orders.json");
        return JSON.parse(await readFile(/*turbopackIgnore: true*/ fallbackPath, "utf8"));
      } catch {
        return [];
      }
    }
    return [];
  }
}

async function readRedisOrders() {
  try {
    const result = await redisCommand("HGETALL", ordersKey);
    if (!result) return [];
    let values;
    if (Array.isArray(result)) {
      values = result.length && Array.isArray(result[0])
        ? result.map((entry) => entry[1])
        : result.length % 2 === 0
          ? result.filter((_value, index) => index % 2 === 1)
          : result;
    } else if (typeof result === "object") {
      values = Object.values(result);
    } else {
      return [];
    }
    return values.map((value) => typeof value === "string" ? JSON.parse(value) : value);
  } catch (error) {
    console.warn("Failed to read from Redis, using local/in-memory orders:", error.message);
    return [];
  }
}

async function readOrders() {
  const inMemoryOrders = Array.from(globalThis.__addisEatsOrders.values());
  let persisted = [];

  try {
    if (getPersistenceMode() === "redis") {
      persisted = await readRedisOrders();
    } else {
      persisted = await readLocalOrders();
    }
  } catch (error) {
    console.warn("readOrders persistence error:", error.message);
  }

  // Merge disk/Redis and in-memory orders (newest wins by id)
  const map = new Map();
  for (const order of persisted) {
    if (order?.id) map.set(order.id, order);
  }
  if (getPersistenceMode() !== "redis" || !persisted.length) {
    for (const order of inMemoryOrders) {
      if (order?.id) map.set(order.id, order);
    }
  }

  const all = Array.from(map.values());
  for (const order of all) {
    globalThis.__addisEatsOrders.set(order.id, order);
  }
  return all;
}

async function readOrder(id) {
  if (getPersistenceMode() === "redis") {
    try {
      const value = await redisCommand("HGET", ordersKey, id);
      if (!value) {
        globalThis.__addisEatsOrders.delete(id);
        return null;
      }
      const order = typeof value === "string" ? JSON.parse(value) : value;
      globalThis.__addisEatsOrders.set(id, order);
      return order;
    } catch (error) {
      console.warn("Failed to read order from Redis:", error.message);
      return globalThis.__addisEatsOrders.get(id) ?? null;
    }
  }
  if (globalThis.__addisEatsOrders.has(id)) {
    return globalThis.__addisEatsOrders.get(id);
  }

  const all = await readOrders();
  return all.find((order) => order.id === id) ?? null;
}

async function writeLocalOrders(orders) {
  const { directory, filePath } = getStorePaths();

  try {
    await mkdir(directory, { recursive: true });
    const temporaryPath = `${filePath}.${crypto.randomUUID()}.tmp`;
    await writeFile(temporaryPath, JSON.stringify(orders, null, 2), "utf8");
    await rename(temporaryPath, filePath);
  } catch (error) {
    if (directory !== tmpdir()) {
      try {
        const fallbackDir = tmpdir();
        const fallbackPath = join(fallbackDir, "addis_eats_orders.json");
        const temporaryPath = `${fallbackPath}.${crypto.randomUUID()}.tmp`;
        await writeFile(temporaryPath, JSON.stringify(orders, null, 2), "utf8");
        await rename(temporaryPath, fallbackPath);
      } catch (fallbackError) {
        console.warn("Local orders disk write failed (retained in memory/cookie):", fallbackError.message);
      }
    } else {
      console.warn("Local orders disk write failed (retained in memory/cookie):", error.message);
    }
  }
}

function serialize(operation) {
  const result = pendingWrite.then(operation, operation);
  pendingWrite = result.catch(() => {});
  return result;
}

export function saveOrder(order) {
  return serialize(async () => {
    // 1. In-memory
    globalThis.__addisEatsOrders.set(order.id, order);

    // 2. Persistent disk or Redis store
    const all = await readOrders();
    const updated = [...all.filter((item) => item.id !== order.id), order];

    try {
      if (getPersistenceMode() === "redis") {
        await redisCommand("HSET", ordersKey, order.id, JSON.stringify(order));
      } else {
        await writeLocalOrders(updated);
      }
    } catch (error) {
      console.warn("saveOrder persistence write failed (order safe in memory/cookie):", error.message);
    }

    return order;
  });
}

export async function listOrdersForOwner(owner) {
  await pendingWrite;
  return (await readOrders()).filter((order) => order.owner === owner);
}

export async function listOrders() {
  await pendingWrite;
  return readOrders();
}

export async function getOrderForOwner(id, owner) {
  await pendingWrite;
  const order = await readOrder(id);
  return order?.owner === owner ? order : null;
}

export async function getOrderById(id) {
  await pendingWrite;
  return readOrder(id);
}

export function updateCourierPosition(id, courierPos, status) {
  return serialize(async () => {
    const order = await readOrder(id);
    if (!order) return false;
    order.courierPos = { lat: courierPos.lat, lng: courierPos.lng };
    if (status) order.status = status;
    order.updatedAt = new Date().toISOString();
    globalThis.__addisEatsOrders.set(id, order);

    try {
      if (getPersistenceMode() === "redis") {
        await redisCommand("HSET", ordersKey, id, JSON.stringify(order));
      } else {
        const all = await readOrders();
        const updated = all.map((item) => item.id === id ? order : item);
        await writeLocalOrders(updated);
      }
    } catch (error) {
      console.warn("updateCourierPosition persistence failed:", error.message);
    }
    return true;
  });
}

export function deleteOrderById(id) {
  return serialize(async () => {
    globalThis.__addisEatsOrders.delete(id);
    const all = await readOrders();
    const remaining = all.filter((order) => order.id !== id);

    try {
      if (getPersistenceMode() === "redis") {
        return Number(await redisCommand("HDEL", ordersKey, id)) > 0;
      }
      await writeLocalOrders(remaining);
      return true;
    } catch (error) {
      console.warn("deleteOrderById persistence failed:", error.message);
      return true;
    }
  });
}

export function deleteAllOrders() {
  return serialize(async () => {
    const count = globalThis.__addisEatsOrders.size;
    globalThis.__addisEatsOrders.clear();

    try {
      if (getPersistenceMode() === "redis") {
        const redisCount = Number(await redisCommand("HLEN", ordersKey));
        if (redisCount > 0) await redisCommand("DEL", ordersKey);
        return redisCount || count;
      }
      await writeLocalOrders([]);
      return count;
    } catch (error) {
      console.warn("deleteAllOrders persistence failed:", error.message);
      return count;
    }
  });
}

export function removeOrderForOwner(id, owner) {
  return serialize(async () => {
    const order = await readOrder(id);
    if (order?.owner !== owner) return false;

    globalThis.__addisEatsOrders.delete(id);
    const all = await readOrders();
    const remaining = all.filter((item) => item.id !== id);

    try {
      if (getPersistenceMode() === "redis") {
        return Number(await redisCommand("HDEL", ordersKey, id)) > 0;
      }
      await writeLocalOrders(remaining);
      return true;
    } catch (error) {
      console.warn("removeOrderForOwner persistence failed:", error.message);
      return true;
    }
  });
}

import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getPersistenceMode, redisCommand } from "@/lib/storage";

const storeDirectory = join(process.cwd(), ".data");
const storePath = join(storeDirectory, "orders.json");
const ordersKey = "addis-eats:orders";
let pendingWrite = Promise.resolve();

async function readLocalOrders() {
  try {
    return JSON.parse(await readFile(storePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function readRedisOrders() {
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
}

async function readOrders() {
  return getPersistenceMode() === "redis" ? readRedisOrders() : readLocalOrders();
}

async function readOrder(id) {
  if (getPersistenceMode() === "redis") {
    const value = await redisCommand("HGET", ordersKey, id);
    return value ? JSON.parse(value) : null;
  }
  return (await readLocalOrders()).find((order) => order.id === id) ?? null;
}

async function writeLocalOrders(orders) {
  await mkdir(storeDirectory, { recursive: true });
  const temporaryPath = `${storePath}.${crypto.randomUUID()}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(orders, null, 2), "utf8");
  await rename(temporaryPath, storePath);
}

function serialize(operation) {
  const result = pendingWrite.then(operation, operation);
  pendingWrite = result.catch(() => {});
  return result;
}

export function saveOrder(order) {
  return serialize(async () => {
    if (getPersistenceMode() === "redis") {
      await redisCommand("HSET", ordersKey, order.id, JSON.stringify(order));
    } else {
      await writeLocalOrders([...(await readLocalOrders()), order]);
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

export function updateOrderStatus(id, status) {
  return serialize(async () => {
    const order = await readOrder(id);
    if (!order) return false;
    order.status = status;
    if (getPersistenceMode() === "redis") {
      await redisCommand("HSET", ordersKey, id, JSON.stringify(order));
    } else {
      const orders = await readLocalOrders();
      await writeLocalOrders(orders.map((item) => item.id === id ? order : item));
    }
    return true;
  });
}

export function deleteOrderById(id) {
  return serialize(async () => {
    if (getPersistenceMode() === "redis") return Number(await redisCommand("HDEL", ordersKey, id)) > 0;
    const orders = await readLocalOrders();
    const remaining = orders.filter((order) => order.id !== id);
    if (remaining.length === orders.length) return false;
    await writeLocalOrders(remaining);
    return true;
  });
}

export function deleteAllOrders() {
  return serialize(async () => {
    if (getPersistenceMode() === "redis") {
      const count = Number(await redisCommand("HLEN", ordersKey));
      if (count === 0) return 0;
      await redisCommand("DEL", ordersKey);
      return count;
    }
    const orders = await readLocalOrders();
    if (orders.length === 0) return 0;
    await writeLocalOrders([]);
    return orders.length;
  });
}

export function removeOrderForOwner(id, owner) {
  return serialize(async () => {
    const order = await readOrder(id);
    if (order?.owner !== owner) return false;
    if (getPersistenceMode() === "redis") return Number(await redisCommand("HDEL", ordersKey, id)) > 0;
    await writeLocalOrders((await readLocalOrders()).filter((item) => item.id !== id));
    return true;
  });
}
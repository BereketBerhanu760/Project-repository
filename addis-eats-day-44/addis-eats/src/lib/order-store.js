import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

const storeDirectory = join(process.cwd(), ".data");
const storePath = join(storeDirectory, "orders.json");
let pendingWrite = Promise.resolve();

async function readOrders() {
  try {
    return JSON.parse(await readFile(storePath, "utf8"));
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

async function writeOrders(orders) {
  await mkdir(storeDirectory, { recursive: true });
  const temporaryPath = `${storePath}.${crypto.randomUUID()}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(orders, null, 2), "utf8");
  await rename(temporaryPath, storePath);
}

export function saveOrder(order) {
  return serialize(async () => {
    const orders = await readOrders();
    orders.push(order);
    await writeOrders(orders);
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
  return (await readOrders()).find((order) => order.id === id && order.owner === owner) ?? null;
}

export async function getOrderById(id) {
  await pendingWrite;
  return (await readOrders()).find((order) => order.id === id) ?? null;
}

export function updateOrderStatus(id, status) {
  return serialize(async () => {
    const orders = await readOrders();
    const order = orders.find((item) => item.id === id);
    if (!order) return false;

    order.status = status;
    await writeOrders(orders);
    return true;
  });
}

export function deleteOrderById(id) {
  return serialize(async () => {
    const orders = await readOrders();
    const remainingOrders = orders.filter((order) => order.id !== id);
    if (remainingOrders.length === orders.length) return false;

    await writeOrders(remainingOrders);
    return true;
  });
}

export function deleteAllOrders() {
  return serialize(async () => {
    const orders = await readOrders();
    if (orders.length === 0) return 0;

    await writeOrders([]);
    return orders.length;
  });
}

export function removeOrderForOwner(id, owner) {
  return serialize(async () => {
    const orders = await readOrders();
    const index = orders.findIndex((order) => order.id === id && order.owner === owner);
    if (index === -1) return false;
    orders.splice(index, 1);
    await writeOrders(orders);
    return true;
  });
}
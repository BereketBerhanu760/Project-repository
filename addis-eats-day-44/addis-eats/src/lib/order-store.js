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
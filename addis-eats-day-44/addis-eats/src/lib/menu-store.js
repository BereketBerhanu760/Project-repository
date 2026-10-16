import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createDishPage, dishes as seedDishes, slugify } from "@/app/menu/data";
import { getPersistenceMode, redisCommand } from "@/lib/storage";

const menuKey = "addis-eats:menu";
let pendingWrite = Promise.resolve();

function getFilePath() {
  const directory = process.env.VERCEL || process.env.VERCEL_ENV
    ? tmpdir()
    : join(process.cwd(), ".data");
  return { directory, filePath: join(directory, "addis_eats_menu.json") };
}

function normalizeCatalog(items) {
  if (!Array.isArray(items)) return null;
  const valid = items.filter((dish) => (
    dish && typeof dish.id === "string" && typeof dish.name === "string"
    && typeof dish.category === "string" && Number.isFinite(Number(dish.price))
    && typeof dish.image === "string" && typeof dish.description === "string"
  ));
  return valid.map((dish) => ({
    ...dish,
    id: dish.id,
    legacyId: typeof dish.legacyId === "string" ? dish.legacyId : undefined,
    name: dish.name.trim(),
    category: dish.category.trim().toLowerCase(),
    price: Number(dish.price),
    visible: dish.visible !== false,
    imageAlt: typeof dish.imageAlt === "string" && dish.imageAlt.trim() ? dish.imageAlt.trim() : dish.name.trim(),
    imageWidth: Number.isInteger(dish.imageWidth) && dish.imageWidth > 0 ? dish.imageWidth : 1200,
    imageHeight: Number.isInteger(dish.imageHeight) && dish.imageHeight > 0 ? dish.imageHeight : 900,
    ingredients: Array.isArray(dish.ingredients) ? dish.ingredients.filter((item) => typeof item === "string") : [],
  }));
}

async function readFileCatalog() {
  const { filePath } = getFilePath();
  try {
    return normalizeCatalog(JSON.parse(await readFile(filePath, "utf8")));
  } catch {
    return null;
  }
}

export async function listMenuDishes({ includeHidden = false } = {}) {
  let catalog = null;
  if (getPersistenceMode() === "redis") {
    try {
      const saved = await redisCommand("GET", menuKey);
      if (saved) catalog = normalizeCatalog(typeof saved === "string" ? JSON.parse(saved) : saved);
    } catch (error) {
      console.warn("Menu Redis read failed; trying local menu data:", error.message);
    }
  }
  if (!catalog) catalog = await readFileCatalog();
  if (!catalog) catalog = seedDishes.map((dish) => ({ ...dish, visible: true }));
  return includeHidden ? catalog : catalog.filter((dish) => dish.visible !== false);
}

export async function getMenuDish(id, { includeHidden = false } = {}) {
  const catalog = await listMenuDishes({ includeHidden });
  return catalog.find((dish) => dish.id === id || dish.legacyId === id) ?? null;
}

export async function getMenuDishPage(options = {}) {
  return createDishPage(await listMenuDishes(), options);
}

export async function getMenuCategories() {
  return [...new Set((await listMenuDishes()).map((dish) => dish.category))];
}

async function writeFileCatalog(catalog) {
  const { directory, filePath } = getFilePath();
  await mkdir(directory, { recursive: true });
  const temporaryPath = `${filePath}.${crypto.randomUUID()}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(catalog, null, 2), "utf8");
  await rename(temporaryPath, filePath);
}

function serialize(operation) {
  const result = pendingWrite.then(operation, operation);
  pendingWrite = result.catch(() => {});
  return result;
}

export function saveMenuDish(values) {
  return serialize(async () => {
    const catalog = await listMenuDishes({ includeHidden: true });
    const index = values.id ? catalog.findIndex((dish) => dish.id === values.id) : -1;
    if (values.id && index < 0) return null;

    let id = values.id;
    if (!id) {
      const base = slugify(values.name) || "dish";
      id = base;
      let suffix = 2;
      while (catalog.some((dish) => dish.id === id)) id = `${base}-${suffix++}`;
    }

    const previous = index >= 0 ? catalog[index] : {};
    const dish = {
      ...previous,
      id,
      name: values.name,
      category: values.category,
      price: values.price,
      image: values.image,
      imageAlt: values.imageAlt || values.name,
      description: values.description,
      ingredients: values.ingredients,
      imageWidth: previous.imageWidth || 1200,
      imageHeight: previous.imageHeight || 900,
      tag: previous.tag ?? null,
      spicy: previous.spicy ?? false,
      visible: previous.visible !== false,
    };
    const nextCatalog = index >= 0
      ? catalog.map((item, itemIndex) => itemIndex === index ? dish : item)
      : [...catalog, dish];
    await persistCatalog(nextCatalog);
    return dish;
  });
}

export function setMenuDishVisibility(id, visible) {
  return serialize(async () => {
    const catalog = await listMenuDishes({ includeHidden: true });
    if (!catalog.some((dish) => dish.id === id)) return false;
    await persistCatalog(catalog.map((dish) => dish.id === id ? { ...dish, visible } : dish));
    return true;
  });
}

export function deleteMenuDish(id) {
  return serialize(async () => {
    const catalog = await listMenuDishes({ includeHidden: true });
    const nextCatalog = catalog.filter((dish) => dish.id !== id);
    if (nextCatalog.length === catalog.length) return false;
    await persistCatalog(nextCatalog);
    return true;
  });
}

async function persistCatalog(catalog) {
  if (getPersistenceMode() === "redis") {
    await redisCommand("SET", menuKey, JSON.stringify(catalog));
    return;
  }
  await writeFileCatalog(catalog);
}

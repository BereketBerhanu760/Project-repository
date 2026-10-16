"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { deleteMenuDish, saveMenuDish, setMenuDishVisibility } from "@/lib/menu-store";

async function requireStaff() {
  const session = await getSession();
  if (session?.role !== "staff") redirect("/signin?next=%2Fkitchen");
}

function getDishFormValues(formData) {
  const id = String(formData.get("dishId") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "").trim().toLowerCase();
  const price = Number(formData.get("price"));
  const rawImage = String(formData.get("image") || "").trim();
  const image = rawImage.replace(/^\/assets\//, "/images/");
  const description = String(formData.get("description") || "").trim();
  const ingredients = String(formData.get("ingredients") || "")
    .split(",")
    .map((ingredient) => ingredient.trim())
    .filter(Boolean);

  if (!name || name.length > 80) return { error: "Enter a dish name up to 80 characters." };
  if (!category || category.length > 32 || !/^[a-z0-9 -]+$/.test(category)) return { error: "Choose a valid category." };
  if (!Number.isFinite(price) || price <= 0 || price > 100000) return { error: "Enter a price above 0 and no more than 100,000 ETB." };
  if (!/^\/images\/[A-Za-z0-9._/-]+$/.test(image) || image.includes("..")) return { error: "Use an image path under /images, such as /images/doro_wat.jpg." };
  if (!description || description.length > 500) return { error: "Enter a description up to 500 characters." };
  if (ingredients.some((ingredient) => ingredient.length > 80) || ingredients.length > 30) return { error: "Use up to 30 ingredients, each up to 80 characters." };

  return { values: { id, name, category, price, image, imageAlt: name, description, ingredients } };
}

function refreshMenuPages(dishId) {
  revalidatePath("/", "layout");
  revalidatePath("/menu");
  revalidatePath("/menu/[id]", "page");
  revalidatePath("/api/dishes");
  revalidatePath("/api/dishes/[id]", "page");
  revalidatePath("/sitemap.xml");
  revalidatePath("/kitchen");
  if (dishId) revalidatePath(`/menu/${encodeURIComponent(dishId)}`);
}

export async function saveDish(formData) {
  await requireStaff();
  const result = getDishFormValues(formData);
  if (result.error) redirect(`/kitchen?menuError=${encodeURIComponent(result.error)}#menu-management`);
  const dish = await saveMenuDish(result.values);
  if (!dish) redirect(`/kitchen?menuError=${encodeURIComponent("That dish could not be found. Refresh and try again.")}#menu-management`);
  refreshMenuPages(dish.id);
  redirect(`/kitchen?menuUpdated=${result.values.id ? "edit" : "add"}#menu-management`);
}

export async function toggleDishVisibility(formData) {
  await requireStaff();
  const id = String(formData.get("dishId") || "");
  if (!id) redirect("/kitchen#menu-management");
  const visible = formData.get("visible") === "true";
  if (!(await setMenuDishVisibility(id, visible))) redirect("/kitchen#menu-management");
  refreshMenuPages(id);
  redirect("/kitchen#menu-management");
}

export async function removeDish(formData) {
  await requireStaff();
  const id = String(formData.get("dishId") || "");
  if (!id || !(await deleteMenuDish(id))) redirect("/kitchen#menu-management");
  refreshMenuPages(id);
  redirect("/kitchen?menuDeleted=1#menu-management");
}

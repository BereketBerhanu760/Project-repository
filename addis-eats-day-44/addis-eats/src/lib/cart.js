import { cookies } from "next/headers";
import { getDish } from "@/app/menu/data";

export async function getCart() {
  const value = (await cookies()).get("cart")?.value;
  if (!value) return [];

  try {
    const savedItems = JSON.parse(value);
    if (!Array.isArray(savedItems)) return [];

    const quantities = new Map();
    for (const item of savedItems) {
      const dish = getDish(item?.dishId);
      const quantity = Number(item?.quantity);
      if (!dish || !Number.isInteger(quantity) || quantity < 1) continue;
      quantities.set(dish.id, Math.min(10, (quantities.get(dish.id) || 0) + quantity));
    }

    return [...quantities].map(([dishId, quantity]) => ({
      dishId,
      quantity,
      dish: getDish(dishId),
      subtotal: getDish(dishId).price * quantity,
    }));
  } catch {
    return [];
  }
}
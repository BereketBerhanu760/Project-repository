import sourceDishes from "./dishes.json";

export function slugify(name) {
  return name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function dishSlug(dish) {
  // Keep the established customer-facing spelling for this menu item.
  if (dish.name.toLowerCase() === "doro wat") return "doro-wot";
  return slugify(dish.name);
}

// The supplied catalog refers to /assets; the project stores these files in /images.
export const dishes = sourceDishes.map((dish) => ({
  ...dish,
  legacyId: dish.id,
  id: dishSlug(dish),
  image: dish.image.replace(/^\/assets\//, "/images/"),
  ...({
    "cheese_burger.jpg": { imageWidth: 1200, imageHeight: 1200 },
    "beef_burger.jpg": { imageWidth: 1500, imageHeight: 1125 },
    "double_bacon_burger.jpg": { imageWidth: 554, imageHeight: 554 },
    "pizza.jpg": { imageWidth: 554, imageHeight: 554 },
    "pepperoni_pizza.jpg": { imageWidth: 447, imageHeight: 447 },
    "veggie_pizza.jpg": { imageWidth: 554, imageHeight: 554 },
    "doro_wat.jpg": { imageWidth: 1024, imageHeight: 732 },
    "beyaynetu.jpg": { imageWidth: 2048, imageHeight: 1536 },
    "tibs.jpg": { imageWidth: 500, imageHeight: 500 },
    "shiro_wat.jpg": { imageWidth: 1200, imageHeight: 1200 },
    "misir_wat.jpg": { imageWidth: 447, imageHeight: 447 },
    "siga_kurt.jpg": { imageWidth: 1000, imageHeight: 1000 },
    "shekla_tibs.jpg": { imageWidth: 447, imageHeight: 447 },
    "kitfo.jpg": { imageWidth: 619, imageHeight: 495 },
    "fries.jpg": { imageWidth: 960, imageHeight: 960 },
    "garlic_bread.jpg": { imageWidth: 640, imageHeight: 480 },
    "orange_juice.jpg": { imageWidth: 1024, imageHeight: 768 },
    "coca_cola.jpg": { imageWidth: 1125, imageHeight: 1125 },
    "sprite.jpg": { imageWidth: 5594, imageHeight: 3937 },
    "macchiato.jpg": { imageWidth: 678, imageHeight: 452 },
  }[dish.image.split("/").at(-1)] || { imageWidth: 1200, imageHeight: 900 }),
}));

export const DISHES_PER_PAGE = 6;

export const menuCategories = [
  ...new Set(dishes.map((dish) => dish.category)),
];

export function getDish(id) {
  return dishes.find((dish) => dish.id === id || dish.legacyId === id);
}

export function createDishPage(menuDishes, {
  category = "all",
  query = "",
  page = 1,
  favoritesOnly = false,
  favoriteIds = [],
} = {}) {
  const normalizedCategory = category.toLowerCase();
  const normalizedQuery = query.trim().toLowerCase();
  const favoriteSet = new Set(favoriteIds.map((id) => {
    return menuDishes.find((dish) => dish.legacyId === id)?.id || id;
  }));
  const matchingDishes = menuDishes.filter((dish) => {
    const categoryMatches = normalizedCategory === "all"
      || dish.category.toLowerCase() === normalizedCategory;
    const queryMatches = !normalizedQuery
      || [dish.name, dish.category, dish.description, dish.tag || "", ...dish.ingredients]
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    const favoriteMatches = !favoritesOnly || favoriteSet.has(dish.id);
    return categoryMatches && queryMatches && favoriteMatches;
  });
  const totalPages = Math.max(1, Math.ceil(matchingDishes.length / DISHES_PER_PAGE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * DISHES_PER_PAGE;

  return {
    dishes: matchingDishes.slice(start, start + DISHES_PER_PAGE),
    page: currentPage,
    pageSize: DISHES_PER_PAGE,
    total: matchingDishes.length,
    totalPages,
  };
}

export function getDishPage(options = {}) {
  return createDishPage(dishes, options);
}

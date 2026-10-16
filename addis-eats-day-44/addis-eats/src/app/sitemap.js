import { SITE_URL } from "@/lib/site-url";
import { listMenuDishes } from "@/lib/menu-store";

export default async function sitemap() {
  const dishes = await listMenuDishes();
  const routes = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/menu", changeFrequency: "daily", priority: 0.9 },
    ...dishes.map((dish) => ({
      path: `/menu/${dish.id}`,
      changeFrequency: "weekly",
      priority: 0.8,
    })),
  ];

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: new URL(path, SITE_URL).toString(),
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}

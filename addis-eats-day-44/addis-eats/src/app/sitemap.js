import { dishes } from "./menu/data";
import { SITE_URL } from "@/lib/site-url";

export default function sitemap() {
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

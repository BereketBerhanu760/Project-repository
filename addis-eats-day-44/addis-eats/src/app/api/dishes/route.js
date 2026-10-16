import { getMenuDishPage } from "@/lib/menu-store";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const requestedPage = Number.parseInt(params.get("page") || "1", 10);
  const page = Number.isInteger(requestedPage) ? Math.max(1, requestedPage) : 1;
  const category = params.get("category") || "all";
  const query = params.get("q") || "";
  const favoritesOnly = params.get("favorites") === "1";
  const favoriteIds = (params.get("favoriteIds") || "").split(",").filter(Boolean);

  return Response.json(await getMenuDishPage({ category, query, page, favoritesOnly, favoriteIds }));
}

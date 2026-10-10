import { getDishPage } from "@/app/menu/data";

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const requestedPage = Number.parseInt(params.get("page") || "1", 10);
  const page = Number.isInteger(requestedPage) ? Math.max(1, requestedPage) : 1;
  const category = params.get("category") || "all";
  const query = params.get("q") || "";

  return Response.json(getDishPage({ category, query, page }));
}

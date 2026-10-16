import { getMenuDish } from "@/lib/menu-store";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  const { id } = await params;
  const dish = await getMenuDish(id);

  if (!dish) {
    return Response.json(
      {
        error: "Dish not found.",
        status: 404,
      },
      { status: 404 }
    );
  }

  return Response.json({ dish });
}

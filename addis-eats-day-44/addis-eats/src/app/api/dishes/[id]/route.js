import { dishes } from "@/app/menu/data";

export async function GET(_request, { params }) {
  const { id } = await params;
  const dish = dishes.find((item) => item.id === id);

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

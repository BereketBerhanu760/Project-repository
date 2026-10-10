import { getOrderForOwner } from "@/lib/order-store";
import { getSession } from "@/lib/session";

export async function GET(_request, { params }) {
  const { id } = await params;
  const session = await getSession();
  const order = session ? await getOrderForOwner(id, session.id) : null;

  if (!order) {
    return Response.json(
      { error: "Order not found.", status: 404 },
      { status: 404 }
    );
  }

  return Response.json({
    order: {
      id: order.id,
      status: order.status || "Received",
      createdAt: order.createdAt,
    },
  });
}

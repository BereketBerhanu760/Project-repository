import { getOrderById, getOrderForOwner } from "@/lib/order-store";
import { getSession } from "@/lib/session";

export async function GET(_request, { params }) {
  const { id } = await params;
  const session = await getSession();
  const order = !session
    ? null
    : session.role === "staff"
      ? await getOrderById(id)
      : await getOrderForOwner(id, session.id);

  if (!order) return Response.json({ error: "Order not found.", status: 404 }, { status: 404 });
  return Response.json({
    order: { id: order.id, status: order.status || "pending", createdAt: order.createdAt },
  });
}
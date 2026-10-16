import { orderSchema, flattenZodErrors } from "@/lib/schema";
import { getMenuDish } from "@/lib/menu-store";
import { saveOrder } from "@/lib/order-store";
import { getSession } from "@/lib/session";

export async function POST(request) {
  const session = await getSession();
  if (!session) return Response.json({ message: "Sign in before placing an order." }, { status: 401 });
  if (session.role !== "customer") return Response.json({ message: "Only customer accounts can place orders." }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Request body must be valid JSON." }, { status: 400 });
  }

  const result = orderSchema.safeParse(body);
  if (!result.success) {
    return Response.json({
      message: "Invalid order payload.",
      errors: flattenZodErrors(result.error),
    }, { status: 422 });
  }
  if (!(await getMenuDish(result.data.dishId))) {
    return Response.json({ message: "Invalid order payload.", errors: { dishId: "This dish is not on the menu." } }, { status: 422 });
  }

  const order = await saveOrder({
    ...result.data,
    owner: session.id,
    id: crypto.randomUUID(),
    status: "pending",
    createdAt: new Date().toISOString(),
  });
  const { owner: _owner, ...publicOrder } = order;
  return Response.json({ order: publicOrder }, { status: 201 });
}

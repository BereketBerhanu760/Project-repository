import { getSession } from "@/lib/session";
import { updateCourierPosition } from "@/lib/order-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const validStatuses = new Set(["pending", "delivering", "received"]);

export async function POST(request, { params }) {
  const session = await getSession();
  if (session?.role !== "staff") {
    return Response.json({ message: "Staff access is required." }, { status: 403 });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ message: "Invalid position." }, { status: 400 });
  }

  const { lat, lng, status } = payload || {};
  if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180
    || (status !== undefined && !validStatuses.has(status))) {
    return Response.json({ message: "Invalid position." }, { status: 422 });
  }

  const { id } = await params;
  const saved = await updateCourierPosition(id, { lat, lng }, status);
  if (!saved) return Response.json({ message: "Order not found." }, { status: 404 });
  return Response.json({ ok: true });
}

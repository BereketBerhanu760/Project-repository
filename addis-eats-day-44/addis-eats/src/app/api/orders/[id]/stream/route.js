import { getOrderById, getOrderForOwner } from "@/lib/order-store";
import { getSession } from "@/lib/session";
import { trackingSnapshot } from "@/lib/tracking";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function findAuthorizedOrder(id, session) {
  return session.role === "staff"
    ? getOrderById(id)
    : getOrderForOwner(id, session.id);
}

function sseFrame(value) {
  return `data: ${JSON.stringify(value)}\n\n`;
}

export async function GET(request, { params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return Response.json({ error: "Order not found." }, { status: 404 });

  const order = await findAuthorizedOrder(id, session);
  if (!order) return Response.json({ error: "Order not found." }, { status: 404 });

  const encoder = new TextEncoder();
  let cancelStream = () => {};
  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      let checking = false;
      let interval;
      let previous = "";
      let lastHeartbeat = Date.now();

      const cleanup = () => {
        if (interval) clearInterval(interval);
        request.signal.removeEventListener("abort", close);
      };
      const close = () => {
        if (closed) return;
        closed = true;
        cleanup();
        try { controller.close(); } catch { /* Client already closed the stream. */ }
      };
      cancelStream = () => {
        if (closed) return;
        closed = true;
        cleanup();
      };
      const send = (value) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(sseFrame(value)));
        } catch {
          close();
        }
      };

      request.signal.addEventListener("abort", close, { once: true });
      const firstSnapshot = trackingSnapshot(order);
      previous = JSON.stringify(firstSnapshot);
      send(firstSnapshot);

      if (firstSnapshot.status === "received") {
        close();
        return;
      }
      if (closed) return;

      interval = setInterval(async () => {
        if (closed || checking) return;
        checking = true;
        try {
          const latest = await findAuthorizedOrder(id, session);
          if (!latest) {
            send({ unavailable: true });
            close();
            return;
          }
          const snapshot = trackingSnapshot(latest);
          const serialized = JSON.stringify(snapshot);
          if (serialized !== previous) {
            previous = serialized;
            send(snapshot);
            lastHeartbeat = Date.now();
          } else if (Date.now() - lastHeartbeat >= 15000) {
            try {
              controller.enqueue(encoder.encode(": keep-alive\n\n"));
              lastHeartbeat = Date.now();
            } catch {
              close();
            }
          }
          if (snapshot.status === "received") close();
        } catch (error) {
          console.error("Order tracking stream failed:", error);
        } finally {
          checking = false;
        }
      }, 200);
    },
    cancel() {
      cancelStream();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

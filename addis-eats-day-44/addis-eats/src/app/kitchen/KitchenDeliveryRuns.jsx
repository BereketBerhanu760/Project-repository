"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchRoadRoute } from "@/lib/road-route";

const DeliveryMap = dynamic(() => import("@/components/DeliveryMap"), {
  ssr: false,
  loading: () => <div className="delivery-map-placeholder" role="status">Loading delivery map…</div>,
});

async function sendCourierPosition(orderId, courierPos, status) {
  const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/courier`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...courierPos, ...(status ? { status } : {}) }),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || "Could not sync the courier position.");
  }
}

export default function KitchenDeliveryRuns({ orders }) {
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id ?? "");
  const selectedOrder = useMemo(() => orders.find(({ id }) => id === selectedOrderId), [orders, selectedOrderId]);
  const homeBasePos = selectedOrder?.homeBasePos;
  const deliveryPos = selectedOrder?.deliveryPos;
  const [routeCoords, setRouteCoords] = useState([]);
  const [courierPos, setCourierPos] = useState(homeBasePos);
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0);
  const [isDriving, setIsDriving] = useState(false);
  const [routeMessage, setRouteMessage] = useState("Loading road route…");
  const [runMessage, setRunMessage] = useState("");
  const indexRef = useRef(0);
  const saveQueue = useRef(Promise.resolve());

  useEffect(() => {
    if (!selectedOrder) return undefined;
    const { homeBasePos: start, deliveryPos: end } = selectedOrder;
    if (!start || !end) return undefined;
    const controller = new AbortController();
    fetchRoadRoute(start, end, controller.signal)
      .then((points) => {
        setRouteCoords(points);
        setRouteMessage(`${points.length} road points ready`);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setRouteMessage(error.message || "Road route is unavailable.");
        }
      });
    return () => controller.abort();
  }, [selectedOrder]);

  useEffect(() => {
    if (!isDriving || routeCoords.length < 2 || !selectedOrderId) return undefined;

    const timer = setInterval(() => {
      const nextIndex = indexRef.current + 1;
      const nextPosition = routeCoords[nextIndex];
      if (!nextPosition) {
        setIsDriving(false);
        return;
      }

      indexRef.current = nextIndex;
      setCurrentRouteIndex(nextIndex);
      setCourierPos(nextPosition);
      const finished = nextIndex >= routeCoords.length - 1;
      saveQueue.current = saveQueue.current
        .catch(() => {})
        .then(() => sendCourierPosition(selectedOrderId, nextPosition, finished ? "received" : undefined))
        .catch((error) => {
          setRunMessage(error.message);
          setIsDriving(false);
        });

      if (finished) {
        setIsDriving(false);
        setRunMessage("Delivery run complete.");
      }
    }, 200);

    return () => clearInterval(timer);
  }, [isDriving, routeCoords, selectedOrderId]);

  async function startRun() {
    if (!selectedOrderId || !routeCoords.length || !homeBasePos) return;
    setRunMessage("");
    try {
      await saveQueue.current.catch(() => {});
      await sendCourierPosition(selectedOrderId, homeBasePos, "delivering");
      indexRef.current = 0;
      setCurrentRouteIndex(0);
      setCourierPos(routeCoords[0] || homeBasePos);
      setIsDriving(true);
    } catch (error) {
      setRunMessage(error.message);
    }
  }

  async function resetRun() {
    setIsDriving(false);
    indexRef.current = 0;
    setCurrentRouteIndex(0);
    setCourierPos(homeBasePos);
    setRunMessage("Courier reset to the kitchen home base.");
    if (selectedOrderId && homeBasePos) {
      try {
        saveQueue.current = saveQueue.current
          .catch(() => {})
          .then(() => sendCourierPosition(selectedOrderId, homeBasePos, "pending"));
        await saveQueue.current;
      } catch (error) {
        setRunMessage(error.message);
      }
    }
  }

  function changeOrder(event) {
    const nextId = event.target.value;
    const nextOrder = orders.find(({ id }) => id === nextId);
    setIsDriving(false);
    indexRef.current = 0;
    setCurrentRouteIndex(0);
    setCourierPos(nextOrder?.homeBasePos);
    setSelectedOrderId(nextId);
    setRouteCoords([]);
    setRouteMessage("Loading road route…");
    setRunMessage("");
  }

  if (!selectedOrder) return null;

  return (
    <section className="delivery-run-panel" aria-labelledby="delivery-run-heading">
      <div className="section-heading">
        <h2 id="delivery-run-heading">Courier delivery run</h2>
        <p>Simulate the courier along the road route and stream their position to the customer.</p>
      </div>
      <div className="delivery-run-controls">
        <label>
          Order
          <select value={selectedOrderId} onChange={changeOrder} disabled={isDriving}>
            {orders.map((order) => <option key={order.id} value={order.id}>{order.name} · {order.address} · {order.id.slice(0, 8)}</option>)}
          </select>
        </label>
        <button className="button" type="button" onClick={startRun} disabled={isDriving || routeCoords.length < 2}>
          {isDriving ? "Delivery in progress…" : "Start Delivery Run"}
        </button>
        <button className="text-link" type="button" onClick={resetRun} disabled={!homeBasePos}>
          Reset Position
        </button>
        <p role="status" aria-live="polite">{runMessage || routeMessage}{isDriving ? ` · Route point ${currentRouteIndex + 1} of ${routeCoords.length}` : ""}</p>
      </div>
      {courierPos && homeBasePos && deliveryPos ? (
        <DeliveryMap key={selectedOrderId} homeBasePos={homeBasePos} courierPos={courierPos} deliveryPos={deliveryPos} />
      ) : null}
    </section>
  );
}

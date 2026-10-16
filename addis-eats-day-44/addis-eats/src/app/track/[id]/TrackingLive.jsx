"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { relative, when } from "@/lib/format";
import { trackingStatusLabel } from "@/lib/tracking";
import { fetchRoadRoute } from "@/lib/road-route";

const DeliveryMap = dynamic(() => import("@/components/DeliveryMap"), {
  ssr: false,
  loading: () => <div className="delivery-map-placeholder" role="status">Loading delivery map…</div>,
});

function coordinates(point, precision = 5) {
  return `${point.lat.toFixed(precision)}, ${point.lng.toFixed(precision)}`;
}

export default function TrackingLive({ id, initialSnapshot, initialRelative, liveUpdates = true }) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [courierPos, setCourierPos] = useState(initialSnapshot.homeBase);
  const [routeCoords, setRouteCoords] = useState([]);
  const [simulationFinished, setSimulationFinished] = useState(false);
  const [relativeTime, setRelativeTime] = useState(initialRelative);
  const [connection, setConnection] = useState(
    initialSnapshot.status === "received" ? "Delivered · live updates closed" : "Connecting to live updates…",
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchRoadRoute(initialSnapshot.homeBase, initialSnapshot.delivery, controller.signal)
      .then((points) => setRouteCoords(points))
      .catch((error) => {
        if (error.name !== "AbortError") {
          const start = initialSnapshot.homeBase;
          const end = initialSnapshot.delivery;
          const fallbackPoints = Array.from({ length: 61 }, (_, index) => {
            const progress = index / 60;
            return {
              lat: start.lat + (end.lat - start.lat) * progress,
              lng: start.lng + (end.lng - start.lng) * progress,
            };
          });
          setRouteCoords(fallbackPoints);
        }
      });
    return () => controller.abort();
  }, [initialSnapshot.homeBase.lat, initialSnapshot.homeBase.lng, initialSnapshot.delivery.lat, initialSnapshot.delivery.lng]);

  useEffect(() => {
    if (routeCoords.length < 2) return undefined;
    let routeIndex = 0;
    const timer = window.setInterval(() => {
      routeIndex += 1;
      const nextPosition = routeCoords[routeIndex];
      if (!nextPosition || routeIndex >= routeCoords.length - 1) {
        setCourierPos(routeCoords[routeCoords.length - 1]);
        setSimulationFinished(true);
        window.clearInterval(timer);
        return;
      }
      setCourierPos(nextPosition);
    }, 200);
    return () => window.clearInterval(timer);
  }, [routeCoords]);

  useEffect(() => {
    if (!liveUpdates) {
      setConnection("Saved on this device · server live updates unavailable");
      return undefined;
    }
    if (initialSnapshot.status === "received") return undefined;

    const source = new EventSource(`/api/orders/${encodeURIComponent(id)}/stream`);
    let active = true;

    source.onopen = () => {
      if (active) setConnection("Connected · live updates on");
    };
    source.onmessage = (event) => {
      if (!active) return;
      try {
        const update = JSON.parse(event.data);
        if (update.unavailable) {
          setConnection("Order tracking is unavailable");
          source.close();
          return;
        }
        setSnapshot((current) => ({ ...current, ...update }));
        setRelativeTime(relative(update.updatedAt));
        if (update.status === "received") {
          setConnection("Delivered · live updates closed");
          source.close();
        }
      } catch {
        setConnection("Received an unreadable tracking update");
        source.close();
      }
    };
    source.onerror = () => {
      if (active && source.readyState !== EventSource.CLOSED) {
        setConnection("Connection interrupted · reconnecting…");
      } else if (active) {
        setConnection("Live updates disconnected");
      }
    };

    return () => {
      active = false;
      source.close();
    };
  }, [id, initialSnapshot.status, liveUpdates]);

  return (
    <section className="tracking-live" aria-labelledby="tracking-status-heading">
      <div className="tracking-status-heading">
        <div>
          <p className="eyebrow">Live order status</p>
          <h2 id="tracking-status-heading" className="tracking-current-status" aria-live="polite">
            {trackingStatusLabel(snapshot.status)}
          </h2>
        </div>
        <p className="tracking-connection" role="status" aria-live="polite">{connection}</p>
      </div>
      <p className="tracking-updated">Updated {when(snapshot.updatedAt)} · {relativeTime}</p>
      <div className="tracking-grid">
        <DeliveryMap homeBasePos={snapshot.homeBase} courierPos={courierPos} deliveryPos={snapshot.delivery} />
        <aside className="tracking-location-details" aria-label="Delivery locations">
          <h3>Delivery details</h3>
          <dl>
            <div><dt>Courier home base</dt><dd>Addis Eats · {snapshot.homeBase.neighborhood}, Addis Ababa<br /><span>{coordinates(snapshot.homeBase, 15)}</span></dd></div>
            <div><dt>Courier location · approximate</dt><dd>{coordinates(courierPos)}</dd></div>
            <div><dt>Delivery address</dt><dd>{snapshot.delivery.address}<br /><span>Map point: {coordinates(snapshot.delivery)}</span></dd></div>
          </dl>
          <p className="tracking-map-note">Your route preview starts automatically while this page is open. The full delivery address is shown here.{simulationFinished ? " Route preview complete." : ""}</p>
        </aside>
      </div>
    </section>
  );
}

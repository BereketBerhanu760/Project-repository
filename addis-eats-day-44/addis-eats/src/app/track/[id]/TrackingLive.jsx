"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { relative, when } from "@/lib/format";
import { trackingStatusLabel } from "@/lib/tracking";

const DeliveryMap = dynamic(() => import("@/components/DeliveryMap"), {
  ssr: false,
  loading: () => <div className="delivery-map-placeholder" role="status">Loading delivery map…</div>,
});

function coordinates(point, precision = 5) {
  return `${point.lat.toFixed(precision)}, ${point.lng.toFixed(precision)}`;
}

export default function TrackingLive({ id, initialSnapshot, initialRelative }) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [relativeTime, setRelativeTime] = useState(initialRelative);
  const [connection, setConnection] = useState(
    initialSnapshot.status === "received" ? "Delivered · live updates closed" : "Connecting to live updates…",
  );

  useEffect(() => {
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
  }, [id, initialSnapshot.status]);

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
        <DeliveryMap homeBasePos={snapshot.homeBase} courierPos={snapshot.courier} deliveryPos={snapshot.delivery} />
        <aside className="tracking-location-details" aria-label="Delivery locations">
          <h3>Delivery details</h3>
          <dl>
            <div><dt>Courier home base</dt><dd>Addis Eats · {snapshot.homeBase.neighborhood}, Addis Ababa<br /><span>{coordinates(snapshot.homeBase, 15)}</span></dd></div>
            <div><dt>Courier location · approximate</dt><dd>{coordinates(snapshot.courier)}</dd></div>
            <div><dt>Delivery address</dt><dd>{snapshot.delivery.address}<br /><span>Map point: {coordinates(snapshot.delivery)}</span></dd></div>
          </dl>
          <p className="tracking-map-note">The kitchen team controls the courier route. The full delivery address is shown here.</p>
        </aside>
      </div>
    </section>
  );
}

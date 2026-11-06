"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function KeepMapSized({ pickupLocation, dropoffLocation }) {
  const map = useMap();
  const pickupLat = pickupLocation?.latitude;
  const pickupLng = pickupLocation?.longitude;
  const dropoffLat = dropoffLocation?.latitude;
  const dropoffLng = dropoffLocation?.longitude;

  useEffect(() => {
    const container = map.getContainer();
    const resizeObserver = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    resizeObserver.observe(container);
    const frame = requestAnimationFrame(() => map.invalidateSize({ pan: false }));
    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [map]);

  useEffect(() => {
    const points = [[pickupLat, pickupLng], [dropoffLat, dropoffLng]]
      .filter(([latitude, longitude]) => Number.isFinite(latitude) && Number.isFinite(longitude));
    if (points.length > 1) map.fitBounds(points, { padding: [24, 24] });
    else if (points.length === 1) map.setView(points[0], 13);
  }, [map, pickupLat, pickupLng, dropoffLat, dropoffLng]);

  return null;
}

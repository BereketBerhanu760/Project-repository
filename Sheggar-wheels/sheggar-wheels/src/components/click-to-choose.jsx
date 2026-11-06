"use client";

import { useMapEvents } from "react-leaflet";

export default function ClickToChoose({ target, onLocationSelect }) {
  useMapEvents({
    click(event) {
      if (target && onLocationSelect) {
        onLocationSelect(target, {
          label: `${event.latlng.lat.toFixed(5)}, ${event.latlng.lng.toFixed(5)}`,
          latitude: event.latlng.lat,
          longitude: event.latlng.lng,
        });
      }
    },
  });
  return null;
}

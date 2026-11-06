"use client";

import dynamic from "next/dynamic";
import Panel from "@/components/panel";

const CarLocationLeafletMap = dynamic(() => import("@/components/car-location-leaflet-map"), {
  ssr: false,
  loading: () => <div className="mt-3 flex h-56 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500">Loading map?</div>,
});

export default function CarLocationMap({ location, latitude, longitude }) {
  const lat = Number(latitude);
  const lon = Number(longitude);
  const hasCoordinates = Number.isFinite(lat) && lat >= -90 && lat <= 90 && Number.isFinite(lon) && lon >= -180 && lon <= 180 && (latitude !== null && longitude !== null && latitude !== "" && longitude !== "");
  return <Panel title="Approximate vehicle location"><p className="text-sm text-slate-600">{location || "Location not provided"}</p>{hasCoordinates ? <CarLocationLeafletMap latitude={lat} longitude={lon} location={location}/> : <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">Map preview unavailable. The pickup area is shown above.</p>}<p className="mt-2 text-xs text-slate-400">Approximate seeded location only. Pickup instructions are shared after confirmation.</p></Panel>;
}

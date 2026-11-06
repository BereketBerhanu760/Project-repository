"use client";

import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip } from "react-leaflet";
import KeepMapSized from "@/components/keep-map-sized";
import ClickToChoose from "@/components/click-to-choose";





export default function CarLocationLeafletMap({
  latitude,
  longitude,
  location,
  pickupLocation,
  dropoffLocation,
  selectionTarget,
  onLocationSelect,
}) {
  const hasCoords = (point) => Number.isFinite(point?.latitude) && Number.isFinite(point?.longitude);
  const points = [pickupLocation, dropoffLocation].filter(hasCoords);
  const center = points.length
    ? [points[0].latitude, points[0].longitude]
    : [latitude ?? 9.03, longitude ?? 38.74];

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      className="vehicle-leaflet-map mt-3 rounded-xl border border-slate-200"
      aria-label={`Map near ${location || "the vehicle"}`}
    >
      <KeepMapSized pickupLocation={pickupLocation} dropoffLocation={dropoffLocation} />
      <TileLayer
        attribution='&copy; Esri, HERE, Garmin, FAO, NOAA, USGS, EPA, NPS'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
      />
      <ClickToChoose target={selectionTarget} onLocationSelect={onLocationSelect} />
      {hasCoords(pickupLocation) && <CircleMarker center={[pickupLocation.latitude, pickupLocation.longitude]} radius={8} pathOptions={{ color: "#1d4ed8", fillColor: "#3b82f6", fillOpacity: 0.95 }}><Tooltip permanent direction="top" offset={[0, -8]}>Pick-up</Tooltip><Popup>Pick-up</Popup></CircleMarker>}
      {hasCoords(dropoffLocation) && <CircleMarker center={[dropoffLocation.latitude, dropoffLocation.longitude]} radius={8} pathOptions={{ color: "#c2410c", fillColor: "#f97316", fillOpacity: 0.95 }}><Tooltip permanent direction="top" offset={[0, -8]}>Drop-off</Tooltip><Popup>Drop-off</Popup></CircleMarker>}
      {!points.length && Number.isFinite(latitude) && Number.isFinite(longitude) && <CircleMarker center={[latitude, longitude]} radius={8} pathOptions={{ color: "#c2410c", fillColor: "#f97316", fillOpacity: 0.95 }}><Popup>{location || "Approximate vehicle location"}</Popup></CircleMarker>}
    </MapContainer>
  );
}

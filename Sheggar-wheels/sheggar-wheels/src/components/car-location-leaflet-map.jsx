"use client";

import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";

function KeepMapSized({ pickupLocation, dropoffLocation }) {
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

function ClickToChoose({ target, onLocationSelect }) {
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
      {hasCoords(pickupLocation) && <CircleMarker center={[pickupLocation.latitude, pickupLocation.longitude]} radius={8} pathOptions={{ color: "#1d4ed8", fillColor: "#3b82f6", fillOpacity: 0.95 }}><Popup>Pick-up: {pickupLocation.label}</Popup></CircleMarker>}
      {hasCoords(dropoffLocation) && <CircleMarker center={[dropoffLocation.latitude, dropoffLocation.longitude]} radius={8} pathOptions={{ color: "#c2410c", fillColor: "#f97316", fillOpacity: 0.95 }}><Popup>Drop-off: {dropoffLocation.label}</Popup></CircleMarker>}
      {!points.length && Number.isFinite(latitude) && Number.isFinite(longitude) && <CircleMarker center={[latitude, longitude]} radius={8} pathOptions={{ color: "#c2410c", fillColor: "#f97316", fillOpacity: 0.95 }}><Popup>{location || "Approximate vehicle location"}</Popup></CircleMarker>}
    </MapContainer>
  );
}

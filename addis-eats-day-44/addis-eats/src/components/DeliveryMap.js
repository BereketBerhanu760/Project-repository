"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { divIcon, latLngBounds } from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { fetchRoadRoute } from "@/lib/road-route";

function markerIcon(kind, svg) {
  return divIcon({
    className: `custom-leaflet-icon delivery-map-icon ${kind}`,
    html: `<span aria-hidden="true">${svg}</span>`,
    iconSize: [40, 44],
    iconAnchor: [20, 40],
  });
}

const storeIcon = markerIcon("store-map-icon", '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10h18"/><path d="M5 10v10h14V10"/><path d="m3 10 2-6h14l2 6"/><path d="M9 20v-6h6v6"/><path d="M4 10a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0"/></svg>');
const bikeIcon = markerIcon("courier-map-icon", '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h2l3 11.5M5.5 17.5 10 9l4 8.5h-8.5L13 9h-3"/><path d="M8 6h3"/></svg>');
const mapPinIcon = markerIcon("destination-map-icon", '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>');

function FitBounds({ homeBasePos, courierPos, deliveryPos, routeCoords }) {
  const map = useMap();
  useEffect(() => {
    const bounds = latLngBounds(
      [homeBasePos.lat, homeBasePos.lng],
      [courierPos.lat, courierPos.lng],
      [deliveryPos.lat, deliveryPos.lng],
    );
    if (routeCoords.length) bounds.extend(routeCoords.map(({ lat, lng }) => [lat, lng]));
    map.fitBounds(bounds, { padding: [36, 36], maxZoom: 15, animate: false });
  }, [homeBasePos.lat, homeBasePos.lng, courierPos.lat, courierPos.lng, deliveryPos.lat, deliveryPos.lng, routeCoords, map]);
  return null;
}

export default function DeliveryMap({ homeBasePos, courierPos, deliveryPos }) {
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeStatus, setRouteStatus] = useState("Loading road route…");
  const homeLat = homeBasePos.lat;
  const homeLng = homeBasePos.lng;
  const deliveryLat = deliveryPos.lat;
  const deliveryLng = deliveryPos.lng;

  useEffect(() => {
    const controller = new AbortController();
    fetchRoadRoute({ lat: homeLat, lng: homeLng }, { lat: deliveryLat, lng: deliveryLng }, controller.signal)
      .then((points) => {
        setRouteCoords(points);
        setRouteStatus("Road route from kitchen to delivery");
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setRouteCoords([]);
          setRouteStatus("Road route is unavailable right now");
        }
      });
    return () => controller.abort();
  }, [homeLat, homeLng, deliveryLat, deliveryLng]);

  return (
    <div className="delivery-map-frame">
      <MapContainer
        className="delivery-map-surface"
        center={[homeBasePos.lat, homeBasePos.lng]}
        zoom={13}
        zoomControl={false}
        scrollWheelZoom={false}
        aria-label="Map showing the kitchen, courier, and delivery location"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds homeBasePos={homeBasePos} courierPos={courierPos} deliveryPos={deliveryPos} routeCoords={routeCoords} />
        {routeCoords.length ? (
          <>
            <Polyline positions={routeCoords.map(({ lat, lng }) => [lat, lng])} pathOptions={{ color: "#144734", weight: 7, opacity: 0.92 }} />
            <Polyline positions={routeCoords.map(({ lat, lng }) => [lat, lng])} pathOptions={{ color: "#e8ad32", weight: 3, opacity: 1, dashArray: "8 9" }} />
          </>
        ) : null}
        <div className="sr-only" role="status" aria-live="polite">{routeStatus}</div>
        <Marker position={[homeBasePos.lat, homeBasePos.lng]} icon={storeIcon} title="Kitchen home base">
          <Popup>Courier starting point · Addis Eats kitchen</Popup>
        </Marker>
        <Marker position={[courierPos.lat, courierPos.lng]} icon={bikeIcon} title="Courier location">
          <Popup>Courier location</Popup>
        </Marker>
        <Marker position={[deliveryPos.lat, deliveryPos.lng]} icon={mapPinIcon} title="Delivery address">
          <Popup>Customer delivery location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

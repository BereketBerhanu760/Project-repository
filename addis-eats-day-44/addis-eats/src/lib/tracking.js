import { deliveryLocations } from "@/lib/delivery-locations";

const neighborhoodPoints = [
  ["bole", 8.9959, 38.785],
  ["kazanchis", 9.0214, 38.766],
  ["piassa", 9.035, 38.75],
  ["piazza", 9.035, 38.75],
  ["arada", 9.037, 38.751],
  ["sar bet", 8.999, 38.746],
  ["megenagna", 9.022, 38.799],
  ["cmc", 9.023, 38.858],
  ["4 kilo", 9.038, 38.762],
  ["mexico", 9.008, 38.738],
  ["old airport", 8.992, 38.77],
];

export const courierHomeBase = {
  lat: 8.99784182094195,
  lng: 38.786320452317355,
  neighborhood: "Bole",
};

export function getDeliveryPoint(address) {
  const normalized = String(address || "").toLowerCase();
  const selectedLocation = deliveryLocations.find(({ name }) => name.toLowerCase() === normalized.trim());
  if (selectedLocation) return { ...selectedLocation, neighborhood: selectedLocation.name };
  const match = neighborhoodPoints.find(([name]) => normalized.includes(name));
  return match
    ? { lat: match[1], lng: match[2], neighborhood: match[0].replace(/\b\w/g, (letter) => letter.toUpperCase()) }
    : { lat: 9.03, lng: 38.74, neighborhood: "Addis Ababa" };
}

function getCourierPoint(delivery, status) {
  if (status === "received") return { lat: delivery.lat, lng: delivery.lng };
  if (status === "pending") return { lat: courierHomeBase.lat, lng: courierHomeBase.lng };
  return {
    lat: (courierHomeBase.lat + delivery.lat) / 2,
    lng: (courierHomeBase.lng + delivery.lng) / 2,
  };
}

export function trackingSnapshot(order) {
  const status = ["pending", "delivering", "received"].includes(String(order.status).toLowerCase())
    ? String(order.status).toLowerCase()
    : "pending";
  const delivery = { ...getDeliveryPoint(order.address), address: order.address || "Address unavailable" };
  const savedCourier = order.courierPos;
  const courier = savedCourier
    && Number.isFinite(Number(savedCourier.lat))
    && Number.isFinite(Number(savedCourier.lng))
    ? { lat: Number(savedCourier.lat), lng: Number(savedCourier.lng) }
    : getCourierPoint(delivery, status);

  return {
    status,
    updatedAt: order.updatedAt || order.createdAt,
    delivery,
    courier,
    homeBase: courierHomeBase,
  };
}

export function trackingStatusLabel(status) {
  if (status === "delivering") return "On the way";
  if (status === "received") return "Delivered";
  return "Preparing your order";
}

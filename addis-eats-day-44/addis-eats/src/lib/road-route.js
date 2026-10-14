export async function fetchRoadRoute(start, end, signal) {
  const coordinates = `${start.lng},${start.lat};${end.lng},${end.lat}`;
  const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("The road route could not be loaded.");

  const result = await response.json();
  const points = result.code === "Ok" ? result.routes?.[0]?.geometry?.coordinates : null;
  if (!points?.length) throw new Error("No road route was found for these locations.");
  return points.map(([longitude, latitude]) => ({ lat: latitude, lng: longitude }));
}

const FAVORITES_KEY = "addis-eats-favorites";
const FAVORITES_EVENT = "addis-eats-favorites-changed";

export function getFavoriteIds() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function setFavoriteIds(ids) {
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...new Set(ids)]));
    window.dispatchEvent(new Event(FAVORITES_EVENT));
  } catch {
    // Favorites are an optional browser convenience; the menu still works if storage is unavailable.
  }
}

export function subscribeToFavorites(callback) {
  window.addEventListener(FAVORITES_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(FAVORITES_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

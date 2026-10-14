"use client";

import { useEffect, useState } from "react";
import { getFavoriteIds, setFavoriteIds, subscribeToFavorites } from "@/lib/favorites";

export default function FavoriteButton({ dishId, className = "" }) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const sync = () => setIsFavorite(getFavoriteIds().includes(dishId));
    sync();
    return subscribeToFavorites(sync);
  }, [dishId]);

  function toggleFavorite() {
    const favorites = getFavoriteIds();
    setFavoriteIds(
      favorites.includes(dishId)
        ? favorites.filter((id) => id !== dishId)
        : [...favorites, dishId],
    );
  }

  return (
    <button
      className={`favorite-toggle ${isFavorite ? "is-favorite" : ""} ${className}`.trim()}
      type="button"
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isFavorite}
      onClick={toggleFavorite}
    >
      {isFavorite ? "♥" : "♡"}
    </button>
  );
}

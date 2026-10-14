"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import DishList from "./DishList";
import { fetcher } from "@/lib/fetcher";
import { getFavoriteIds, subscribeToFavorites } from "@/lib/favorites";

function pageHref(page, category, query, favoritesOnly) {
  const params = new URLSearchParams();
  if (category !== "all") params.set("category", category);
  if (query) params.set("q", query);
  if (favoritesOnly) params.set("favorites", "1");
  params.set("page", String(page));
  return `/menu?${params.toString()}`;
}

export default function SearchBox({ category, page, initialData }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();
  const initialQuery = searchParams.get("q") || "";
  const favoritesOnly = searchParams.get("favorites") === "1";
  const [value, setValue] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery.trim());
  const [favoriteIds, setFavoriteIdsState] = useState([]);
  const [favoritesReady, setFavoritesReady] = useState(false);
  const visiblePage = value.trim() === initialQuery.trim() ? page : 1;

  useEffect(() => {
    const syncFavorites = () => {
      setFavoriteIdsState(getFavoriteIds());
      setFavoritesReady(true);
    };
    syncFavorites();
    return subscribeToFavorites(syncFavorites);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const nextQuery = value.trim();
      setQuery(nextQuery);
      if (nextQuery === initialQuery.trim()) return;

      const params = new URLSearchParams(searchString);
      if (nextQuery) params.set("q", nextQuery);
      else params.delete("q");
      params.set("page", "1");
      const nextUrl = `${pathname}?${params.toString()}`;

      if (nextUrl !== `${pathname}?${searchString}`) {
        router.replace(nextUrl, { scroll: false });
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [value, initialQuery, pathname, router, searchString]);

  const apiParams = new URLSearchParams({
    category,
    page: String(visiblePage),
  });
  if (query) apiParams.set("q", query);
  if (favoritesOnly) {
    apiParams.set("favorites", "1");
    apiParams.set("favoriteIds", favoriteIds.join(","));
  }
  const needsFetch = Boolean(query || favoritesOnly);
  const key = needsFetch && (!favoritesOnly || favoritesReady)
    ? `/api/dishes?${apiParams.toString()}`
    : null;
  const { data, error, isValidating } = useSWR(key, fetcher, {
    fallbackData: !favoritesOnly && query === initialQuery.trim() ? initialData : undefined,
    keepPreviousData: true,
  });
  const results = needsFetch ? data || { ...initialData, dishes: [], total: 0, totalPages: 1 } : initialData;

  function toggleFavoritesFilter() {
    const params = new URLSearchParams(searchString);
    if (favoritesOnly) params.delete("favorites");
    else params.set("favorites", "1");
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <section className="live-menu" aria-label="Search and browse dishes">
      <div className="menu-filter-row">
        <label className="menu-search">
          <span>Search dishes</span>
          <input
            type="search"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Try “shiro” or “burger”"
          />
        </label>
        <button
          type="button"
          className={`favorites-filter ${favoritesOnly ? "is-active" : ""}`}
          aria-pressed={favoritesOnly}
          onClick={toggleFavoritesFilter}
        >
          {favoritesOnly ? "♥ Favorites only" : "♡ Favorites"}
        </button>
      </div>

      {error ? (
        <p role="alert" className="menu-error">Menu results could not be refreshed. Please try again.</p>
      ) : null}
      {(query || favoritesOnly) && isValidating ? <p className="menu-updating">Updating results…</p> : null}

      <p className="menu-result-count">
        {results.total} {results.total === 1 ? "dish" : "dishes"}{favoritesOnly ? " in favorites" : ""}
      </p>
      {results.dishes.length ? (
        <DishList dishes={results.dishes} />
      ) : (
        <p className="menu-empty">
          {favoritesOnly && favoriteIds.length === 0
            ? "No favorites yet. Tap the heart on a dish to save it here."
            : favoritesOnly
              ? "No favorite dishes match these filters."
              : "No dishes match your search."}
        </p>
      )}

      {results.totalPages > 1 ? (
        <nav className="pagination" aria-label="Menu pages">
          {results.page > 1 ? (
            <Link href={pageHref(results.page - 1, category, query, favoritesOnly)}>Previous</Link>
          ) : <span aria-disabled="true">Previous</span>}
          <span>Page {results.page} of {results.totalPages}</span>
          {results.page < results.totalPages ? (
            <Link href={pageHref(results.page + 1, category, query, favoritesOnly)}>Next</Link>
          ) : <span aria-disabled="true">Next</span>}
        </nav>
      ) : null}
    </section>
  );
}

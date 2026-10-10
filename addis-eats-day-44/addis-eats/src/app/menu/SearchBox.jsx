"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import DishList from "./DishList";

function pageHref(page, category, query) {
  const params = new URLSearchParams();
  if (category !== "all") params.set("category", category);
  if (query) params.set("q", query);
  params.set("page", String(page));
  return `/menu?${params.toString()}`;
}

export default function SearchBox({ category, page, initialData }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();
  const initialQuery = searchParams.get("q") || "";
  const [value, setValue] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery.trim());
  const visiblePage = value.trim() === initialQuery.trim() ? page : 1;

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

  const key = query
    ? `/api/dishes?category=${encodeURIComponent(category)}&page=${visiblePage}&q=${encodeURIComponent(query)}`
    : null;
  const { data, error, isValidating } = useSWR(key, {
    fallbackData: query === initialQuery.trim() ? initialData : undefined,
    keepPreviousData: true,
  });
  const results = query ? data || initialData : initialData;

  return (
    <section className="live-menu" aria-label="Search and browse dishes">
      <label className="menu-search">
        <span>Search dishes</span>
        <input
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Try “shiro” or “vegan”"
        />
      </label>

      {error ? (
        <p role="alert" className="menu-error">Menu results could not be refreshed. Please try again.</p>
      ) : null}
      {query && isValidating ? <p className="menu-updating">Updating results…</p> : null}

      <p className="menu-result-count">
        {results.total} {results.total === 1 ? "dish" : "dishes"}
      </p>
      <DishList dishes={results.dishes} />

      {results.totalPages > 1 ? (
        <nav className="pagination" aria-label="Menu pages">
          {results.page > 1 ? (
            <Link href={pageHref(results.page - 1, category, query)}>Previous</Link>
          ) : <span aria-disabled="true">Previous</span>}
          <span>Page {results.page} of {results.totalPages}</span>
          {results.page < results.totalPages ? (
            <Link href={pageHref(results.page + 1, category, query)}>Next</Link>
          ) : <span aria-disabled="true">Next</span>}
        </nav>
      ) : null}
    </section>
  );
}

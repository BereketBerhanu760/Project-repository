# Live Data Decisions

The menu API returns `{ dishes, page, pageSize, total, totalPages }`. It filters by
`category` and case-insensitive `q`, then returns three dishes per page. The URL
uses `category`, `q`, and `page`, so a filtered page can be bookmarked and shared.
`/api/dishes` remains the single source for client menu refreshes.

| Query | SWR key | Refresh and cache rule | Reason |
| --- | --- | --- | --- |
| Menu search/page | `/api/dishes?category={category}&page={page}&q={query}` | No polling; revalidate on mount/focus; `keepPreviousData: true`; the key is `null` when the trimmed search is empty. | Menu data is served from the page's server-rendered `fallbackData`; searches only start after a 300 ms debounce. Keeping previous results visible avoids an empty flash while the next key loads. |
| Order status | `/api/orders/{id}` | `refreshInterval: 5000` ms; server-rendered order data is provided as `fallbackData`. | Order status is the only frequently changing data, and polling every five seconds is frequent enough for a useful tracking screen without unnecessary requests or an initial spinner. |

The root SWR provider supplies `src/lib/fetcher.js` to every query. It rejects
non-OK HTTP responses, so SWR exposes failures instead of treating error payloads
as successful data. SWR uses stale-while-revalidate behavior and does not expose a
`staleTime` option; its built-in two-second `dedupingInterval` coalesces requests
for the same key without making the menu appear fresh for an arbitrary period.

For the network check, type a search term quickly: only the final value after
the 300 ms pause issues a menu API request. The old dish cards remain visible
until that response arrives. Empty search uses a null SWR key, so it does not
issue a search request.

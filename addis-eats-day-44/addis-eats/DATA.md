# Live Data Decisions

The menu API returns `{ dishes, page, pageSize, total, totalPages }`. It filters by
`category` and case-insensitive `q`, then returns three dishes per page. The URL
uses `category`, `q`, and `page`, so a filtered page can be bookmarked and shared.
`/api/dishes` remains the single source for client menu refreshes.

| Query | SWR key | Refresh and cache rule | Reason |
| --- | --- | --- | --- |
| Menu search/page | Client SWR over `/api/dishes?category={category}&page={page}&q={query}`; initial query/page is calculated by `getDishPage` on the server. | SWR key includes category, page, and query; `null` when the trimmed query is empty. Server response seeds `fallbackData`; no polling; revalidate on mount/focus; `keepPreviousData: true`; input is debounced 300 ms. | Shareable URL state and server data render immediately; distinct query keys prevent stale cross-query responses, debounce avoids request-per-keystroke, and previous results avoid a blank while refreshing. |
| Order status | Client SWR over `/api/orders/{id}`; initial owner-scoped record is loaded by the server page. | Order ID is the SWR key; server response seeds `fallbackData`; poll every 5,000 ms; SWR deduplicates same-key requests for its default interval. | Status changes over time, so bounded polling updates the view while server seeding avoids a loading flash. The API rechecks session ownership on every poll. |

The root SWR provider supplies `src/lib/fetcher.js` to every query. It rejects
non-OK HTTP responses, so SWR exposes failures instead of treating error payloads
as successful data. SWR uses stale-while-revalidate behavior and does not expose a
`staleTime` option; its built-in two-second `dedupingInterval` coalesces requests
for the same key without making the menu appear fresh for an arbitrary period.

For the network check, type a search term quickly: only the final value after
the 300 ms pause issues a menu API request. The old dish cards remain visible
until that response arrives. Empty search uses a null SWR key, so it does not
issue a search request.

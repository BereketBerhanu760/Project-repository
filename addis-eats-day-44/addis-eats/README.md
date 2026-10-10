# Addis Eats

Addis Eats is a Next.js App Router restaurant ordering capstone. The menu and dish pages render on the server; checkout uses a server action with progressive enhancement, and the JSON API shares its validation and order store.

The production server is available at `http://localhost:3000`. Local `.env*` files (except the committed `.env.example`), `.next`, and `.data` are ignored. Orders are stored locally in `.data/orders.json`; use a durable database/volume for serverless hosting. The cart is kept in an HTTP-only cookie and validated against menu data whenever it is read.

Authentication uses signed eight-hour HTTP-only session cookies. In development,
sign in with `customer` / `AddisEatsDemo!42` or `staff` / `KitchenDemo!42`.
Production requires server-only `AUTH_SECRET` and `AUTH_USERS` configuration;
see [AUTH.md](AUTH.md) for setup and the security checks.

Copy `.env.example` to `.env.local` for local configuration. Keep real values in
the ignored local env file; never expose authentication values with a
`NEXT_PUBLIC_` prefix. Performance code changes and the intentionally omitted
browser measurements are documented in [PERF.md](PERF.md).

## API

| Endpoint           | Method | Success                                             | Failure                                                    |
| ------------------ | ------ | --------------------------------------------------- | ---------------------------------------------------------- |
| `/api/dishes`      | `GET`  | `200` with paged `{ "dishes": [...], "page", "pageSize", "total", "totalPages" }` | - |
| `/api/dishes/[id]` | `GET`  | `200` with `{ "dish": {...} }`                      | `404` with `{ "error": "Dish not found.", "status": 404 }` |
| `/api/orders`      | `POST` | Authenticated `201` with the saved order (no owner/session value) | `401` unauthenticated; `400` malformed JSON; `422` schema or unknown-dish errors |
| `/api/orders/[id]` | `GET`  | `200` with the signed-in owner's order status       | `404` for missing or non-owned orders                     |

`GET /api/dishes` also accepts `category`, `q`, and `page` query parameters and
returns paginated menu metadata. `/Orders/[id]` renders the owner's order status
on the server, then refreshes it in the browser every five seconds. See
[DATA.md](DATA.md) for query keys, debounce behavior, and refresh/cache decisions.

To verify search in the browser, open Developer Tools → Network and type several
characters quickly in the menu search box. There should be one `/api/dishes`
search request after the 300 ms debounce, and the existing results remain visible
while it completes.

## Ordering Flow

Open a dish detail page and submit **Add to cart**. The server validates the dish and stores it in the cart cookie, then opens `/cart`. Add more dishes from the menu, remove line items, and select **Continue to checkout**. Sign in to place an order. Checkout displays menu-derived totals; its server action ignores client-supplied item/price values, validates customer fields, saves the order for the signed-in account, and clears the cart.

## Production Build Output

Verified with Next.js 16.3.6:

```text
○ /
○ /_not-found
ƒ /api/dishes
ƒ /api/dishes/[id]
ƒ /api/orders
ƒ /api/orders/[id]
ƒ /cart
ƒ /checkout
ƒ /menu
ƒ /Orders/[id]
● /menu/doro-wot
● /menu/misir-wot
● /menu/gomen
● /menu/kitfo
● /menu/shiro
● /menu/tibs
```

`○` is static output, `●` is statically generated output, and `ƒ` is dynamic server rendering. `/menu` is dynamic because it reads `searchParams`; `/cart` and `/checkout` are dynamic because they read cookies. Dish pages are generated from `generateStaticParams`.

## Production Failure Checks

1. Unknown dish lookup returns `404`.
2. Invalid phone/required fields return `422` with field errors.
3. Malformed JSON returns `400` without an unhandled exception.
4. A syntactically valid order with an unknown dish returns `422`.
5. A forged or missing session cannot cancel an order; the action checks session and owner before deleting.
6. Checkout form submission uses a server action and must work with JavaScript disabled.

The production API checks can be run with the commands above. Check 5 is enforced in `cancelOrder`; check 6 should be verified by submitting the checkout form in a browser with JavaScript disabled.

## Route and Boundary Notes

See [STRATEGY.md](STRATEGY.md) for the route tree and build-marker strategy, and [BOUNDARY.md](BOUNDARY.md) for the server/client map.

Authentication configuration, route guards, and security checks are documented in [AUTH.md](AUTH.md).

# Addis Eats Route Strategy

## Intended App Tree

```text
middleware.js

src/
	app/
		api/
			dishes/route.js
			dishes/[id]/route.js
			orders/route.js
			orders/[id]/route.js
		cart/actions.js
		cart/page.js
		checkout/actions.js
		checkout/CheckoutForm.jsx
		checkout/page.js
		menu/[id]/page.js
		menu/CategoryBar.jsx
		menu/SearchBox.jsx
		menu/data.js
		menu/DishList.jsx
		menu/error.js
		menu/layout.js
		menu/loading.js
		menu/page.js
		Orders/[id]/page.js
		signin/actions.js
		signin/page.js
		kitchen/page.js
		globals.css
		layout.js
		not-found.js
		page.js
		providers.jsx
	lib/
		cart.js
		order-store.js
		schema.js
		session.js
		session-token.js
		auth.js
		fetcher.js
```

## Page and Route Strategy

| Route              | Build marker | Rendering and data strategy                                                                                                             |
| ------------------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                | `○` static   | Server-rendered home page with static featured dishes.                                                                                  |
| `/menu`            | `ƒ` dynamic  | Server page reads `searchParams`, filters shared dish data, and revalidates after 60 seconds.                                           |
| `/menu/[id]`       | `●` SSG      | `generateStaticParams` creates one page per known dish; unknown IDs use `notFound()`.                                                   |
| `/Orders/[id]`     | `ƒ` dynamic  | Middleware and the page guard require a signed session; owner-scoped status is rendered on the server, then refreshed in the client every five seconds.                                       |
| `/signin`          | `ƒ` dynamic  | Validates configured credentials, sets a signed HTTP-only session cookie, and validates the local return destination including its query.                |
| `/kitchen`         | `ƒ` dynamic  | Checks the signed-in user's staff role on the server before reading or rendering kitchen orders.                                       |
| `/cart`            | `ƒ` dynamic  | Reads the validated cart cookie, renders line items, and exposes server actions to add or remove dishes.                                |
| `/checkout`        | `ƒ` dynamic  | Middleware and the page guard require a signed session; reads the owner-scoped order store, and `CheckoutForm` submits with `useActionState`.                                    |
| `/api/dishes`      | `ƒ` dynamic  | `GET` returns the shared menu data.                                                                                                     |
| `/api/dishes/[id]` | `ƒ` dynamic  | `GET` returns a dish or the consistent `404` error payload.                                                                             |
| `/api/orders`      | `ƒ` dynamic  | Authenticated `POST` validates with `orderSchema`, stores a valid order for the signed-in account, and returns `201`; unauthenticated requests return `401`. |
| `/api/orders/[id]` | `ƒ` dynamic  | `GET` returns only the signed-in owner's order status; missing or non-owned orders return `404`.                                      |

## Server Actions

| Action                         | Strategy                                                                                                                                                              |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `placeOrder`                   | Requires a signed-in session, validates `FormData` with the same `orderSchema` used by the API, derives cart items and totals from the server cookie, then saves for that account. |
| `cancelOrder`                  | Reads the session inside the action, then deletes only an order whose ID and owner both match. The checkout button does not enforce authorization.                    |
| `addToCart` / `removeFromCart` | Validate menu IDs on the server, update the HTTP-only cart cookie, and revalidate or redirect to `/cart`.                                                             |

Checkout derives item IDs and totals from the server-read cart cookie, not editable form fields. A successful order clears the cart and revalidates `/cart` and `/checkout`.

Orders are stored in `.data/orders.json`, excluded from Git. The local production server can retain orders across requests and restarts while that file remains. A serverless deployment needs a managed database or durable volume instead of local filesystem storage.

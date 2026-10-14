# Addis Eats

Addis Eats is a modern Ethiopian restaurant web application built with Next.js App Router, featuring three-layer route & data protection, real-time polled order tracking, debounced menu search, and dependency-free authentication & cart management.

**Deployed site:** [https://project-repository-z5ez.vercel.app](https://project-repository-z5ez.vercel.app)

Customer cart contents are kept in HTTP-only cookies, validated against menu data, and isolated by signed-in account; an anonymous cart is claimed when a customer signs in. Staff have no cart and are redirected to `/kitchen` from `/cart` and `/checkout`.

Authentication uses signed eight-hour HTTP-only session cookies (`HMAC-SHA256`). Customers can sign up with a unique username and their own 12–128 character password; password hashes are salted with `scrypt` and stored securely. In development, sign in with `customer` / `AddisEatsDemo!42` or `staff` / `KitchenDemo!42`. In production, set `AUTH_SECRET` and `AUTH_USERS`. For serverless hosting environments like Vercel, Upstash Redis REST can be optionally configured via standard environment variables without any external client libraries.

Browser storage is strictly and purposefully limited:
- `localStorage` is used to remember the username on the login screen if requested by the user.
- `sessionStorage` is used to preserve the one-time `returnTo` redirect across the sign-in / registration flow.
- All session validation, authorization roles, and orders remain protected on the server.

See [AUTH.md](AUTH.md), [DATA.md](DATA.md), and [PERF.md](PERF.md) for full architecture, data flow, and performance budget decisions.

## Run from a fresh clone

```powershell
npm ci
npm run dev
```

Open `http://localhost:3000`. Demo accounts available out-of-the-box:

| Role     | Username   | Password           |
| -------- | ---------- | ------------------ |
| Customer | `customer` | `AddisEatsDemo!42` |
| Staff    | `staff`    | `KitchenDemo!42`   |

To build and run the production server:

```powershell
npm run build
npm start
```

## Vercel deployment and pre-flight checks

Set `AUTH_SECRET` and `AUTH_USERS` in Vercel **separately for Preview and Production**. Use a different random `AUTH_SECRET` (at least 32 characters) and real account passwords in each environment; `AUTH_USERS` is a JSON array containing at least one customer and one staff account. Keep both variables server-only (do not prefix them with `NEXT_PUBLIC_`). Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in both environments too if durable order and account storage is required. `.env.example` lists the variable names and formats; it contains placeholders, not usable credentials.

Before deploying, run `npm ci` and `npm run build`. Then check the preview deployment using only the keyboard (Tab, Enter, Escape) and on a real phone: place an order, rapidly activate Place order twice and confirm there is one order, verify visible focus, and confirm controls are at least 44 pixels tall. In a private browser window, verify unauthenticated pages load and protected pages request sign-in. Confirm the menu item share link shows a title, description, and image card. Repeat these checks against Production after deployment. Keep the current production URL below up to date.

**Live URL:** [https://project-repository-z5ez.vercel.app](https://project-repository-z5ez.vercel.app)

## API

| Endpoint           | Method | Success                                                                           | Failure                                                                                            |
| ------------------ | ------ | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `/api/dishes`      | `GET`  | `200` with paged `{ "dishes": [...], "page", "pageSize", "total", "totalPages" }` | -                                                                                                  |
| `/api/dishes/[id]` | `GET`  | `200` with `{ "dish": {...} }`                                                    | `404` with `{ "error": "Dish not found.", "status": 404 }`                                         |
| `/api/orders`      | `POST` | Authenticated customer `201` with saved order (no owner/session leak)             | `401` unauthenticated; `403` staff role; `400` malformed JSON; `422` schema or unknown-dish errors |
| `/api/orders/[id]` | `GET`  | `200` with owner's or staff's order status                                        | `404` for missing or unauthorized orders                                                           |

`GET /api/dishes` accepts `category`, `q`, and `page` query parameters. `/Orders/[id]` renders the owner's order status on the server with fallback data, then refreshes every five seconds via SWR. Customers can view only their own orders; staff can see and track all orders. The staff-only `/kitchen` page updates status to `pending`, `delivering`, or `received` through a role-checked server action.

## Production Failure Checks

1. Unknown dish lookup returns `404`.
2. Invalid phone or required fields return `422` with field errors.
3. Malformed JSON returns `400` without an unhandled exception.
4. A syntactically valid order with an unknown dish returns `422`.
5. A forged or missing session cannot cancel an order; the action verifies session ownership.
6. Checkout and cart form submissions use server actions with progressive enhancement.

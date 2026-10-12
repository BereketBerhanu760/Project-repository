# Authentication and Authorization

## Configuration

Development provides two demo accounts:

| Role     | Username   | Password           |
| -------- | ---------- | ------------------ |
| Customer | `customer` | `AddisEatsDemo!42` |
| Staff    | `staff`    | `KitchenDemo!42`   |

Production configuration:

- `AUTH_SECRET`: a secret of at least 32 characters, used to HMAC-SHA256 sign session tokens.
- `AUTH_USERS`: a JSON array of accounts with `username`, `password`, and `role` (`customer` or `staff`). Keep both values server-only and use strong, unique credentials.
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (optional for durable production deployment on serverless platforms such as Vercel, with automatic fallback to local filesystem persistence for development).

Customers can create their own accounts at `/signup`; signup always assigns the `customer` role, so it cannot create staff accounts. Usernames are unique case-insensitively and passwords must be 12–128 characters. Registered customer password hashes use Node.js `scrypt` with a per-user random salt. Staff accounts remain provisioned through server-only `AUTH_USERS`.

## Client-Side Storage vs Server Security

In keeping with best frontend security practices:
- **`localStorage`**: Used strictly for optional user convenience to remember the entered username (`addis-eats:remembered-username`) on the sign-in form when "Remember username on this device" is checked. It never stores passwords, session tokens, or authorization roles.
- **`sessionStorage`**: Used strictly to hold the temporary, one-time redirect destination (`addis-eats:signin-return-to`) across sign-in or registration flows, and is cleared immediately upon successful sign-in.
- **Session Tokens**: Handled strictly via signed HTTP-only, `SameSite=Lax`, `Secure` cookies. Browser JavaScript cannot access or tamper with session tokens.

## Protection decisions

| Layer             | Protected surface and decision                                                                                                                                                                                                                                                     | What it proves                                                                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Middleware        | Redirect unauthenticated `/checkout/:path*` and `/Orders/:path*` requests to sign-in; discard invalid session cookies (`middleware.js`).                                                                                                                                          | Direct navigation cannot reach protected pages without a verified signed session.                                                           |
| Server page       | Cart and checkout are customer-only; staff are redirected to `/kitchen`. Customer order lists are scoped to the session owner. Order tracking permits the owner or staff; `/kitchen` requires the staff role before reading all orders.                                            | A middleware bypass or a different customer cannot expose another user's orders or staff data.                                              |
| Server action/API | `placeOrder`, `cancelOrder`, cart actions, and order API handlers re-read the session at the write/read boundary. Customer reads, cart access, and cancellation require the appropriate customer/owner session; kitchen status updates and order deletions require the staff role. | Stale pages and forged requests cannot place/cancel/read orders as an unauthenticated or other user, or update/delete orders as a customer. |

## Session and authorization

Successful sign-in sets a signed session cookie with an eight-hour expiry. The cookie is `HttpOnly`, `SameSite=Lax`, and `Secure` in production. Sign-out clears it. Return destinations are restricted to local paths; external, protocol-relative, backslash-containing, and control-character destinations are rejected.

Middleware covers `/checkout/:path*` and `/Orders/:path*`. The pages also check the session on the server, preserving authorization even if middleware is bypassed. Signup creates only customer accounts and signs each new account into its own user-ID-scoped session. Staff sign-in always redirects to `/kitchen`; staff do not claim anonymous carts, cannot access `/cart` or `/checkout`, and cannot create orders through the API. Cart actions also refuse staff sessions. `placeOrder` and `cancelOrder` independently check the session in their server actions. Order details are available only to the owner or staff; `/kitchen`, status updates, single-order deletion, and clear-all deletion check the staff role. Delete controls require an explicit confirmation step. Status values are restricted to `pending`, `delivering`, and `received`.

## Security checks performed

| Attack attempt | Expected protection | Code line / Enforcing layer | Observed result |
| --- | --- | --- | --- |
| Read the session from browser JavaScript after sign-in. | `HttpOnly` session cookie flag prevents JavaScript access. | `src/lib/session.js:18` (`httpOnly: true`) | `document.cookie` did not expose the session cookie; attack failed. |
| Sign in with `next=https://evil.example/`. | Local-only return destination validation rejects open redirects. | `src/lib/safe-return-to.js:8` (`getSafeReturnTo`) | Fallback to `/checkout`; did not navigate to external host; attack failed. |
| Read another account's order through the API and tracking route (IDOR). | Owner-scoped lookup returning 404 for non-owned records. | `src/app/api/orders/[id]/route.js:11` and `src/app/Orders/[id]/page.js:29` | The other account received `404 Not Found` from both surfaces; attack failed. |
| Submit stale checkout place/cancel actions after signing out. | Session and owner checks inside each server action. | `src/app/checkout/actions.js:13` and `src/app/checkout/actions.js:48` | Place action returned "Sign in with a customer account before ordering"; cancel action left order unchanged; attack failed. |
| Open `/kitchen` as a customer. | Server-side staff-role check before listing orders. | `src/app/kitchen/page.js:16` (`session.role !== "staff"`) | Customer was denied with 404; staff account could access kitchen; attack failed. |
| Open another customer's `/Orders/[id]` route. | Order detail lookup allows only the owner or staff. | `src/app/Orders/[id]/page.js:29` (`getOrderForOwner`) | A different customer receives `404 Not Found`; attack failed. |
| Submit a kitchen status change as a customer or with an unsupported value. | Server action checks staff role and status allowlist before writing. | `src/app/kitchen/actions.js:10` (`session?.role !== "staff"`) | Customer submissions are ignored; only allowlisted statuses are persisted; attack failed. |
| Create an order through the API without a session. | API handler session check. | `src/app/api/orders/route.js:8` (`!session -> 401`) | Request rejected with `401 Unauthorized`; attack failed. |
| Create an order through the API as staff. | API accepts only customer sessions. | `src/app/api/orders/route.js:9` (`session.role !== "customer" -> 403`) | Request rejected with `403 Forbidden`; attack failed. |

To reproduce the browser checks, start the app with `npm run dev`, sign in using the development accounts, and inspect the protected routes and order APIs.

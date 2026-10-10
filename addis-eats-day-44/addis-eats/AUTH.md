# Authentication and Authorization

## Configuration

Development provides two demo accounts:

| Role | Username | Password |
| --- | --- | --- |
| Customer | `customer` | `AddisEatsDemo!42` |
| Staff | `staff` | `KitchenDemo!42` |

Production must define:

- `AUTH_SECRET`: a secret of at least 32 characters, used to sign session tokens.
- `AUTH_USERS`: a JSON array of accounts with `username`, `password`, and `role` (`customer` or `staff`). Keep both values server-only and use strong, unique credentials.

The app intentionally has no public registration flow. Development demo accounts are not enabled in production.

## Protection decisions

| Layer | Protected surface and decision | What it proves |
| --- | --- | --- |
| Middleware | Redirect unauthenticated `/checkout/:path*` and `/Orders/:path*` requests to sign-in; discard invalid session cookies. | Direct navigation cannot reach protected pages without a verified signed session. |
| Server page | Checkout and order tracking independently verify the session; order history and tracking lookups are scoped to the session owner. `/kitchen` requires the staff role before reading all orders. | A middleware bypass or a different account cannot expose another user's orders or staff data. |
| Server action/API | `placeOrder`, `cancelOrder`, and order API handlers re-read the session at the write/read boundary; cancellation and order reads require matching ownership. | Stale pages and forged requests cannot place/cancel/read orders as an unauthenticated or other user. |

## Session and authorization

Successful sign-in sets a signed session cookie with an eight-hour expiry. The cookie is `HttpOnly`, `SameSite=Lax`, and `Secure` in production. Sign-out clears it. Return destinations are restricted to local paths; external, protocol-relative, backslash-containing, and control-character destinations are rejected.

Middleware covers `/checkout/:path*` and `/Orders/:path*`. The pages also check the session on the server, preserving authorization if middleware is bypassed. `placeOrder` and `cancelOrder` independently check the session in their server actions. The order API requires authentication to create an order, scopes reads and cancellation to the signed-in owner, and returns not-found for missing or non-owned orders. `/kitchen` checks the staff role before reading orders.

## Security checks performed

| Attack attempt | Expected protection | Observed result |
| --- | --- | --- |
| Read the session from browser JavaScript after sign-in. | HttpOnly session cookie. | `document.cookie` did not expose the session cookie. |
| Sign in with `next=https://evil.example/`. | Local-only return destination validation. | Returned to `/checkout`; did not navigate to the external host. |
| Read another account's order through the API and tracking route. | Owner-scoped lookup with not-found for non-owned records. | The other account received `404` from both surfaces. |
| Submit stale checkout place/cancel actions after signing out. | Session and owner checks inside each server action. | Place action returned “Sign in before placing an order”; cancel action left the order unchanged. |
| Open `/kitchen` as a customer. | Server-side staff-role check before listing orders. | Customer was denied; staff account could access the kitchen page. |
| Create an order through the API without a session. | API handler session check. | Request was rejected with `401`. |

To reproduce the browser checks, start the app with `npm run dev`, sign in using the development accounts, and inspect the protected routes and order APIs. Never use the demo credentials in production.

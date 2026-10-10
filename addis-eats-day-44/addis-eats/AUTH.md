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

## Session and authorization

Successful sign-in sets a signed session cookie with an eight-hour expiry. The cookie is `HttpOnly`, `SameSite=Lax`, and `Secure` in production. Sign-out clears it. Return destinations are restricted to local paths; external, protocol-relative, backslash-containing, and control-character destinations are rejected.

Middleware covers `/checkout/:path*` and `/Orders/:path*`. The pages also check the session on the server, preserving authorization if middleware is bypassed. `placeOrder` and `cancelOrder` independently check the session in their server actions. The order API requires authentication to create an order, scopes reads and cancellation to the signed-in owner, and returns not-found for missing or non-owned orders. `/kitchen` checks the staff role before reading orders.

## Security checks performed

- After sign-in, `document.cookie` was empty in the browser; the session cookie is not readable by client-side JavaScript.
- A sign-in link containing `next=https://evil.example/` returned to `/checkout`, not to the external host.
- A different signed-in account received `404` for the customer's order from both the order API and tracking page.
- After signing out in one tab, submitting the stale checkout page's `placeOrder` action returned “Sign in before placing an order.” The stale page's cancel action did not remove the test order; the server action requires a session and verifies ownership.
- Customer access to `/kitchen` was denied; a staff account could view the kitchen page.
- Unauthenticated order creation through the API was rejected.

To reproduce the browser checks, start the app with `npm run dev`, sign in using the development accounts, and inspect the protected routes and order APIs. Never use the demo credentials in production.

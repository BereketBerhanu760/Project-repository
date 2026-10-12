# Authentication and Authorization

## Configuration

Development provides two demo accounts:

| Role     | Username   | Password           |
| -------- | ---------- | ------------------ |
| Customer | `customer` | `AddisEatsDemo!42` |
| Staff    | `staff`    | `KitchenDemo!42`   |

Production must define:

- `AUTH_SECRET`: a secret of at least 32 characters, used to sign session tokens.
- `AUTH_USERS`: a JSON array of accounts with `username`, `password`, and `role` (`customer` or `staff`). Keep both values server-only and use strong, unique credentials.

Customers can create their own accounts at `/signup`; signup always assigns the `customer` role, so it cannot create staff accounts. Usernames are unique case-insensitively and passwords must be 12-128 characters. Registered customer password hashes use Node.js scrypt with a per-user random salt and are stored in `.data/users.json`, which is ignored by Git. This local JSON store is suitable for the course app on a persistent local filesystem; serverless production deployments need a durable database or volume for registered accounts and orders. Staff accounts remain provisioned through server-only `AUTH_USERS`. Development demo accounts are not enabled in production.

## Protection decisions

| Layer             | Protected surface and decision                                                                                                                                                                                                                                                     | What it proves                                                                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Middleware        | Redirect unauthenticated `/checkout/:path*` and `/Orders/:path*` requests to sign-in; discard invalid session cookies.                                                                                                                                                             | Direct navigation cannot reach protected pages without a verified signed session.                                                           |
| Server page       | Cart and checkout are customer-only; staff are redirected to `/kitchen`. Customer order lists are scoped to the session owner. Order tracking permits the owner or staff; `/kitchen` requires the staff role before reading all orders.                                            | A middleware bypass or a different customer cannot expose another user's orders or staff data.                                              |
| Server action/API | `placeOrder`, `cancelOrder`, cart actions, and order API handlers re-read the session at the write/read boundary. Customer reads, cart access, and cancellation require the appropriate customer/owner session; kitchen status updates and order deletions require the staff role. | Stale pages and forged requests cannot place/cancel/read orders as an unauthenticated or other user, or update/delete orders as a customer. |

## Session and authorization

Successful sign-in sets a signed session cookie with an eight-hour expiry. The cookie is `HttpOnly`, `SameSite=Lax`, and `Secure` in production. Sign-out clears it. Return destinations are restricted to local paths; external, protocol-relative, backslash-containing, and control-character destinations are rejected.

Middleware covers `/checkout/:path*` and `/Orders/:path*`. The pages also check the session on the server, preserving authorization if middleware is bypassed. Signup creates only customer accounts and signs each new account into its own user-ID-scoped session. Staff sign-in always redirects to `/kitchen`; staff do not claim anonymous carts, cannot access `/cart` or `/checkout`, and cannot create orders through the API. Cart actions also refuse staff sessions. `placeOrder` and `cancelOrder` independently check the session in their server actions. Order details are available only to the owner or staff; `/kitchen`, status updates, single-order deletion, and clear-all deletion check the staff role. Delete controls require an explicit confirmation step. Status values are restricted to `pending`, `delivering`, and `received`.

## Security checks performed

| Attack attempt                                                             | Expected protection                                                      | Observed result                                                                                  |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Read the session from browser JavaScript after sign-in.                    | HttpOnly session cookie.                                                 | `document.cookie` did not expose the session cookie.                                             |
| Sign in with `next=https://evil.example/`.                                 | Local-only return destination validation.                                | Returned to `/checkout`; did not navigate to the external host.                                  |
| Read another account's order through the API and tracking route.           | Owner-scoped lookup with not-found for non-owned records.                | The other account received `404` from both surfaces.                                             |
| Submit stale checkout place/cancel actions after signing out.              | Session and owner checks inside each server action.                      | Place action returned “Sign in before placing an order”; cancel action left the order unchanged. |
| Open `/kitchen` as a customer.                                             | Server-side staff-role check before listing orders.                      | Customer was denied; staff account could access the kitchen page.                                |
| Open another customer's `/Orders/[id]` route or status API.                | Order detail and status lookup allow only the owner or staff.            | A different customer receives `404`; staff can track the order.                                  |
| Submit a kitchen status change as a customer or with an unsupported value. | Server action checks the staff role and status allowlist before writing. | Customer submissions are ignored; only `pending`, `delivering`, and `received` are persisted.    |
| Create an order through the API without a session.                         | API handler session check.                                               | Request was rejected with `401`.                                                                 |
| Create an order through the API as staff.                                  | API accepts only customer sessions.                                      | Request is rejected with `403`.                                                                  |

To reproduce the browser checks, start the app with `npm run dev`, sign in using the development accounts, and inspect the protected routes and order APIs. Never use the demo credentials in production.

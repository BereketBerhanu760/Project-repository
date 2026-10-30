# Rendering and route strategy

Next.js App Router route groups organize the experience without changing the public URL paths:

| Route group | Routes | Strategy |
| --- | --- | --- |
| `(public)` | `/`, `/cars`, `/cars/[id]`, `/signin`, `/signup` | Landing and route shells are Server Components. Catalogue and account forms hydrate into the shared Client Component because they use browser records and interactions. |
| `(renter)` | `/dashboard`, `/bookings`, `/bookings/[id]`, `/bookings/[id]/track`, `/bookings/[id]/review`, `/checkout` | Client-rendered from localStorage/sessionStorage with role, ownership, and lifecycle checks. |
| `(owner)` | `/owner`, `/owner/cars`, `/owner/cars/new`, `/owner/cars/[id]/edit`, `/owner/cars/[id]/availability`, `/owner/cars/[id]/bookings`, `/owner/bookings`, `/owner/earnings`, `/owner/reviews`, `/owner/disputes` | Client-rendered from browser records, filtered to the signed-in owner. |
| `(admin)` | `/admin`, `/admin/listings`, `/admin/users`, `/admin/users/[id]`, `/admin/disputes`, `/admin/disputes/[id]`, `/admin/reports`, `/admin/announcements` | Client-rendered from browser records. `/admin/bookings` is omitted by product decision. |

Each route keeps its own `page.js`; route-group `layout.js` files establish separate public, renter, owner, and admin layout boundaries. The shared `DemoPage` Client Component currently renders interactive workspace navigation and content. The root layout owns global CSS and application metadata.

No ISR or server data fetching is used because records are stored in the browser. Dynamic car detail data is not available to server metadata generation. Browser storage is not cross-device or server-backed synchronization.

# Component and storage boundary

`src/app/layout.js` is the root Server Component and imports global CSS. The `(public)`, `(renter)`, `(owner)`, and `(admin)` App Router groups each have a nested Server Component layout; the groups do not alter route URLs. Individual route `page.js` files remain Server Components and pass route information to `src/components/demo-page.jsx`, a Client Component (`use client`).

Browser storage, session-aware navigation, form interactions, and state-changing actions run in client-side code. `src/lib/storage.js` is browser-only: it validates parsed records, provides safe defaults and recovery messages, and keeps durable collections in localStorage while session and checkout draft values use sessionStorage. `src/lib/metrics.js` derives dashboard figures from those records. The server components and layouts do not read browser storage.

The layouts establish route boundaries, not security boundaries. Role and ownership checks remain frontend demonstrations because local browser data can be edited. There is no database, API, Server Action, or Route Handler. A server-backed version needs deliberate APIs and server-side authorization.

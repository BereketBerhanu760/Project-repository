# Demo data and persistence

Car seeds live in `src/lib/seed-cars.js`. Demo users, bookings, reviews, disputes, and announcements are seeded in `src/components/demo-page.jsx`. Records are plain JavaScript objects with stable IDs. Dates use `YYYY-MM-DD`; timestamps use ISO date-time strings.

| Key | Storage | Contents |
| --- | --- | --- |
| `sw_users_v1` | localStorage | Demo users, roles, and account status; email addresses must be unique. |
| `sw_cars_v1` | localStorage | Listings, moderation status, photo paths, and availability. |
| `sw_bookings_v1` | localStorage | Booking snapshots, prices, dates, mock payment status, and lifecycle status. |
| `sw_reviews_v1` | localStorage | Eligible renter reviews and owner replies. |
| `sw_disputes_v1` | localStorage | Disputes and admin resolution notes. |
| `sw_announcements_v1` | localStorage | Admin-created announcements and active status. |
| `sw_session_v1` | sessionStorage | Current demo user ID and minimal session metadata. |
| `sw_checkout_draft_v1` | sessionStorage | Temporary selected dates and checkout summary. |

`src/lib/storage.js` exposes `read*`, `write*`, and clear helpers for every collection, plus checkout draft, session, and booking-presence helpers. Reads parse JSON safely and validate required entity fields, identifiers, ISO booking dates, allowed status values, value shapes, and unique user emails. Invalid or unreadable records return safe defaults with a recovery message. Writes reject malformed shapes and sensitive fields such as passwords and payment credentials. Recovery replaces an invalid collection with its safe default and startup seed behavior; browser data is not treated as a database.

`src/lib/auth.js` provides demo session and role helpers. `src/lib/auth-guardrails.mjs` contains the reusable role, ownership, state, and safe-return checks. `src/lib/metrics.js` derives per-car monthly booking value and utilization. `src/lib/format.js` provides ETB/USD currency, date, and relative-time formatting. Booking records preserve the agreed rate and total; active date overlaps are checked before request or approval.

No passwords or payment credentials are stored. Browser storage is user-editable and changes do not synchronize across devices or tabs through a server.

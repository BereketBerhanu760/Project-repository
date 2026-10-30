# Sheggar Wheels

A frontend capstone demo for browsing premium rental cars and simulating renter, owner, and admin workflows. The application uses Next.js App Router and browser storage; it has no backend, real payment processing, or production authentication.

## Run locally

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Other available scripts:

- `npm run lint` checks the project with ESLint.
- `npm test` runs the existing Node test suite.
- `npm run build` creates a production build.

## Demo accounts

Choose the seeded account in the sign-in screen:

- Renter: `renter@sheggarwheels.demo`
- Owner: `owner@sheggarwheels.demo`
- Admin: `admin@sheggarwheels.demo`

These are simulated identities. Do not use real passwords or personal information. Admin role selection is restricted to the seeded demo account.

## Main areas

- Public: landing page, car catalogue, vehicle detail, sign-in, and sign-up.
- Renter: dashboard, bookings, receipt, simulated trip route, review form, and checkout.
- Owner: dashboard, fleet, listing form, availability, bookings, earnings, reviews, and disputes.
- Admin: dashboard, listing moderation, user management, disputes, reports, and announcements. The separate admin bookings page is intentionally omitted.

The catalogue supports text search, category and price filters, seats, transmission, neighbourhood, date availability, sorting, pagination, and shareable URL filters. Car photos use local files under `public/images`; detail pages include an approximate OpenStreetMap embed when coordinates are available. Admin reports include an adjustable, illustrative commission estimate; the project does not collect platform fees.

## Screenshots

Add current screenshots of the public catalogue, renter flow, owner workspace, and admin reports before portfolio submission.

## Data and safety

Car seeds live in `src/lib/seed-cars.js`; demo account, booking, review, dispute, and announcement seeds are in `src/components/demo-page.jsx`. User changes are stored in browser `localStorage`; temporary session and checkout state use `sessionStorage`. Clearing site data resets this browser’s demo records. Storage parsing includes safe fallbacks, but local browser data is editable and is not a security boundary.

Checkout and trip tracking are simulations only. The UI never requests payment credentials, and the route preview does not use GPS. Review [AUTH.md](AUTH.md), [DATA.md](DATA.md), [BOUNDARY.md](BOUNDARY.md), and [STRATEGY.md](STRATEGY.md) for implementation details and constraints.

## Deployment

The project is not deployed by this repository workflow. Add the production URL after deployment, then verify the deployed app and browser-storage behavior in a fresh browser session.

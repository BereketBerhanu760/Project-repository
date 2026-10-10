# Server and Client Boundaries

| Component or module                 | Runs on       | Reason                                                                                                                                     |
| ----------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/app/page.js`                   | Server        | Static home content and dish previews need no browser state.                                                                               |
| `src/app/layout.js`                 | Server        | Owns metadata, navigation, and shell; passes server-rendered route content as `children`.                                                  |
| `src/app/providers.jsx`             | Client        | Deliberate provider boundary; currently passes server-rendered children through without moving their implementation client-side.           |
| `src/app/menu/page.js`              | Server        | Reads query params and filters shared data on the server.                                                                                  |
| `src/app/menu/layout.js`            | Server        | Composes the menu sidebar and nested route content.                                                                                        |
| `src/app/menu/CategoryBar.jsx`      | Client        | Isolates menu category navigation behavior; server-rendered `DishList` is passed as `children`.                                            |
| `src/app/menu/DishList.jsx`         | Server        | Renders the server-selected dish collection without client state.                                                                          |
| `src/app/menu/[id]/page.js`         | Server        | Uses route params and static dish data to render generated detail pages.                                                                   |
| `src/app/menu/error.js`             | Client        | Next.js error boundaries require a client component for the reset interaction.                                                             |
| `src/app/menu/loading.js`           | Server        | Displays the menu segment loading state.                                                                                                   |
| `src/app/cart/page.js`              | Server        | Reads validated cart-cookie entries, computes line totals from menu data, and renders server-action forms.                                 |
| `src/app/cart/actions.js`           | Server action | Validates menu IDs and updates the HTTP-only cart cookie.                                                                                  |
| `src/app/checkout/page.js`          | Server        | Reads the session and stored orders, then renders server action forms.                                                                     |
| `src/app/checkout/CheckoutForm.jsx` | Client        | Uses React `useActionState` for pending and validation feedback; the form action remains server-side and supports progressive enhancement. |
| `src/app/checkout/actions.js`       | Server action | Validates input, reads session state, mutates order storage, authorizes cancellation, and revalidates checkout.                            |
| `src/app/api/**/route.js`           | Server        | Route handlers return JSON and use server-only schema/data/storage modules.                                                                |
| `src/lib/**`                        | Server        | Shared cart, schema, session, and persistent order-store implementation; never imported by client modules.                                 |

There are four client component modules: `Providers`, `CategoryBar`, `MenuError`, and `CheckoutForm`. Server-rendered children remain server-rendered when passed through client boundaries; no server component is imported into a client module.

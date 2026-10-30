# Future work and limitations

- Deploy the frontend, record the live URL, and test it in a fresh browser session.
- Replace localStorage with a database and validated API before real users or cross-device use.
- Implement real authentication, server-side authorization, conflict-safe booking transactions, and payment processing only with a secure backend.
- The car detail map uses an OpenStreetMap embed centered on seeded approximate coordinates. A provider with a documented privacy/tile policy may be selected for production. The trip route remains simulated and does not track vehicles.
- Add real notifications, audit history, insurance and identity verification, cancellation policies, and operational dispute handling.
- Recovery currently falls back at the collection level; consider preserving valid sibling records when one record is malformed.
- Add app-level integration tests for persisted writes and role workflows, plus accessibility and mobile checks.

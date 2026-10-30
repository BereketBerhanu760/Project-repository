# Demo authentication and guardrails

Sign-in is a frontend demonstration. Password fields are not stored or checked. Seeded demo accounts are available in the sign-in UI. Public signup can create renter or renter-plus-owner capabilities; admin is only the seeded demo admin.

Session data is stored in sessionStorage as a demo user ID and minimal metadata. User records are read from localStorage. Sign-out clears the session and checkout draft. `safeReturnPath` rejects external and malformed return URLs. Suspended accounts are blocked. Protected actions check the current session, role, record ownership, and permitted state before writing.

Automated helper tests cover signed-out writes, cross-renter cancellation, unsafe return paths, owner car ownership, and renter booking ownership (`tests/auth-guardrails.test.mjs`). These are UI guardrails only. Browser storage can be edited by the user; this is not production security.

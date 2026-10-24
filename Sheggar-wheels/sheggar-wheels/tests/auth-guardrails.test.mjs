import test from "node:test";
import assert from "node:assert/strict";
import { authorizeDemoAction, safeInternalPath } from "../src/lib/auth-guardrails.mjs";

const renter = { id: "renter-a", roles: ["renter"], status: "Active" };
const sessionFor = (id) => ({ userId: id });

test("signed-out booking attempt reports Not signed in and does not write", () => {
  let writes = 0;
  const access = authorizeDemoAction({ session: null, user: null, role: "renter" });
  if (access.ok) writes += 1;
  assert.equal(access.message, "Not signed in.");
  assert.equal(writes, 0);
});

test("renter cannot cancel another renter's booking", () => {
  const before = { id: "booking-b", renterId: "renter-b", status: "requested" };
  const booking = { ...before };
  const access = authorizeDemoAction({ session: sessionFor(renter.id), user: renter, role: "renter", record: booking, ownerField: "renterId", allowedStates: ["requested"], nextState: "cancelled" });
  if (access.ok) booking.status = "cancelled";
  assert.equal(access.message, "Not yours.");
  assert.deepEqual(booking, before);
});

test("unsafe external next URL falls back to landing page", () => {
  assert.equal(safeInternalPath("https://example.com"), "/");
  assert.equal(safeInternalPath("//example.com"), "/");
});

test("owner cannot edit another owner's car", () => {
  const access = authorizeDemoAction({ session: sessionFor("owner-a"), user: { id: "owner-a", roles: ["owner"], status: "Active" }, role: "owner", record: { ownerId: "owner-b" }, ownerField: "ownerId" });
  assert.equal(access.message, "Not yours.");
});

test("renter cannot view another renter's booking", () => {
  const access = authorizeDemoAction({ session: sessionFor("renter-a"), user: renter, role: "renter", record: { renterId: "renter-b" }, ownerField: "renterId" });
  assert.equal(access.message, "Not yours.");
});

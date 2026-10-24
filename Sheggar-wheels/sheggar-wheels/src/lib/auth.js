import { clearCheckoutDraft, clearSession, readSession, readUsers, writeSession } from "@/lib/storage";
import { authorizeDemoAction, safeInternalPath } from "@/lib/auth-guardrails.mjs";

/** Browser-only demo authentication. This is a UI guardrail, not real security. */
export function safeReturnPath(value) {
  return safeInternalPath(value, typeof window === "undefined" ? "https://demo.invalid" : window.location.origin);
}

export function getCurrentSession() {
  const storedSession = readSession().data;
  if (!storedSession.userId) return { session: { userId: null, metadata: {} }, user: null };
  const user = readUsers().data.find((record) => record.id === storedSession.userId) || null;
  if (!user) return { session: { userId: null, metadata: {} }, user: null };
  const roles = [...new Set((user.roles || (user.role ? [user.role] : [])).map((role) => String(role).toLowerCase()))];
  if (roles.includes("owner") && !roles.includes("renter")) roles.push("renter");
  return { session: { userId: user.id, metadata: { name: user.name || "Demo user", roles } }, user };
}

export function signInAsDemo(userId) {
  const user = readUsers().data.find((record) => record.id === userId);
  if (!user) return { ok: false, message: "Demo account was not found." };
  if (String(user.status).toLowerCase() === "suspended") return { ok: false, message: "This demo account is suspended. Contact an administrator to restore access." };
  const roles = [...new Set((user.roles || (user.role ? [user.role] : [])).map((role) => String(role).toLowerCase()))];
  if (roles.includes("owner") && !roles.includes("renter")) roles.push("renter");
  return writeSession({ userId: user.id, metadata: { name: user.name || "Demo user", roles } });
}

export function signOut() {
  const sessionResult = clearSession();
  const draftResult = clearCheckoutDraft();
  return sessionResult.ok ? draftResult : sessionResult;
}

export function hasRole(role) {
  const { session, user } = getCurrentSession();
  return authorizeDemoAction({ session, user, role }).ok;
}

export function requireRole(role) {
  const { session, user } = getCurrentSession();
  return authorizeDemoAction({ session, user, role });
}

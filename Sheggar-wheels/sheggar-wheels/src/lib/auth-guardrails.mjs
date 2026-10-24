export function safeInternalPath(value, origin = "https://demo.invalid") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  try {
    const target = new URL(value, origin);
    if (target.origin !== origin || ["/signin", "/signup"].includes(target.pathname)) return "/";
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/";
  }
}

export function authorizeDemoAction({ session, user, role, record, ownerField, allowedStates, nextState }) {
  if (!session?.userId || !user || user.id !== session.userId) return { ok: false, message: "Not signed in." };
  if (String(user.status).toLowerCase() === "suspended") return { ok: false, message: "This demo account is suspended. No actions are available." };
  const roles = (user.roles || (user.role ? [user.role] : [])).map((item) => String(item).toLowerCase());
  if (roles.includes("owner") && !roles.includes("renter")) roles.push("renter");
  if (role && !roles.includes(String(role).toLowerCase())) return { ok: false, message: `This action requires the ${role} role.` };
  if (record && ownerField && record[ownerField] !== session.userId) return { ok: false, message: "Not yours." };
  if (allowedStates && !allowedStates.includes(record?.status)) return { ok: false, message: "This record is not in a state that allows this action." };
  if (nextState && !allowedStates?.includes(nextState)) return { ok: false, message: "This state change is not allowed." };
  return { ok: true, user, session };
}

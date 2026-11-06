export function displayStatus(value) {
  return String(value || "pending").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function normalizeRoles(user) {
  const source = user?.roles || (user?.role ? [user.role] : []);
  const roles = source.map((role) => String(role).toLowerCase());
  if (roles.includes("owner") && !roles.includes("renter")) roles.push("renter");
  return [...new Set(roles)];
}

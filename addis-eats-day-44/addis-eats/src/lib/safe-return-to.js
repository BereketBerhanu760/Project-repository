export function getSafeReturnTo(value) {
  if (
    typeof value === "string"
    && value.startsWith("/")
    && !value.startsWith("//")
    && !value.includes("\\")
    && !/[\u0000-\u001f]/.test(value)
  ) {
    return value;
  }

  return "/checkout";
}

export function appendSearchParams(path, searchParams) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (Array.isArray(value)) {
      for (const item of value) query.append(key, item);
    } else if (value !== undefined) {
      query.set(key, value);
    }
  }

  const serializedQuery = query.toString();
  return serializedQuery ? `${path}?${serializedQuery}` : path;
}

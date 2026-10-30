const dateFormatter = new Intl.DateTimeFormat("en-ET", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatCurrency(amount, currency = "ETB", locale = "en-ET") {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatETB(amount) {
  return formatCurrency(amount, "ETB");
}

export function formatUSD(amount) {
  return formatCurrency(amount, "USD", "en-US");
}

export function formatDate(value, options = {}) {
  if (!value) return "—";
  const date = value instanceof Date
    ? value
    : new Date(typeof value === "string" && value.length === 10 ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return "—";
  if (options.relative) return formatRelativeTime(date, options.now);
  return dateFormatter.format(date);
}

export function formatRelativeTime(value, now = new Date()) {
  if (!value) return "—";
  const date = value instanceof Date
    ? value
    : new Date(typeof value === "string" && value.length === 10 ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return "—";
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const units = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.345, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];
  let amount = seconds;
  let unit = "second";
  for (const [threshold, nextUnit] of units) {
    unit = nextUnit;
    if (Math.abs(amount) < threshold) break;
    amount /= threshold;
  }
  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(Math.round(amount), unit);
}

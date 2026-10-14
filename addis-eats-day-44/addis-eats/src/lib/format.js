const ADDIS_TIME_ZONE = "Africa/Addis_Ababa";

export function etb(value) {
  const amount = Number(value);
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    currencyDisplay: "code",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function when(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time unavailable";
  return new Intl.DateTimeFormat("en-ET", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: ADDIS_TIME_ZONE,
  }).format(date);
}

export function relative(value, now = Date.now()) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "time unavailable";

  const seconds = Math.round((date.getTime() - now) / 1000);
  const absoluteSeconds = Math.abs(seconds);
  const [unit, size] = absoluteSeconds < 60
    ? ["second", 1]
    : absoluteSeconds < 60 * 60
      ? ["minute", 60]
      : absoluteSeconds < 24 * 60 * 60
        ? ["hour", 60 * 60]
        : absoluteSeconds < 7 * 24 * 60 * 60
          ? ["day", 24 * 60 * 60]
          : ["week", 7 * 24 * 60 * 60];

  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(Math.round(seconds / size), unit);
}

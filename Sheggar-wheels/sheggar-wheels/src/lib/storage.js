/**
 * Browser-only persistence for the frontend demo. Call these methods from
 * Client Components or browser event handlers; Server Components and server
 * actions cannot read localStorage or sessionStorage.
 *
 * Values are JSON encoded. Reads validate the stored shape and return a safe
 * fallback with a recovery message when data is malformed or unavailable.
 * Passwords, payment credentials, and secrets are rejected before writing.
 */

export const STORAGE_KEYS = Object.freeze({
  users: "sw_users_v1",
  cars: "sw_cars_v1",
  bookings: "sw_bookings_v1",
  reviews: "sw_reviews_v1",
  disputes: "sw_disputes_v1",
  announcements: "sw_announcements_v1",
  session: "sw_session_v1",
  checkoutDraft: "sw_checkout_draft_v1",
});

const COLLECTION_DEFAULT = () => [];
const SESSION_DEFAULT = () => ({ userId: null, metadata: {} });
const CHECKOUT_DEFAULT = () => ({ selectedDates: null, summary: null });

const collectionValidator = (value) =>
  Array.isArray(value) && value.every(isPlainObject);

const validators = {
  users: collectionValidator,
  cars: collectionValidator,
  bookings: collectionValidator,
  reviews: collectionValidator,
  disputes: collectionValidator,
  announcements: collectionValidator,
  session: (value) =>
    isPlainObject(value) &&
    (value.userId === null || typeof value.userId === "string") &&
    isPlainObject(value.metadata),
  checkoutDraft: (value) =>
    isPlainObject(value) &&
    Object.hasOwn(value, "selectedDates") &&
    Object.hasOwn(value, "summary"),
};

const defaults = {
  users: COLLECTION_DEFAULT,
  cars: COLLECTION_DEFAULT,
  bookings: COLLECTION_DEFAULT,
  reviews: COLLECTION_DEFAULT,
  disputes: COLLECTION_DEFAULT,
  announcements: COLLECTION_DEFAULT,
  session: SESSION_DEFAULT,
  checkoutDraft: CHECKOUT_DEFAULT,
};

const storageAreas = {
  users: "localStorage",
  cars: "localStorage",
  bookings: "localStorage",
  reviews: "localStorage",
  disputes: "localStorage",
  announcements: "localStorage",
  session: "sessionStorage",
  checkoutDraft: "sessionStorage",
};

const sensitiveProperty =
  /password|passphrase|secret|credential|token|access.?key|private.?key|cvv|card.?number|payment.?method/i;

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function containsSensitiveOrUnsupportedData(value, seen = new WeakSet()) {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  ) {
    return false;
  }

  if (typeof value !== "object" || seen.has(value)) {
    return true;
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return value.some((item) => containsSensitiveOrUnsupportedData(item, seen));
  }

  if (!isPlainObject(value)) {
    return true;
  }

  return Object.entries(value).some(
    ([key, item]) =>
      sensitiveProperty.test(key) || containsSensitiveOrUnsupportedData(item, seen),
  );
}

function getBrowserStorage(area) {
  if (typeof window === "undefined") {
    return null;
  }

  return window[area];
}

function recovery(message, key) {
  return {
    data: defaults[key](),
    recovered: true,
    message,
  };
}

function read(key) {
  const area = storageAreas[key];

  try {
    const storage = getBrowserStorage(area);
    if (!storage) {
      return recovery("Browser storage is unavailable. Using safe default data.", key);
    }

    const stored = storage.getItem(STORAGE_KEYS[key]);
    if (stored === null) {
      return { data: defaults[key](), recovered: false, message: null };
    }

    const data = JSON.parse(stored);
    if (!validators[key](data)) {
      return recovery(
        `Saved ${key} data is invalid. Using safe defaults; clear or replace it to recover.`,
        key,
      );
    }

    return { data, recovered: false, message: null };
  } catch {
    return recovery(
      `Saved ${key} data could not be read. Using safe defaults; clear or replace it to recover.`,
      key,
    );
  }
}

function write(key, value) {
  if (!validators[key](value)) {
    return {
      ok: false,
      message: `The ${key} data has an invalid shape and was not saved.`,
    };
  }

  if (containsSensitiveOrUnsupportedData(value)) {
    return {
      ok: false,
      message:
        "This data contains unsupported or sensitive fields and was not saved. Passwords, payment credentials, and secrets cannot be stored.",
    };
  }

  try {
    const storage = getBrowserStorage(storageAreas[key]);
    if (!storage) {
      return { ok: false, message: "Browser storage is unavailable; data was not saved." };
    }

    storage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
    return { ok: true, message: null };
  } catch {
    return { ok: false, message: "Browser storage could not save the data." };
  }
}

function clear(key) {
  try {
    const storage = getBrowserStorage(storageAreas[key]);
    if (!storage) {
      return { ok: false, message: "Browser storage is unavailable; data was not cleared." };
    }

    storage.removeItem(STORAGE_KEYS[key]);
    return { ok: true, message: null };
  } catch {
    return { ok: false, message: "Browser storage could not clear the data." };
  }
}

export const readUsers = () => read("users");
export const writeUsers = (value) => write("users", value);
export const clearUsers = () => clear("users");

export const readCars = () => read("cars");
export const writeCars = (value) => write("cars", value);
export const clearCars = () => clear("cars");

export const readBookings = () => read("bookings");
export const writeBookings = (value) => write("bookings", value);
export const clearBookings = () => clear("bookings");

export const readReviews = () => read("reviews");
export const writeReviews = (value) => write("reviews", value);
export const clearReviews = () => clear("reviews");

export const readDisputes = () => read("disputes");
export const writeDisputes = (value) => write("disputes", value);
export const clearDisputes = () => clear("disputes");

export const readAnnouncements = () => read("announcements");
export const writeAnnouncements = (value) => write("announcements", value);
export const clearAnnouncements = () => clear("announcements");

export const readSession = () => read("session");
export const writeSession = (value) => write("session", value);
export const clearSession = () => clear("session");

export const readCheckoutDraft = () => read("checkoutDraft");
export const writeCheckoutDraft = (value) => write("checkoutDraft", value);
export const clearCheckoutDraft = () => clear("checkoutDraft");

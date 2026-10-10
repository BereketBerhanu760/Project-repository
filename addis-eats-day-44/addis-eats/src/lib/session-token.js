const developmentSecret = "addis-eats-local-development-session-key";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 32) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be configured with at least 32 characters.");
  }

  return developmentSecret;
}

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function fromBase64Url(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function signingKey() {
  return globalThis.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signSessionToken(session) {
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify(session)));
  const signature = await globalThis.crypto.subtle.sign(
    "HMAC",
    await signingKey(),
    new TextEncoder().encode(payload)
  );
  return `${payload}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token) {
  if (typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;

  let payloadBytes;
  let signatureBytes;
  try {
    payloadBytes = fromBase64Url(parts[0]);
    signatureBytes = fromBase64Url(parts[1]);
  } catch {
    return null;
  }

  const isValid = await globalThis.crypto.subtle.verify(
    "HMAC",
    await signingKey(),
    signatureBytes,
    new TextEncoder().encode(parts[0])
  );
  if (!isValid) return null;

  let session;
  try {
    session = JSON.parse(new TextDecoder().decode(payloadBytes));
  } catch {
    return null;
  }

  if (
    !session
    || typeof session !== "object"
    || Array.isArray(session)
    || typeof session.id !== "string"
    || typeof session.username !== "string"
    || !["customer", "staff"].includes(session.role)
    || !Number.isFinite(session.expiresAt)
    || session.expiresAt <= Date.now()
  ) {
    return null;
  }

  return session;
}

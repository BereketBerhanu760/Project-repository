import "server-only";

import { cookies } from "next/headers";
import { signSessionToken, verifySessionToken } from "@/lib/session-token";

const sessionCookie = "session";
const sessionLifetimeSeconds = 60 * 60 * 8;

export function isSecureRequest() {
  return process.env.NODE_ENV === "production";
}

export async function setSession(user) {
  const session = {
    id: user.id,
    username: user.username,
    role: user.role,
    expiresAt: Date.now() + sessionLifetimeSeconds * 1000,
  };
  const token = await signSessionToken(session);

  (await cookies()).set(sessionCookie, token, {
    httpOnly: true,
    secure: isSecureRequest(),
    sameSite: "lax",
    path: "/",
    maxAge: sessionLifetimeSeconds,
  });

  return session;
}

export async function getSession() {
  const token = (await cookies()).get(sessionCookie)?.value;
  return token ? verifySessionToken(token) : null;
}

export async function clearSession() {
  (await cookies()).delete(sessionCookie);
}

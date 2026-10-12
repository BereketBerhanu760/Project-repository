import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/session-token";

export async function middleware(request) {
  const token = request.cookies.get("session")?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (session) return NextResponse.next();

  const signInUrl = new URL("/signin", request.url);
  signInUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  const response = NextResponse.redirect(signInUrl);
  if (token) response.cookies.delete("session");
  return response;
}

export const config = {
  matcher: ["/checkout/:path*", "/Orders/:path*", "/kitchen/:path*"],
};
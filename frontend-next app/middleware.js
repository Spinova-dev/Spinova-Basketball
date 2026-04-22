import { NextResponse } from "next/server";
import { decodeSession, getSessionCookieName } from "@/lib/auth";

const protectedPrefixes = ["/admin", "/coach", "/player"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (!protectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(getSessionCookieName())?.value;
  const session = decodeSession(token);
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!pathname.startsWith(`/${session.role}`)) {
    return NextResponse.redirect(new URL(`/${session.role}/dashboard`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/coach/:path*", "/player/:path*"]
};

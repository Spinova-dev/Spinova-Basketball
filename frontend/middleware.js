import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "./auth.config";

const { auth: edgeAuth } = NextAuth(authConfig);

const protectedPrefixes = ["/admin", "/coach", "/player"];

export default edgeAuth((req) => {
  const { pathname } = req.nextUrl;

  if (!protectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const session = req.auth;
  if (!session?.user) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  const role = session.user.role || "player";
  if (!pathname.startsWith(`/${role}`)) {
    return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/coach/:path*", "/player/:path*"]
};

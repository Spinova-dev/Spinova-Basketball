import { cookies } from "next/headers";
import { createSignupIntentValue, SIGNUP_INTENT_COOKIE } from "@/lib/signup-intent";

export async function POST(request) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return Response.json({ error: "AUTH_SECRET is not set" }, { status: 500 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.intent !== "admin") {
    return Response.json({ error: "Only admin signup intent is supported" }, { status: 400 });
  }

  const value = createSignupIntentValue("admin", secret);
  if (!value) {
    return Response.json({ error: "Could not create intent" }, { status: 500 });
  }

  cookies().set(SIGNUP_INTENT_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
    secure: process.env.NODE_ENV === "production"
  });

  // OAuth source slug in Authentik (Directory → Sources). When set, the client passes
  // `source` on the OIDC authorize request so Authentik can jump straight to that IdP
  // (e.g. Google) instead of only showing the email field. Requires a recent Authentik.
  const authentikSourceSlug = (process.env.AUTH_AUTHENTIK_SOURCE_SLUG || "").trim() || null;

  return Response.json({ ok: true, authentikSourceSlug });
}

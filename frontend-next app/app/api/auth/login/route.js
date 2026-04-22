import { cookies } from "next/headers";
import { encodeSession, getSessionCookieName, validateDemoUser } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json();
  const user = validateDemoUser(body.email, body.password);

  if (!user) {
    return Response.json({ error: "Incorrect email or password" }, { status: 401 });
  }

  cookies().set(getSessionCookieName(), encodeSession(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });

  return Response.json({ ok: true, user });
}

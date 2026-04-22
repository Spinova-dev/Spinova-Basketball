import { cookies } from "next/headers";
import { decodeSession, getSessionCookieName } from "@/lib/auth";

export async function GET() {
  const token = cookies().get(getSessionCookieName())?.value;
  const user = decodeSession(token);
  if (!user) return Response.json({ authenticated: false }, { status: 401 });
  return Response.json({ authenticated: true, user });
}

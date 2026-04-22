import { cookies } from "next/headers";
import { getSessionCookieName } from "@/lib/auth";

export async function POST() {
  cookies().set(getSessionCookieName(), "", { expires: new Date(0), path: "/" });
  return Response.json({ ok: true });
}

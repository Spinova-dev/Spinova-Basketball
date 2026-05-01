import { cookies } from "next/headers";

const COOKIE_NAME = "spinova_signup_role";
const ALLOWED_ROLES = new Set(["admin", "coach", "player"]);

export async function POST(request) {
  try {
    const body = await request.json();
    const role = String(body?.role || "").trim().toLowerCase();
    if (!ALLOWED_ROLES.has(role)) {
      return Response.json({ ok: false, error: "Invalid role." }, { status: 400 });
    }

    cookies().set({
      name: COOKIE_NAME,
      value: role,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 10
    });
    return Response.json({ ok: true, role });
  } catch {
    return Response.json({ ok: false, error: "Invalid payload." }, { status: 400 });
  }
}

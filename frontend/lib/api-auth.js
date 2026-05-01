import { auth } from "@/auth";

export async function requireRole(allowedRoles = []) {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, response: Response.json({ error: "Authentication required." }, { status: 401 }) };
  }
  const role = session.user.role || "player";
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return { ok: false, response: Response.json({ error: "Forbidden." }, { status: 403 }) };
  }
  return { ok: true, session, role };
}

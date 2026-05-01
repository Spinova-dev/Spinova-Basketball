import { postgrestFetch } from "@/lib/postgrest";
import { requireRole } from "@/lib/api-auth";

export async function GET() {
  const gate = await requireRole(["admin", "coach", "player"]);
  if (!gate.ok) return gate.response;

  const role = gate.role;
  const userId = gate.session.user.appUserId;

  let query = "/reports?select=id,title,status,created_at,team_id,teams(name),created_by&order=created_at.desc&limit=50";
  if (role === "player" && userId) {
    query += `&created_by=eq.${encodeURIComponent(userId)}`;
  }
  const rows = await postgrestFetch(query);
  return Response.json({ items: rows || [] });
}

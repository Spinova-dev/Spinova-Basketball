import { postgrestFetch } from "@/lib/postgrest";
import { requireRole } from "@/lib/api-auth";

export async function GET() {
  const gate = await requireRole(["admin", "coach", "player"]);
  if (!gate.ok) return gate.response;

  const rows = await postgrestFetch(
    "/players?select=id,first_name,last_name,position,status,team_id,teams(name)&order=created_at.desc"
  );
  return Response.json({ items: rows || [] });
}

export async function POST(request) {
  const gate = await requireRole(["admin", "coach"]);
  if (!gate.ok) return gate.response;

  const body = await request.json();
  const created = await postgrestFetch("/players?select=*", {
    method: "POST",
    body: {
      first_name: body.firstName,
      last_name: body.lastName,
      position: body.position || null,
      status: body.status || "active",
      team_id: body.teamId || null
    }
  });
  return Response.json({ item: Array.isArray(created) ? created[0] : created });
}

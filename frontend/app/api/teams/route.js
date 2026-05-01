import { postgrestFetch } from "@/lib/postgrest";
import { requireRole } from "@/lib/api-auth";

export async function GET() {
  const gate = await requireRole(["admin", "coach", "player"]);
  if (!gate.ok) return gate.response;

  const rows = await postgrestFetch("/teams?select=id,name,season_label,level,is_active&order=created_at.desc");
  return Response.json({ items: rows || [] });
}

export async function POST(request) {
  const gate = await requireRole(["admin"]);
  if (!gate.ok) return gate.response;

  const body = await request.json();
  const created = await postgrestFetch("/teams?select=*", {
    method: "POST",
    body: {
      name: body.name,
      season_label: body.seasonLabel || null,
      level: body.level || null,
      is_active: body.isActive !== false
    }
  });
  return Response.json({ item: Array.isArray(created) ? created[0] : created });
}

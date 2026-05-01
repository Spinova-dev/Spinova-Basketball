import { postgrestFetch } from "@/lib/postgrest";
import { requireRole } from "@/lib/api-auth";

export async function PATCH(request, { params }) {
  const gate = await requireRole(["admin"]);
  if (!gate.ok) return gate.response;

  const body = await request.json();
  const id = encodeURIComponent(params.id);
  const updated = await postgrestFetch(`/teams?id=eq.${id}&select=*`, {
    method: "PATCH",
    body: {
      name: body.name,
      season_label: body.seasonLabel,
      level: body.level,
      is_active: body.isActive
    }
  });
  return Response.json({ item: Array.isArray(updated) ? updated[0] : updated });
}

export async function DELETE(_request, { params }) {
  const gate = await requireRole(["admin"]);
  if (!gate.ok) return gate.response;

  const id = encodeURIComponent(params.id);
  await postgrestFetch(`/teams?id=eq.${id}`, { method: "DELETE" });
  return Response.json({ ok: true });
}

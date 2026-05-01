import { postgrestFetch } from "@/lib/postgrest";
import { requireRole } from "@/lib/api-auth";

export async function PATCH(request, { params }) {
  const gate = await requireRole(["admin", "coach", "player"]);
  if (!gate.ok) return gate.response;

  const body = await request.json();
  const id = encodeURIComponent(params.id);
  const updated = await postgrestFetch(`/reports?id=eq.${id}&select=*`, {
    method: "PATCH",
    body: {
      title: body.title,
      summary: body.summary,
      status: body.status
    }
  });
  return Response.json({ item: Array.isArray(updated) ? updated[0] : updated });
}

export async function DELETE(_request, { params }) {
  const gate = await requireRole(["admin"]);
  if (!gate.ok) return gate.response;

  const id = encodeURIComponent(params.id);
  await postgrestFetch(`/reports?id=eq.${id}`, { method: "DELETE" });
  return Response.json({ ok: true });
}

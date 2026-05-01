import { requireRole } from "@/lib/api-auth";
import { postgrestFetch } from "@/lib/postgrest";

export async function POST(request) {
  const gate = await requireRole(["player", "coach"]);
  if (!gate.ok) return gate.response;

  const body = await request.json();
  const created = await postgrestFetch("/reports?select=*", {
    method: "POST",
    body: {
      created_by: gate.session.user.appUserId,
      report_type: body.reportType || "custom",
      title: body.title || "Requested report",
      summary: body.summary || null,
      source_video_url: body.youtubeUrl || null,
      status: "draft"
    }
  });

  return Response.json({ item: Array.isArray(created) ? created[0] : created });
}

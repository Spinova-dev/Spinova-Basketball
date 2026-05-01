import { requireRole } from "@/lib/api-auth";
import { postgrestFetch } from "@/lib/postgrest";

export async function GET() {
  const gate = await requireRole(["player", "coach"]);
  if (!gate.ok) return gate.response;

  const userId = gate.session.user.appUserId;
  if (!userId) {
    return Response.json({ error: "Missing app user id." }, { status: 400 });
  }

  if (gate.role === "player") {
    const rows = await postgrestFetch(
      `/players?user_id=eq.${encodeURIComponent(userId)}&select=id,first_name,last_name,position,date_of_birth,height_cm,weight_kg,dominant_hand,status,team_id,teams(name),users(avatar_url,full_name)&limit=1`
    );
    return Response.json({ role: "player", item: rows?.[0] || null });
  }

  const rows = await postgrestFetch(
    `/coaches?user_id=eq.${encodeURIComponent(userId)}&select=id,first_name,last_name,email,phone,specialization,status,team_id,teams(name),users(avatar_url,full_name)&limit=1`
  );
  return Response.json({ role: "coach", item: rows?.[0] || null });
}

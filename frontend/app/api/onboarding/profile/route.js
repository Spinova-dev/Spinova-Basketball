import { requireRole } from "@/lib/api-auth";
import { postgrestFetch } from "@/lib/postgrest";

function splitFullName(fullName) {
  const clean = String(fullName || "").trim().replace(/\s+/g, " ");
  if (!clean) return { firstName: "", lastName: "" };
  const parts = clean.split(" ");
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" ")
  };
}

export async function POST(request) {
  const gate = await requireRole(["player", "coach"]);
  if (!gate.ok) return gate.response;

  const userId = gate.session.user.appUserId;
  if (!userId) {
    return Response.json({ error: "Missing app user id." }, { status: 400 });
  }

  const body = await request.json();
  const fullName = String(body.fullName || "").trim();
  if (!fullName) {
    return Response.json({ error: "Full name is required." }, { status: 400 });
  }

  const { firstName, lastName } = splitFullName(fullName);
  const role = gate.role;
  const avatarUrl = typeof body.avatarUrl === "string" && body.avatarUrl.startsWith("data:image/")
    ? body.avatarUrl
    : null;

  await postgrestFetch(`/users?id=eq.${encodeURIComponent(userId)}&select=id`, {
    method: "PATCH",
    body: {
      full_name: fullName,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {})
    }
  });

  if (role === "player") {
    const existing = await postgrestFetch(`/players?user_id=eq.${encodeURIComponent(userId)}&select=id&limit=1`);
    const payload = {
      user_id: userId,
      first_name: firstName,
      last_name: lastName,
      position: body.position || null,
      date_of_birth: body.dateOfBirth || null,
      height_cm: body.heightCm || null,
      weight_kg: body.weightKg || null,
      dominant_hand: body.dominantHand || null,
      status: "active"
    };
    if (Array.isArray(existing) && existing.length > 0) {
      await postgrestFetch(`/players?id=eq.${encodeURIComponent(existing[0].id)}&select=id`, {
        method: "PATCH",
        body: payload
      });
    } else {
      await postgrestFetch("/players?select=id", { method: "POST", body: payload });
    }
  }

  if (role === "coach") {
    const existing = await postgrestFetch(`/coaches?user_id=eq.${encodeURIComponent(userId)}&select=id&limit=1`);
    const payload = {
      user_id: userId,
      first_name: firstName,
      last_name: lastName,
      email: body.email || gate.session.user.email || null,
      phone: body.phone || null,
      specialization: body.specialization || null,
      status: "active"
    };
    if (Array.isArray(existing) && existing.length > 0) {
      await postgrestFetch(`/coaches?id=eq.${encodeURIComponent(existing[0].id)}&select=id`, {
        method: "PATCH",
        body: payload
      });
    } else {
      await postgrestFetch("/coaches?select=id", { method: "POST", body: payload });
    }
  }

  return Response.json({ ok: true });
}

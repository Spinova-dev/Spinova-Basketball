import "server-only";
import { isPostgrestReady, pgRest, pgInsert } from "./postgrest";

const ADMIN_GROUP = process.env.AUTH_ADMIN_GROUP || "spinova-admins";
const COACH_GROUP = process.env.AUTH_COACH_GROUP || "spinova-coaches";

const RANK = { admin: 3, coach: 2, player: 1 };

function maxRole(a, b) {
  return (RANK[a] || 0) >= (RANK[b] || 0) ? a : b;
}

function maxRoleList(roles) {
  const list = (roles || []).filter(Boolean);
  if (!list.length) return null;
  return list.reduce((acc, r) => maxRole(acc, r), "player");
}

/** Highest role stored in DB for this email (user_roles), or null. */
export async function getDbRoleForEmail(email) {
  if (!isPostgrestReady() || !email) return null;
  try {
    const users = await pgRest(`/users?email=eq.${encodeURIComponent(email)}&select=id`);
    if (!Array.isArray(users) || !users[0]?.id) return null;
    const uid = users[0].id;
    const rows = await pgRest(`/user_roles?user_id=eq.${uid}&select=role`);
    if (!Array.isArray(rows) || !rows.length) return null;
    return maxRoleList(rows.map((r) => r.role));
  } catch {
    return null;
  }
}

/**
 * Map Authentik groups to a single app role.
 * Priority: admin > coach > player
 */
export function rolesFromGroups(groups = []) {
  const g = new Set((groups || []).map((x) => String(x).toLowerCase()));
  if (g.has(ADMIN_GROUP.toLowerCase())) return "admin";
  if (g.has(COACH_GROUP.toLowerCase())) return "coach";
  return "player";
}

/**
 * Upsert the user row and guarantee a matching user_roles row.
 * We use `authentik_sub` as the stable external id (requires column, see SQL below).
 *
 * Expected SQL migration on your DB (run ONCE):
 *
 *   ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
 *   ALTER TABLE users ADD COLUMN IF NOT EXISTS authentik_sub text UNIQUE;
 *
 * If you cannot alter the schema, this function falls back to matching by email.
 */
export async function syncUserFromOidc(profile) {
  const { sub, email, name, role } = profile;
  if (!email) throw new Error("OIDC profile missing email");

  if (!isPostgrestReady()) {
    return { id: null, email, role, skipped: true };
  }

  let user;
  try {
    const byExt = await pgRest(`/users?authentik_sub=eq.${encodeURIComponent(sub)}&select=*`);
    if (Array.isArray(byExt) && byExt.length) user = byExt[0];
  } catch {
    // column might not exist yet; ignore and fall back to email
  }

  if (!user) {
    const byEmail = await pgRest(`/users?email=eq.${encodeURIComponent(email)}&select=*`);
    if (Array.isArray(byEmail) && byEmail.length) user = byEmail[0];
  }

  const payload = {
    email,
    full_name: name || email.split("@")[0],
    is_active: true
  };
  try {
    payload.authentik_sub = sub;
  } catch {}

  if (!user) {
    const created = await pgInsert("users", payload, { onConflict: "email" });
    user = Array.isArray(created) ? created[0] : created;
  } else {
    try {
      await pgRest(`/users?id=eq.${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Prefer: "return=representation" },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      // Non-fatal: keep existing user row
      console.warn("[db-sync] user patch failed:", err.message);
    }
  }

  if (user?.id && role) {
    try {
      await pgInsert(
        "user_roles",
        { user_id: user.id, role },
        { onConflict: "user_id,role", returnRow: false }
      );
    } catch (err) {
      console.warn("[db-sync] user_roles insert failed:", err.message);
    }
  }

  let effectiveRole = role;
  if (user?.id) {
    try {
      const rows = await pgRest(`/user_roles?user_id=eq.${user.id}&select=role`);
      if (Array.isArray(rows) && rows.length) {
        effectiveRole = maxRoleList(rows.map((r) => r.role)) || role;
      }
    } catch {
      /* keep role from request */
    }
  }

  return { ...user, role: effectiveRole };
}

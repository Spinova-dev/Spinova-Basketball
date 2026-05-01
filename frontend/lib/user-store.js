import { isDatabaseReady, withTransaction } from "@/lib/db";
import { isPostgrestReady, postgrestFetch } from "@/lib/postgrest";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function sanitizeRole(role) {
  const value = String(role || "").trim().toLowerCase();
  if (value === "admin" || value === "coach" || value === "player") return value;
  return null;
}

async function upsertGoogleUserViaPostgrest({ providerAccountId, normalizedEmail, name, image, preferredRole }) {
  const selectedRole = sanitizeRole(preferredRole) || "player";
  const roleWasExplicitlyRequested = Boolean(sanitizeRole(preferredRole));

  const existingIdentity = await postgrestFetch(
    `/user_identities?provider_name=eq.google&provider_subject=eq.${encodeURIComponent(providerAccountId)}&select=id,email`
  );
  const hasExistingIdentity = Array.isArray(existingIdentity) && existingIdentity.length > 0;
  if (!hasExistingIdentity && !roleWasExplicitlyRequested) {
    throw new Error("Account not registered. Please sign up first.");
  }

  const upsertIdentity = await postgrestFetch(
    "/user_identities?on_conflict=provider_name,provider_subject&select=id,email",
    {
      method: "POST",
      body: {
        provider_name: "google",
        provider_subject: providerAccountId,
        email: normalizedEmail,
        email_normalized: normalizedEmail,
        display_name: name || null,
        avatar_url: image || null
      }
    }
  );
  const identityRow = Array.isArray(upsertIdentity) ? upsertIdentity[0] : upsertIdentity;

  const upsertUser = await postgrestFetch("/users?on_conflict=identity_id&select=id,email", {
    method: "POST",
    body: {
      identity_id: identityRow.id,
      email: normalizedEmail,
      email_normalized: normalizedEmail,
      full_name: name || null,
      avatar_url: image || null
    }
  });
  const user = Array.isArray(upsertUser) ? upsertUser[0] : upsertUser;

  const currentPrimaryRole = await postgrestFetch(
    `/user_roles?user_id=eq.${encodeURIComponent(user.id)}&is_primary=eq.true&select=role_id`
  );

  let roleKeyToApply = selectedRole;
  if (!roleWasExplicitlyRequested && currentPrimaryRole?.[0]?.role_id) {
    const existingRole = await postgrestFetch(
      `/roles?id=eq.${encodeURIComponent(currentPrimaryRole[0].role_id)}&select=id,role_key&limit=1`
    );
    roleKeyToApply = existingRole?.[0]?.role_key || "player";
  }

  const roleRows = await postgrestFetch(
    `/roles?role_key=eq.${encodeURIComponent(roleKeyToApply)}&select=id,role_key&limit=1`
  );
  const role = roleRows?.[0];
  if (!role) throw new Error(`Role '${roleKeyToApply}' not found. Run role seed migration.`);

  if (roleWasExplicitlyRequested || !currentPrimaryRole?.[0]?.role_id) {
    await postgrestFetch("/user_roles?on_conflict=user_id,role_id", {
      method: "POST",
      body: {
        user_id: user.id,
        role_id: role.id,
        is_primary: true
      }
    });
    await postgrestFetch(`/user_roles?user_id=eq.${encodeURIComponent(user.id)}&role_id=neq.${encodeURIComponent(role.id)}`, {
      method: "PATCH",
      body: { is_primary: false }
    });
  }

  return { id: user.id, email: user.email, role: role.role_key };
}

export async function upsertGoogleUser({ providerAccountId, email, name, image, preferredRole }) {
  const normalizedEmail = normalizeEmail(email);
  const selectedRole = sanitizeRole(preferredRole) || "player";
  if (!providerAccountId || !normalizedEmail) {
    throw new Error("providerAccountId and email are required.");
  }

  if (isPostgrestReady()) {
    return upsertGoogleUserViaPostgrest({
      providerAccountId,
      normalizedEmail,
      name,
      image,
      preferredRole
    });
  }

  if (!isDatabaseReady()) {
    return {
      id: `local:${providerAccountId}`,
      email: normalizedEmail,
      role: selectedRole
    };
  }

  return withTransaction(async (client) => {
    const existingIdentity = await client.query(
      `
        SELECT id
        FROM user_identities
        WHERE provider_name = 'google' AND provider_subject = $1
        LIMIT 1
      `,
      [providerAccountId]
    );
    const hasExistingIdentity = existingIdentity.rowCount > 0;
    const roleWasExplicitlyRequested = Boolean(sanitizeRole(preferredRole));

    if (!hasExistingIdentity && !roleWasExplicitlyRequested) {
      throw new Error("Account not registered. Please sign up first.");
    }

    const identity = await client.query(
      `
        INSERT INTO user_identities (
          provider_name,
          provider_subject,
          email,
          email_normalized,
          display_name,
          avatar_url
        )
        VALUES ('google', $1, $2, $2, $3, $4)
        ON CONFLICT (provider_name, provider_subject) DO UPDATE
        SET
          email = EXCLUDED.email,
          email_normalized = EXCLUDED.email_normalized,
          display_name = EXCLUDED.display_name,
          avatar_url = EXCLUDED.avatar_url,
          last_login_at = NOW(),
          updated_at = NOW()
        RETURNING id, email
      `,
      [providerAccountId, normalizedEmail, name || null, image || null]
    );

    const identityRow = identity.rows[0];
    const userResult = await client.query(
      `
        INSERT INTO users (
          identity_id,
          email,
          email_normalized,
          full_name,
          avatar_url
        )
        VALUES ($1, $2, $2, $3, $4)
        ON CONFLICT (identity_id) DO UPDATE
        SET
          email = EXCLUDED.email,
          email_normalized = EXCLUDED.email_normalized,
          full_name = EXCLUDED.full_name,
          avatar_url = EXCLUDED.avatar_url,
          updated_at = NOW()
        RETURNING id, email
      `,
      [identityRow.id, normalizedEmail, name || null, image || null]
    );
    const user = userResult.rows[0];

    const currentPrimaryRole = await client.query(
      `
        SELECT r.id, r.role_key
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = $1 AND ur.is_primary = true
        LIMIT 1
      `,
      [user.id]
    );

    const roleKeyToApply = roleWasExplicitlyRequested
      ? selectedRole
      : currentPrimaryRole.rows[0]?.role_key || "player";
    const roleResult = await client.query("SELECT id, role_key FROM roles WHERE role_key = $1 LIMIT 1", [roleKeyToApply]);
    const role = roleResult.rows[0];
    if (!role) throw new Error(`Role '${roleKeyToApply}' not found. Run role seed migration.`);

    if (roleWasExplicitlyRequested || !currentPrimaryRole.rows[0]) {
      await client.query(
        `
          INSERT INTO user_roles (user_id, role_id, is_primary)
          VALUES ($1, $2, true)
          ON CONFLICT (user_id, role_id) DO UPDATE SET is_primary = true
        `,
        [user.id, role.id]
      );
      await client.query("UPDATE user_roles SET is_primary = false WHERE user_id = $1 AND role_id <> $2", [user.id, role.id]);
    }

    return {
      id: user.id,
      email: user.email,
      role: role.role_key
    };
  });
}

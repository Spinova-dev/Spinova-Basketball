import "server-only";
import fs from "node:fs";
import path from "node:path";

const STORE = path.join(process.cwd(), ".data", "oidc-roles.json");

function readStore() {
  try {
    if (!fs.existsSync(STORE)) return {};
    return JSON.parse(fs.readFileSync(STORE, "utf8"));
  } catch {
    return {};
  }
}

function writeStore(obj) {
  fs.mkdirSync(path.dirname(STORE), { recursive: true });
  fs.writeFileSync(STORE, JSON.stringify(obj, null, 2), "utf8");
}

export function getPersistedRoleForEmail(email) {
  if (!email) return null;
  const row = readStore()[email.toLowerCase()];
  return row?.role && ["admin", "coach", "player"].includes(row.role) ? row.role : null;
}

/** Remember app role when PostgREST is unavailable (dev / misconfigured JWT). */
export function setPersistedRoleForEmail(email, sub, role) {
  if (!email || !role) return;
  const data = readStore();
  data[email.toLowerCase()] = {
    role,
    authentik_sub: sub || null,
    updatedAt: new Date().toISOString()
  };
  writeStore(data);
}

export function clearPersistedRoleForEmail(email) {
  if (!email) return;
  const data = readStore();
  delete data[email.toLowerCase()];
  writeStore(data);
}

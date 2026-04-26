import "server-only";
import jwt from "jsonwebtoken";

const POSTGREST_URL = process.env.POSTGREST_URL;
const POSTGREST_ROLE = process.env.POSTGREST_ROLE || "spinova_dev";
const POSTGREST_JWT_SECRET = process.env.POSTGREST_JWT_SECRET;

/** True when PostgREST URL + JWT secret look usable (avoids 401 noise in dev). */
export function isPostgrestReady() {
  const s = String(POSTGREST_JWT_SECRET || "").trim();
  if (!POSTGREST_URL || !s) return false;
  if (/REPLACE|PASTE|CHANGE_ME/i.test(s)) return false;
  return s.length >= 16;
}

function ensureConfigured() {
  if (!POSTGREST_URL) throw new Error("POSTGREST_URL is not set");
  if (!POSTGREST_JWT_SECRET) throw new Error("POSTGREST_JWT_SECRET is not set");
}

/**
 * Sign a short-lived JWT that PostgREST will accept.
 * The `role` claim MUST match a Postgres role that PostgREST knows about.
 */
export function signPostgrestToken({ role = POSTGREST_ROLE, ttlSeconds = 300, extra = {} } = {}) {
  ensureConfigured();
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    {
      role,
      iat: now,
      exp: now + ttlSeconds,
      ...extra
    },
    POSTGREST_JWT_SECRET,
    { algorithm: "HS256" }
  );
}

/**
 * Low-level fetch helper. Always uses a freshly-signed short-lived JWT.
 * @param {string} path  e.g. "/users?email=eq.foo@bar.com"
 * @param {RequestInit & {role?: string}} init
 */
export async function pgRest(path, init = {}) {
  ensureConfigured();
  const token = signPostgrestToken({ role: init.role || POSTGREST_ROLE });
  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  const url = `${POSTGREST_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, { ...init, headers, cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PostgREST ${res.status} ${res.statusText} on ${path}: ${text}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

export async function pgSelect(table, query = "") {
  const qs = query ? (query.startsWith("?") ? query : `?${query}`) : "";
  return pgRest(`/${table}${qs}`);
}

export async function pgInsert(table, row, { onConflict, returnRow = true } = {}) {
  const params = new URLSearchParams();
  if (onConflict) params.set("on_conflict", onConflict);
  const qs = params.toString() ? `?${params.toString()}` : "";
  const headers = { "Content-Type": "application/json" };
  if (returnRow) headers.Prefer = onConflict ? "return=representation,resolution=merge-duplicates" : "return=representation";
  return pgRest(`/${table}${qs}`, {
    method: "POST",
    headers,
    body: JSON.stringify(row)
  });
}

export async function pgUpdate(table, query, patch) {
  const qs = query.startsWith("?") ? query : `?${query}`;
  return pgRest(`/${table}${qs}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify(patch)
  });
}

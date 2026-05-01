import { createHmac } from "node:crypto";

function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function isPostgrestReady() {
  return Boolean(process.env.POSTGREST_URL && process.env.POSTGREST_JWT_SECRET);
}

export function createPostgrestToken(hours = 1) {
  const secret = process.env.POSTGREST_JWT_SECRET;
  if (!secret) throw new Error("POSTGREST_JWT_SECRET is missing.");

  const role = process.env.POSTGREST_ROLE || "spinova_dev";
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      role,
      exp: Math.floor(Date.now() / 1000) + hours * 3600
    })
  );
  const signature = createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${header}.${payload}.${signature}`;
}

export async function postgrestFetch(path, { method = "GET", body = null } = {}) {
  const baseUrl = process.env.POSTGREST_URL;
  if (!baseUrl) throw new Error("POSTGREST_URL is missing.");

  const headers = {
    Authorization: `Bearer ${createPostgrestToken()}`,
    "Content-Type": "application/json"
  };
  if (method === "POST") headers.Prefer = "resolution=merge-duplicates,return=representation";
  if (method === "PATCH") headers.Prefer = "return=representation";

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store"
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(payload?.message || `PostgREST request failed (${response.status}).`);
  }
  return payload;
}

import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const SIGNUP_INTENT_COOKIE = "spinova_signup_intent";

const ROLE_RANK = { admin: 3, coach: 2, player: 1 };

export function pickHigherRole(a, b) {
  const ra = ROLE_RANK[a] || 0;
  const rb = ROLE_RANK[b] || 0;
  return ra >= rb ? a : b;
}

/**
 * Signed cookie value: "admin:<expMs>:<base64url-hmac>"
 */
export function createSignupIntentValue(role, secret) {
  if (!secret || role !== "admin") return null;
  const exp = Date.now() + 15 * 60 * 1000;
  const payload = `${role}:${exp}`;
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}:${sig}`;
}

/** @returns {"admin" | null} */
export function verifySignupIntentValue(raw, secret) {
  if (!raw || !secret) return null;
  const parts = String(raw).split(":");
  if (parts.length !== 3) return null;
  const [role, expStr, sig] = parts;
  const exp = Number(expStr);
  if (role !== "admin" || !Number.isFinite(exp) || Date.now() > exp) return null;
  const payload = `${role}:${exp}`;
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  try {
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return "admin";
}

import { demoUsers } from "./demo-data";

const SESSION_KEY = "spinova_session";

export function getSessionCookieName() {
  return SESSION_KEY;
}

export function validateDemoUser(email, password) {
  const user = demoUsers.find((u) => u.email === email && u.password === password);
  if (!user) return null;
  return { email: user.email, name: user.name, role: user.role };
}

export function encodeSession(user) {
  return Buffer.from(JSON.stringify(user)).toString("base64url");
}

export function decodeSession(value) {
  if (!value) return null;
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

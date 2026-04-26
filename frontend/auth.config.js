import Authentik from "next-auth/providers/authentik";
import Credentials from "next-auth/providers/credentials";
import { demoUsers } from "./lib/demo-data";

const DEMO_ENABLED = String(process.env.AUTH_DEMO_ENABLED || "true").toLowerCase() === "true";
const ADMIN_GROUP = (process.env.AUTH_ADMIN_GROUP || "spinova-admins").toLowerCase();
const COACH_GROUP = (process.env.AUTH_COACH_GROUP || "spinova-coaches").toLowerCase();

/**
 * Authentik's `.well-known/openid-configuration` returns `issuer` with a trailing slash.
 * oauth4webapi requires the configured issuer to match that value exactly, or discovery throws
 * OperationProcessingError: "issuer" property does not match the expected value.
 */
function normalizeAuthentikIssuer(raw) {
  const v = String(raw || "").trim();
  if (!v) return v;
  const base = v.replace(/\/+$/, "");
  return `${base}/`;
}

const authentikClientId =
  process.env.AUTH_AUTHENTIK_ID?.trim() ||
  process.env.AUTHENTIK_CLIENT_ID?.trim() ||
  process.env.AUTHENTIK_ID?.trim();

const authentikClientSecret =
  process.env.AUTH_AUTHENTIK_SECRET?.trim() ||
  process.env.AUTHENTIK_CLIENT_SECRET?.trim() ||
  process.env.AUTHENTIK_SECRET?.trim();

const authentikIssuer = normalizeAuthentikIssuer(
  process.env.AUTH_AUTHENTIK_ISSUER || process.env.AUTHENTIK_ISSUER || ""
);

/**
 * Authentik supports both methods; Advanced protocol settings can restrict to one.
 * Auth.js defaults to client_secret_basic. If Authentik is set to POST-only, token exchange returns invalid_client.
 * Set AUTH_AUTHENTIK_CLIENT_AUTH=basic to force header auth.
 */
const authentikTokenAuth =
  String(process.env.AUTH_AUTHENTIK_CLIENT_AUTH || "post").toLowerCase() === "basic"
    ? "client_secret_basic"
    : "client_secret_post";

function validateDemoUser(email, password) {
  const user = demoUsers.find((u) => u.email === email && u.password === password);
  if (!user) return null;
  return { email: user.email, name: user.name, role: user.role };
}

function roleFromGroups(groups = []) {
  const g = new Set((groups || []).map((x) => String(x).toLowerCase()));
  if (g.has(ADMIN_GROUP)) return "admin";
  if (g.has(COACH_GROUP)) return "coach";
  return "player";
}

const providers = [
  Authentik({
    clientId: authentikClientId,
    clientSecret: authentikClientSecret,
    issuer: authentikIssuer,
    client: { token_endpoint_auth_method: authentikTokenAuth },
    authorization: { params: { scope: "openid email profile offline_access" } }
  })
];

if (DEMO_ENABLED) {
  providers.push(
    Credentials({
      id: "demo",
      name: "Demo account",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(creds) {
        const u = validateDemoUser(creds?.email, creds?.password);
        if (!u) return null;
        return { id: `demo:${u.email}`, email: u.email, name: u.name, role: u.role, demo: true };
      }
    })
  );
}

/**
 * Edge-safe Auth.js config (no DB/Node-only libs here).
 * The full config in /auth.js extends this with a `signIn` callback that writes to PostgREST.
 */
const authConfig = {
  providers,
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.role = user.role || token.role;
        token.dbId = user.dbId || token.dbId;
        token.demo = Boolean(user.demo);
      }
      if (account?.provider === "authentik" && profile) {
        token.groups = profile.groups || profile.roles || [];
        if (!token.role) token.role = roleFromGroups(token.groups);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role || "player";
        session.user.dbId = token.dbId || null;
        session.user.demo = Boolean(token.demo);
      }
      return session;
    }
  }
};

export { roleFromGroups };
export default authConfig;

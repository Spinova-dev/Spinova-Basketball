import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { demoUsers } from "./lib/demo-data";

const DEMO_ENABLED = String(process.env.AUTH_DEMO_ENABLED || "true").toLowerCase() === "true";

function validateDemoUser(email, password) {
  const user = demoUsers.find((u) => u.email === email && u.password === password);
  if (!user) return null;
  return { email: user.email, name: user.name, role: user.role };
}

const providers = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
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
 * Edge-safe Auth.js config.
 * Node-only database writes happen in /auth.js callbacks.
 */
const authConfig = {
  providers,
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.appUserId = user.appUserId || token.appUserId || null;
        token.role = user.role || token.role;
        token.demo = Boolean(user.demo);
      }
      if (account?.provider === "google") {
        token.demo = false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.appUserId = token.appUserId || null;
        session.user.role = token.role || "player";
        session.user.demo = Boolean(token.demo);
      }
      return session;
    }
  }
};
export default authConfig;

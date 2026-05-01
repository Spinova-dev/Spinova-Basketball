import NextAuth from "next-auth";
import { cookies } from "next/headers";
import authConfig from "./auth.config";
import { upsertGoogleUser } from "@/lib/user-store";

const SIGNUP_ROLE_COOKIE = "spinova_signup_role";

function sanitizeRole(role) {
  const value = String(role || "").trim().toLowerCase();
  if (value === "admin" || value === "coach" || value === "player") return value;
  return null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;

      const providerAccountId = account.providerAccountId || profile?.sub || user?.id;
      const email = profile?.email || user?.email || null;
      const name = profile?.name || user?.name || null;
      const image = profile?.picture || user?.image || null;

      if (!providerAccountId || !email) return false;

      let roleFromCookie = null;
      try {
        roleFromCookie = sanitizeRole(cookies().get(SIGNUP_ROLE_COOKIE)?.value);
      } catch {
        roleFromCookie = null;
      }
      const saved = await upsertGoogleUser({
        providerAccountId,
        email,
        name,
        image,
        preferredRole: roleFromCookie || null
      });

      if (roleFromCookie) {
        try {
          cookies().set({
            name: SIGNUP_ROLE_COOKIE,
            value: "",
            path: "/",
            maxAge: 0
          });
        } catch {
          // Ignore cookie cleanup failures.
        }
      }

      user.appUserId = saved.id;
      user.role = saved.role || "player";
      user.demo = false;
      return true;
    }
  }
});

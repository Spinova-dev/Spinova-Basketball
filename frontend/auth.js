import { cookies } from "next/headers";
import NextAuth from "next-auth";
import authConfig, { roleFromGroups } from "./auth.config";
import { getDbRoleForEmail, syncUserFromOidc } from "@/lib/db-sync";
import { pickHigherRole } from "@/lib/signup-intent";
import { isPostgrestReady } from "@/lib/postgrest";
import {
  getPersistedRoleForEmail,
  setPersistedRoleForEmail,
  clearPersistedRoleForEmail
} from "@/lib/role-persistence";
import { verifySignupIntentValue, SIGNUP_INTENT_COOKIE } from "@/lib/signup-intent";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider !== "authentik") return true;

      const email = profile?.email || user?.email;
      const sub = profile?.sub || user?.id;
      const name = profile?.name || user?.name;
      if (!email) return true;

      const secret = process.env.AUTH_SECRET;
      const rawIntent = cookies().get(SIGNUP_INTENT_COOKIE)?.value;
      const intentAdmin = secret ? verifySignupIntentValue(rawIntent, secret) : null;
      cookies().set(SIGNUP_INTENT_COOKIE, "", {
        path: "/",
        maxAge: 0,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
      });

      const groups = profile?.groups || profile?.roles || [];
      let role = roleFromGroups(groups);
      const fromFile = getPersistedRoleForEmail(email);
      if (fromFile) role = pickHigherRole(role, fromFile);
      if (isPostgrestReady()) {
        const fromDb = await getDbRoleForEmail(email);
        if (fromDb) role = pickHigherRole(role, fromDb);
      }
      if (intentAdmin === "admin") role = "admin";

      try {
        const synced = await syncUserFromOidc({ sub, email, name, role });
        if (synced?.skipped) {
          user.role = role;
          user.dbId = null;
          setPersistedRoleForEmail(email, sub, role);
        } else {
          user.role = synced.role || role;
          user.dbId = synced.id;
          clearPersistedRoleForEmail(email);
        }
      } catch (err) {
        console.error("[auth] DB sync failed, using merged role and local store if needed:", err.message);
        user.role = role;
        user.dbId = null;
        setPersistedRoleForEmail(email, sub, role);
      }
      return true;
    }
  }
});

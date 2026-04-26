# Authentik + PostgREST integration — setup guide

You only have to do this **once**. After it's done, your app supports:
- Google login (via Authentik)
- GitHub login (via Authentik)
- Normal username/password signup (via Authentik's built-in enrollment)
- The old demo accounts as a fallback (can be disabled in production)

---

## 1. Configure the Authentik application

In Authentik admin → **Applications → Providers → `spinova-basket`** (the OpenID Provider):

- **Redirect URIs / Origins** — add all of these, one per line:
  ```
  http://localhost:3000/api/auth/callback/authentik
  https://YOUR-DEPLOYED-DOMAIN.com/api/auth/callback/authentik
  ```
- **Signing key**: keep the default
- **Scopes**: make sure `openid`, `email`, `profile` are included. Optionally enable `offline_access` for refresh tokens.
- **Subject mode**: "Based on the User's hashed ID" (default is fine).
- **Include claims in id_token**: enable `email`, `name`, `groups`.

Then in **Applications → `Spinova Basket`** copy:
- **Client ID** → already set (`CsVybghv1kCpDFkpdZD45uWmyLB4Xymzy8RNUNaF`)
- **Client Secret** → paste into `AUTH_AUTHENTIK_SECRET` in `.env.local`

### Social logins (Google / GitHub)

In Authentik:
- **Directory → Federation & Social login → Sources → Create**
  - Add a **Google OAuth Source** (Client ID + Secret from Google Cloud Console, OAuth callback `https://auth.webmeccano.cloud/source/oauth/callback/google-login/`)
  - Add a **GitHub OAuth Source** similarly
- In **Flows & Stages → Flows**, open the default **authentication** and **enrollment** flows. Make sure the "Source Stage" lets the new Google/GitHub sources be picked.

Users will now see "Sign in with Google" and "Sign in with GitHub" on the Authentik login page. From the Next.js app we just send them to Authentik (one button) and Authentik handles the provider choice.

### Admin group

- Create a group named **`spinova-admins`** in Authentik (**Directory → Groups**).
- Add any Authentik user to it to make them app admins.
- The env var `AUTH_ADMIN_GROUP` must match this name.
- Optional coach group: `spinova-coaches` (users who are neither admin nor coach default to `player`).

---

## 2. Configure the database

Run `db/migrations/001_authentik_integration.sql` on your Spinova PostgreSQL DB. This:

1. Makes `users.password_hash` nullable (SSO users don't have one).
2. Adds `users.authentik_sub` (stable external id, unique).
3. Grants the PostgREST role (`spinova_dev`) the needed CRUD rights.

If you want to keep the original schema unchanged, the sync code falls back to email-based matching — but the `authentik_sub` column is strongly recommended because emails can change.

**Rotate the PostgREST JWT secret.** The previously shared secret was leaked in chat. In the PostgREST config update `jwt-secret` to a new random 32+ char string, then put the same value in `POSTGREST_JWT_SECRET` in `.env.local`.

---

## 3. Fill in `.env.local`

Already scaffolded in this repo. Replace:

- `AUTH_SECRET` — run `openssl rand -base64 32` (or any 32+ char random string)
- `AUTH_AUTHENTIK_SECRET` — from the Authentik provider Credentials tab
- `POSTGREST_JWT_SECRET` — the new rotated value
- `AUTH_URL` / `NEXTAUTH_URL` — set to your production domain when deploying

---

## 4. Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000/login>:
- Click **Sign in with Spinova SSO** → you'll be redirected to Authentik → Google/GitHub/password → back to the app.
- First-time sign-in auto-creates a row in `users` and `user_roles`.
- Role is decided by Authentik group membership:
  - member of `spinova-admins` → `admin`
  - member of `spinova-coaches` → `coach`
  - otherwise → `player`

The old demo accounts still work while `AUTH_DEMO_ENABLED=true`. Set it to `false` in production.

---

## 5. Authentik flow blueprint (recommended exact setup)

Use this if signup/login is inconsistent, Google button is missing, or non-admin users are blocked.

### A) Google source

- Path: **Directory → Federation & Social login → Sources → Google login**
- Set:
  - **Slug**: `google-login`
  - **Authentication flow**: `default-source-authentication`
  - **Enrollment flow**: `default-source-enrollment`
- In Google Cloud OAuth client, make sure this redirect URI exists (exactly):
  - `https://auth.webmeccano.cloud/source/oauth/callback/google-login/`

### B) Enrollment flow must create users

- Path: **Flows & Stages → Flows → `default-source-enrollment`**
- Ensure this stage order exists:
  1. Prompt/Identification (optional)
  2. **User Write** with **Create users when required = ON**
  3. **User Login**

Without User Write (create users), first-time Google users can authenticate but may not be provisioned correctly.

### C) Main authentication flow must expose Google

- Path: **Flows & Stages → Flows → `default-authentication-flow`**
- Open the Identification stage used by that flow, then configure:
  - **Sources** includes `Google login`
  - **Show sources' labels** = ON (otherwise source buttons can be icon-only)
  - Keep Email/Username fields as desired

### D) Provider/application mapping

- Path: **Applications → Providers → `spinova-basket`**
- Confirm its **Authentication flow** is the same flow you edited in step C.

### E) Access model (important)

- Do **not** restrict the whole app to admin-only bindings if you want general users to sign up/login.
- Keep admin assignment separate:
  - `/signup/admin` is for admin onboarding intent.
  - `/signup` is for normal user Google signup.
  - Admin role can also come from Authentik group `spinova-admins`.

### F) Optional: force direct Google from app

In `.env.local`:

```env
AUTH_AUTHENTIK_SOURCE_SLUG=google-login
```

The app will pass `source=google-login` on OIDC authorize requests (supported by newer Authentik), so users can jump directly to Google instead of stopping on email-first login.

---

## 6. How data flows

```
Browser → /api/auth/signin/authentik
      ↓
Authentik (Google / GitHub / password) → /api/auth/callback/authentik
      ↓
Auth.js  (signIn callback)
      ↓
lib/db-sync.js → PostgREST (signed with short-lived JWT) → users + user_roles
      ↓
JWT session cookie issued → role stored in token
      ↓
middleware.js enforces /admin|/coach|/player
```

---

## 7. Using the database from server code

```js
import { pgSelect, pgInsert, pgRest } from "@/lib/postgrest";

// SELECT
const players = await pgSelect("players", "select=id,full_name&limit=20");

// INSERT
await pgInsert("coaches", { full_name: "Omar Salah" });

// Raw
await pgRest("/rpc/my_function", { method: "POST", body: JSON.stringify({ x: 1 }) });
```

All calls run on the server only — the JWT secret never leaves the server.

---

## 8. Troubleshooting

- **"configuration error"** on `/login` → `AUTH_AUTHENTIK_SECRET` or `AUTH_SECRET` missing.
- **Redirect URI mismatch** → add the exact callback URL in Authentik.
- **`invalid_client` / `CallbackRouteError` after Authentik login** (token step fails):
  1. In Authentik → **Applications → Providers → your OIDC provider → Edit**, open **Client credentials** and copy the **Client secret** again (not the Client ID). Paste it into `.env.local` as `AUTH_AUTHENTIK_SECRET` with no spaces or quotes. If the secret was only shown once, use **Regenerate** and update `.env.local`, then restart `npm run dev`.
  2. Ensure `AUTH_AUTHENTIK_ISSUER` matches **OpenID Configuration Issuer** from Authentik exactly (usually **with** a trailing `/`, e.g. `https://auth.webmeccano.cloud/application/o/spinova-basket/`). The app normalizes to a single trailing slash if you omit it.
  3. In the provider **Advanced protocol settings**, check **Client authentication method**. This app defaults to sending the secret in the **POST body** (`client_secret_post`). If your provider is restricted to **Client secret (HTTP Basic)** only, add to `.env.local`: `AUTH_AUTHENTIK_CLIENT_AUTH=basic` and restart.
  4. You can also use `AUTHENTIK_CLIENT_SECRET` / `AUTHENTIK_CLIENT_ID` / `AUTHENTIK_ISSUER` as alternate env names if you prefer.
- **401 from PostgREST** → check `POSTGREST_JWT_SECRET` matches PostgREST's `jwt-secret`, and `POSTGREST_ROLE` is a valid DB role.
- **User is always "player"** → they aren't a member of the `spinova-admins` group, or the `groups` claim is not being emitted by the Authentik provider (enable in the provider's "Claims" settings).
- **Watchpack / `lstat '~WRD…tmp'`** → Word or another app created temp files under `Downloads\`. Ignore the noise, or move the repo out of `Downloads`, or close Word while developing.

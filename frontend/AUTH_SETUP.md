# Spinova Auth + Database Setup

## 1) Required Environment Variables

Set these in local `.env.local` and in Vercel project settings:

- `AUTH_SECRET`
- `AUTH_URL` (production URL, e.g. `https://your-domain.vercel.app`)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `DATABASE_URL` (PostgreSQL connection string)
- `POSTGREST_URL` (optional alternative data path if DB is private/internal)
- `POSTGREST_JWT_SECRET` (required when using PostgREST)
- `POSTGREST_ROLE` (optional; defaults to `spinova_dev`)
- `NEXT_PUBLIC_AUTH_DEMO_ENABLED` (`true` or `false`, optional fallback)
- `AUTH_DEMO_ENABLED` (`true` or `false`, optional fallback)

## 2) Google OAuth Configuration

In Google Cloud Console:

1. Open your OAuth client.
2. Add Authorized JavaScript origins:
   - `http://localhost:3000`
   - your production origin
3. Add Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-domain.vercel.app/api/auth/callback/google`

## 3) Database Bootstrap

Run migrations against PostgreSQL in order:

1. `frontend/db/migrations/001_full_domain_schema.sql`

This creates:
- auth identity tables (`user_identities`, `users`, `roles`, `user_roles`)
- domain tables (`organizations`, `teams`, `players`, `coaches`, `reports`)
- artifact tables (`report_media`, `report_transcripts`)
- audit table (`activity_log`)
- role seeds (`admin`, `coach`, `player`)

## 4) Runtime Behavior

- First Google sign-in performs idempotent upsert:
  - `provider_name = google`
  - `provider_subject = providerAccountId`
  - user profile row created/updated in `users`
  - default primary role `player` attached if missing
- If `POSTGREST_URL` + `POSTGREST_JWT_SECRET` are set, user upsert is executed via PostgREST API instead of direct DB socket.
- JWT session carries:
  - `appUserId`
  - `role`
  - `email` / `name` from Auth.js session user
- Report generation persists metadata into DB when `DATABASE_URL` exists.

## 5) Verification Checklist

1. Sign up on `/signup` using Google.
2. Confirm you can sign out and sign in again with the same Google account.
3. Verify DB rows:
   - `user_identities` has Google provider subject
   - `users` has normalized email
   - `user_roles` has one primary role
4. Generate a report from admin dashboard and confirm:
   - row in `reports`
   - rows in `report_media` and `report_transcripts`
   - row in `activity_log`

## 6) Vercel Deployment Notes

- Root Directory: `frontend`
- Build Command: `npm run build`
- Install Command: `npm install`
- Ensure all env vars are configured in Vercel before deploy.

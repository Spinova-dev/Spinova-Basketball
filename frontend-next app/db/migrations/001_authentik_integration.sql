-- Run once on the Spinova PostgreSQL database.
-- Required so Authentik / Google / GitHub signups work without local passwords.

BEGIN;

-- 1) SSO users have no password, so allow NULL
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- 2) Stable external identifier coming from Authentik (`sub` claim)
ALTER TABLE users ADD COLUMN IF NOT EXISTS authentik_sub text UNIQUE;

-- 3) Let PostgREST (via the signed JWT role) read/write the tables we need.
--    Replace spinova_dev below with the role name you use.
GRANT SELECT, INSERT, UPDATE ON users      TO spinova_dev;
GRANT SELECT, INSERT, UPDATE ON user_roles TO spinova_dev;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO spinova_dev;

COMMIT;

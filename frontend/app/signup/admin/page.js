"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";

function GoogleMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.432 32.655 29.248 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.378-3.222-10.965-7.764l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

export default function AdminSignupPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function signupWithGoogle() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup-intent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ intent: "admin" })
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(j.error || "Could not start signup");
        setLoading(false);
        return;
      }
      const oidc = { prompt: "login" };
      if (j.authentikSourceSlug) oidc.source = j.authentikSourceSlug;
      // prompt=login: avoid silent SSO to another Authentik session.
      // source=<slug>: Authentik can open that federated source directly (OIDC authorize param).
      await signIn("authentik", { callbackUrl: "/" }, oidc);
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-grid">
          <div className="login-brand">
            <img src="/assets/images/spinova-logo.png" alt="Spinova Logo" style={{ height: 80, width: "auto" }} />
            <div className="login-tagline">Administrator access</div>
            <div className="role-chips">
              <span className="role-chip admin">Admin</span>
            </div>
            <p className="login-brand-copy">
              Create your admin account with Google. Your email is stored with the <strong>admin</strong> role so the next time you sign in with the same Google account, you land in the admin area.
            </p>
          </div>

          <div className="login-card">
            <div className="login-eyebrow">Admin signup</div>
            <h2>Create admin account</h2>
            <p className="login-lead">
              You will be redirected to Spinova SSO and asked to <strong>sign in again</strong> (so we do not reuse another Authentik session). Then choose <strong>Google</strong> and complete signup with your Gmail account.
            </p>

            <button type="button" onClick={signupWithGoogle} disabled={loading} className="btn-google-oauth">
              <GoogleMark />
              {loading ? "Redirecting…" : "Sign up with Google"}
            </button>

            {error ? <div className="error-message">{error}</div> : null}

            <p className="login-card-footer">
              Already have an account? <Link href="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

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

export default function SignupPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function signupWithGoogle() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/sso-options", { cache: "no-store" });
      const j = await res.json().catch(() => ({}));
      const oidc = { prompt: "login" };
      if (j.authentikSourceSlug) oidc.source = j.authentikSourceSlug;
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
            <div className="login-tagline">Create your account</div>
            <div className="role-chips">
              <span className="role-chip coach">Coach</span>
              <span className="role-chip player">Player</span>
            </div>
            <p className="login-brand-copy">
              Continue with Google. New users are created automatically in Authentik and then synced to Spinova on first sign-in.
            </p>
          </div>

          <div className="login-card">
            <div className="login-eyebrow">User signup</div>
            <h2>Create account with Google</h2>
            <p className="login-lead">
              This flow is for regular users. If you need administrator access, use the dedicated admin signup page.
            </p>

            <button type="button" onClick={signupWithGoogle} disabled={loading} className="btn-google-oauth">
              <GoogleMark />
              {loading ? "Redirecting..." : "Sign up with Google"}
            </button>

            {error ? <div className="error-message">{error}</div> : null}

            <p className="login-card-footer">
              Admin signup? <Link href="/signup/admin">Go to admin signup</Link>
            </p>
            <p className="login-card-footer" style={{ marginTop: 8 }}>
              Already have an account? <Link href="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAuthentik() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/sso-options", { cache: "no-store" });
      const j = await res.json().catch(() => ({}));
      const oidc = { prompt: "login" };
      if (j.authentikSourceSlug) oidc.source = j.authentikSourceSlug;
      await signIn("authentik", { callbackUrl: "/" }, oidc);
    } catch {
      setLoading(false);
      setError("Could not start SSO. Please try again.");
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("demo", { email, password, redirect: false });
    setLoading(false);
    if (!res || res.error) {
      setError("Incorrect email or password");
      return;
    }
    const meRes = await fetch("/api/auth/session");
    const me = await meRes.json();
    const role = me?.user?.role || "player";
    window.location.href = `/${role}/dashboard`;
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-grid">
          <div className="login-brand">
            <img src="/assets/images/spinova-logo.png" alt="Spinova Logo" style={{ height: 80, width: "auto" }} />
            <div className="login-tagline">Basketball Analytics Platform</div>
            <div className="role-chips">
              <span className="role-chip admin">Admin</span>
              <span className="role-chip coach">Coach</span>
              <span className="role-chip player">Player</span>
            </div>

            <div className="demo-credentials">
              <h3>Demo Credentials</h3>
              <div className="demo-cards">
                <div className="demo-card admin">
                  <div className="role">Admin</div>
                  <div className="name">Khalid Al-Mansouri</div>
                  <div className="cred">admin@spinova.app</div>
                  <div className="cred">Admin2026!</div>
                </div>
                <div className="demo-card coach">
                  <div className="role">Coach</div>
                  <div className="name">Omar Salah</div>
                  <div className="cred">coach@spinova.app</div>
                  <div className="cred">Coach2026!</div>
                </div>
                <div className="demo-card player">
                  <div className="role">Player</div>
                  <div className="name">Ahmed Al-Rashidi</div>
                  <div className="cred">player@spinova.app</div>
                  <div className="cred">Player2026!</div>
                </div>
              </div>
              <div className="demo-note">Demo credentials — see your role card above</div>
            </div>
          </div>

          <div className="login-card">
            <div className="login-eyebrow">Platform Login</div>
            <h2>Welcome Back</h2>

            <button
              type="button"
              onClick={handleAuthentik}
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: "100%", justifyContent: "center", marginBottom: 12 }}
            >
              Sign in with Spinova SSO (Google · GitHub)
            </button>
            <p style={{ fontSize: 12, color: "var(--light)", textAlign: "center", marginBottom: 8 }}>
              New user?{" "}
              <Link href="/signup" style={{ color: "var(--court)", fontWeight: 700 }}>
                Sign up with Google
              </Link>
              {" · "}New admin?{" "}
              <Link href="/signup/admin" style={{ color: "var(--court)", fontWeight: 700 }}>
                Sign up as admin (Google)
              </Link>
            </p>
            <p style={{ fontSize: 12, color: "var(--light)", textAlign: "center", marginBottom: 20 }}>
              Returning user: SSO will send you to the right dashboard for your role.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "12px 0 20px" }}>
              <div style={{ flex: 1, height: 1, background: "#e4e7ec" }} />
              <span style={{ fontSize: 11, color: "var(--light)", letterSpacing: 2 }}>OR DEMO LOGIN</span>
              <div style={{ flex: 1, height: 1, background: "#e4e7ec" }} />
            </div>

            <form onSubmit={onSubmit}>
              <div className="form-group">
                <label className="input-label">Email Address</label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="input-label">Password</label>
                <input
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                {error ? <div className="error-message" style={{ display: "block" }}>{error}</div> : null}
              </div>

              <button type="submit" disabled={loading} className="btn btn-secondary btn-lg" style={{ width: "100%", justifyContent: "center" }}>
                {loading ? "Signing in…" : "Demo Sign In →"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

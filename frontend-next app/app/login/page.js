"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Incorrect email or password");
      return;
    }
    router.push(`/${data.user.role}/dashboard`);
    router.refresh();
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

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }}>
                Sign In →
              </button>
            </form>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .login-page { min-height: 100vh; display: grid; place-items: center; background: #0D1B2A; position: relative; overflow: hidden; }
        .login-page::before { content: ''; position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 65% 70% at 80% 40%, rgba(232,119,34,0.14) 0%, transparent 65%), radial-gradient(ellipse 50% 60% at 5% 90%, rgba(58,155,213,0.10) 0%, transparent 60%); }
        .login-container { position: relative; z-index: 1; max-width: 1000px; width: 100%; padding: 40px 20px; }
        .login-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; }
        .login-brand { color: white; }
        .login-tagline { font-size: 16px; color: rgba(255,255,255,0.6); margin-bottom: 32px; }
        .role-chips { display: flex; gap: 12px; flex-wrap: wrap; }
        .role-chip { padding: 8px 18px; border-radius: var(--r-pill); font-size: 12px; font-weight: 700; font-family: 'Outfit', sans-serif; letter-spacing: 1px; text-transform: uppercase; }
        .role-chip.admin { background: rgba(232,119,34,0.15); color: var(--court3); border: 1px solid rgba(232,119,34,0.3); }
        .role-chip.coach { background: rgba(181,227,58,0.15); color: var(--lime); border: 1px solid rgba(181,227,58,0.3); }
        .role-chip.player { background: rgba(58,155,213,0.15); color: var(--blue); border: 1px solid rgba(58,155,213,0.3); }
        .login-card { background: var(--white); border-radius: 16px; padding: 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.35); }
        .login-eyebrow { font-size: 10px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; color: var(--light); margin-bottom: 12px; font-family: 'Outfit', sans-serif; }
        .login-card h2 { font-size: 28px; font-weight: 800; color: var(--navy); margin-bottom: 28px; }
        .error-message { color: var(--red); font-size: 13px; margin-top: 8px; display: none; }
        .demo-credentials { margin-top: 40px; }
        .demo-credentials h3 { font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.8); margin-bottom: 16px; font-family: 'Outfit', sans-serif; }
        .demo-cards { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
        .demo-card { background: rgba(255,255,255,0.06); border-radius: 12px; padding: 18px; border: 1px solid rgba(255,255,255,0.1); }
        .demo-card.admin { border-top: 3px solid var(--court); }
        .demo-card.coach { background: var(--court); border: none; }
        .demo-card.player { background: var(--blue); border: none; }
        .demo-card .role { font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; opacity: 0.8; margin-bottom: 8px; font-family: 'Outfit', sans-serif; }
        .demo-card.coach .role, .demo-card.player .role { color: rgba(255,255,255,0.8); }
        .demo-card .name { font-size: 15px; font-weight: 700; margin-bottom: 12px; color: white; font-family: 'Outfit', sans-serif; }
        .demo-card.admin .name { color: var(--court3); }
        .demo-card .cred { font-size: 12px; color: rgba(255,255,255,0.75); margin-bottom: 4px; }
        .demo-card.admin .cred { color: rgba(255,255,255,0.6); }
        .demo-note { margin-top: 12px; font-size: 12px; color: rgba(255,255,255,0.5); }
        @media (max-width: 900px) { .login-grid { grid-template-columns: 1fr; } .demo-cards { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

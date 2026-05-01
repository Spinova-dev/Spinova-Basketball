"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

const ROLES = ["admin", "coach", "player"];

function SignupPageContent() {
  const params = useSearchParams();
  const requestedRole = String(params.get("role") || "").toLowerCase();
  const defaultRole = ROLES.includes(requestedRole) ? requestedRole : "player";
  const [role, setRole] = useState(defaultRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onGoogleSignup() {
    try {
      setError("");
      setLoading(true);
      const intentRes = await fetch("/api/auth/signup-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });
      if (!intentRes.ok) {
        setError("Could not start signup. Please try again.");
        setLoading(false);
        return;
      }
      const callbackUrl = role === "admin" ? "/admin/dashboard" : `/onboarding/${role}`;
      await signIn("google", { callbackUrl });
    } catch {
      setError("Signup failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-container" style={{ maxWidth: 540 }}>
        <div className="login-card">
          <div className="login-eyebrow">Create Account</div>
          <h2>Join Spinova</h2>
          <p style={{ fontSize: 13, color: "var(--light)", textAlign: "center", marginBottom: 24 }}>
            Choose your role, then continue with Google. Your account and role will be saved automatically.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
            {ROLES.map((item) => (
              <button
                key={item}
                type="button"
                className={`btn ${role === item ? "btn-primary" : "btn-secondary"}`}
                style={{ justifyContent: "center", textTransform: "capitalize" }}
                onClick={() => setRole(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onGoogleSignup}
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center" }}
          >
            {loading ? "Redirecting..." : `Sign up as ${role} with Google`}
          </button>
          {error ? (
            <p style={{ color: "#d53939", fontSize: 12, marginTop: 12, textAlign: "center" }}>{error}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="login-page"><div className="login-container">Loading...</div></div>}>
      <SignupPageContent />
    </Suspense>
  );
}

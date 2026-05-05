"use client";

import { useState } from "react";
import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function NewReportPage() {
  const [form, setForm] = useState({
    youtubeUrl: "",
    matchTitle: "",
    matchDate: "",
    competition: "",
    venue: "",
    notes: "",
    taggedPlayers: []
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generationInfo, setGenerationInfo] = useState(null);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    async function loadPlayers() {
      try {
        const res = await fetch("/api/players");
        if (!res.ok) return;
        const data = await res.json();
        const names = (data.items || []).map((p) => `${p.first_name} ${p.last_name}`.trim()).filter(Boolean);
        setPlayers(names);
      } catch {}
    }
    loadPlayers();
  }, []);

  function onChange(key, value) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function togglePlayer(name) {
    setForm((s) => ({
      ...s,
      taggedPlayers: s.taggedPlayers.includes(name)
        ? s.taggedPlayers.filter((p) => p !== name)
        : [...s.taggedPlayers, name]
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setGenerationInfo(null);
    setStatus("Sending video URL to report pipeline...");

    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate report.");

      setStatus("Report generated successfully from n8n flow.");
      setGenerationInfo(data);

      const blob = new Blob([data.html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");

      setStatus("Report generated successfully. Opened in new tab.");
    } catch (err) {
      setError(err.message || "Unexpected error.");
      setStatus("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="topbar">
        <a href="/admin/dashboard" className="topbar-brand">
          <img src="/assets/images/spinova-logo.png" alt="Spinova Logo" style={{ height: 40, width: "auto", verticalAlign: "middle" }} />
        </a>
        <div className="topbar-user" id="topbar-user">
          <span className="role-badge">ADMIN</span>
          <span>Khalid Al-Mansouri</span>
          <button className="logout-btn" onClick={() => signOut({ callbackUrl: "/login" })}>Logout</button>
        </div>
      </div>

      <div className="layout">
        <nav className="sidenav">
          <div className="sidenav-top">
            <div className="sidenav-label">Overview</div>
            <a href="/admin/dashboard">Dashboard</a>
            <div className="sidenav-label">Reports</div>
            <a href="/admin/reports">All Reports</a>
            <a href="/admin/reports/new" className="active">New Report</a>
            <a href="/admin/reports/requested">Requested Reports</a>
            <a href="/admin/reports/pending">Pending Approval</a>
            <div className="sidenav-label">Profiles</div>
            <a href="/admin/profiles/players">All Players</a>
            <a href="/admin/profiles/coaches">All Coaches</a>
            <div className="sidenav-label">Users</div>
            <a href="/admin/users">All Users</a>
            <a href="/admin/users/invite">Invite User</a>
            <div className="sidenav-label">Settings</div>
            <a href="/admin/settings">Settings</a>
          </div>
          <div className="sidenav-logout">
            <button onClick={() => signOut({ callbackUrl: "/login" })}>Logout</button>
          </div>
        </nav>

        <main className="main-content">
          <section className="hero">
            <div className="hero-content">
              <div className="hero-eyebrow">Reports</div>
              <h1>New Match <em>Report</em></h1>
              <p>Submit a YouTube match for AI analysis.</p>
            </div>
          </section>

          <div className="page-container">
            <form onSubmit={onSubmit}>
              <div className="card">
                <div className="card-title">YouTube Link</div>
                <div className="form-group">
                  <label className="input-label">YouTube Match URL</label>
                  <input className="input" type="url" required value={form.youtubeUrl} onChange={(e) => onChange("youtubeUrl", e.target.value)} placeholder="https://youtube.com/watch?v=..." />
                </div>
                <div className="callout blue">
                  <p>Spinova sends your YouTube URL to the n8n pipeline and waits for the generated HTML report.</p>
                </div>
              </div>

              <div className="card" style={{ marginTop: 16 }}>
                <div className="card-title">Match Information</div>
                <div className="two-col">
                  <div className="form-group"><label className="input-label">Match Title</label><input className="input" value={form.matchTitle} onChange={(e) => onChange("matchTitle", e.target.value)} /></div>
                  <div className="form-group"><label className="input-label">Match Date</label><input className="input" type="date" value={form.matchDate} onChange={(e) => onChange("matchDate", e.target.value)} /></div>
                </div>
                <div className="two-col">
                  <div className="form-group"><label className="input-label">Competition / League</label><input className="input" value={form.competition} onChange={(e) => onChange("competition", e.target.value)} /></div>
                  <div className="form-group"><label className="input-label">Match Venue</label><input className="input" value={form.venue} onChange={(e) => onChange("venue", e.target.value)} /></div>
                </div>
              </div>

              <div className="card" style={{ marginTop: 16 }}>
                <div className="card-title">Player Tagging</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {players.map((name) => (
                    <label key={name} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <input type="checkbox" checked={form.taggedPlayers.includes(name)} onChange={() => togglePlayer(name)} />
                      <span style={{ fontSize: 14, color: "var(--mid)" }}>{name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="card" style={{ marginTop: 16 }}>
                <div className="card-title">Report Notes for AI</div>
                <textarea className="input" value={form.notes} onChange={(e) => onChange("notes", e.target.value)} placeholder="Any context for the AI analyst..." />
              </div>

              {status ? <div className="callout blue" style={{ marginTop: 16 }}><p>{status}</p></div> : null}
              {error ? <div className="callout" style={{ marginTop: 16, borderColor: "rgba(220,53,69,.3)", background: "rgba(220,53,69,.08)" }}><p style={{ color: "#d63447" }}>{error}</p></div> : null}

              {generationInfo ? (
                <div className="card" style={{ marginTop: 16 }}>
                  <div className="card-title">Generation Details</div>
                  <p style={{ fontSize: 14, color: "var(--mid)", marginBottom: 10 }}>
                    Source: <strong>{generationInfo.model}</strong> | Report status: <strong>HTML ready</strong>
                  </p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                    <a className="btn btn-secondary" href={generationInfo.downloadReportUrl} target="_blank" rel="noreferrer">Open Report</a>
                    <a className="btn btn-secondary" href={generationInfo.downloadReportUrl} download>Download Report</a>
                    <a className="btn btn-secondary" href={generationInfo.transcriptFileUrl} target="_blank">View Transcript File</a>
                    <a className="btn btn-secondary" href={generationInfo.metadataFileUrl} target="_blank">View Generation Metadata</a>
                    <a className="btn btn-secondary" href={generationInfo.generationLogFile} target="_blank">View Generation Log</a>
                  </div>
                  <div className="form-group">
                    <label className="input-label">Transcript sent to model</label>
                    <p style={{ margin: "0 0 8px 0", color: "var(--mid)", fontSize: 13 }}>
                      Showing preview only ({generationInfo.transcriptFedCount || 0} total segments were fed). Use "View Transcript File" for full content.
                    </p>
                    <textarea className="input" rows={14} readOnly value={JSON.stringify(generationInfo.transcriptFedPreview || [], null, 2)} />
                  </div>
                </div>
              ) : null}

              <button className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center", marginTop: 20 }} disabled={loading} type="submit">
                {loading ? "Processing..." : "Submit for Processing →"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

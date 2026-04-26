import { coaches, players, reports, teams } from "@/lib/demo-data";

function badgeClass(status) {
  if (status === "Published") return "badge green";
  if (status === "Pending") return "badge orange";
  return "badge blue";
}

export function getPageMeta(role, slug) {
  const path = slug.length ? slug.join("/") : "dashboard";
  const map = {
    admin: {
      dashboard: ["Admin Dashboard", "Platform Overview · April 2026"],
      reports: ["All Reports", "Reports Management"],
      "reports/new": ["New Match Report", "Submit YouTube match for AI analysis"],
      "reports/pending": ["Pending Report Approval", "1 awaiting review"],
      "profiles/players": ["All Players", "Players Directory"],
      "profiles/coaches": ["All Coaches", "Coaches Directory"],
      "profiles/pending": ["Pending Profile Approvals", "2 items need review"],
      users: ["All Users", "User Management"],
      "users/invite": ["Invite a New User", "Create player or coach invite"],
      settings: ["Settings", "Teams, prompts and notifications"]
    },
    coach: {
      dashboard: ["Coach Dashboard", "Coach · Falcon U18 Elite · Riyadh"],
      profile: ["My Profile", "Published coach profile"],
      team: ["Team & Players", "Falcon U18 Elite"],
      reports: ["Match Reports", "My Team"]
    },
    player: {
      dashboard: ["Player Dashboard", "Point Guard · Falcon U18 Elite"],
      profile: ["My Profile", "Published player profile"],
      reports: ["My Match Reports", "Published reports"],
      "reports/request": ["Request a Match Report", "Send request to admin"]
    }
  };
  return map[role]?.[path] || null;
}

export function RolePageContent({ role, slug }) {
  const path = slug.length ? slug.join("/") : "dashboard";

  if (role === "admin" && path === "dashboard") {
    return (
      <>
        <div className="grid-3">
          <div className="card"><strong>Pending Profiles:</strong> 2</div>
          <div className="card"><strong>Pending Reports:</strong> 1</div>
          <div className="card"><strong>Total Players:</strong> 3</div>
        </div>
        <div className="card" style={{ marginTop: 12 }}>
          <h3 style={{ marginTop: 0 }}>Recent Reports</h3>
          <table className="table">
            <thead><tr><th>Title</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>{reports.map((r) => <tr key={r.id}><td>{r.title}</td><td>{r.date}</td><td><span className={badgeClass(r.status)}>{r.status}</span></td></tr>)}</tbody>
          </table>
        </div>
      </>
    );
  }

  if (role === "admin" && path === "reports") {
    return (
      <div className="card">
        <table className="table">
          <thead><tr><th>Title</th><th>Teams</th><th>Date</th><th>Status</th><th>Linked</th></tr></thead>
          <tbody>{reports.map((r) => <tr key={r.id}><td>{r.title}</td><td>{r.teams}</td><td>{r.date}</td><td><span className={badgeClass(r.status)}>{r.status}</span></td><td>{r.linked}</td></tr>)}</tbody>
        </table>
      </div>
    );
  }

  if (role === "admin" && path === "reports/new") {
    return (
      <div className="grid-2">
        <div className="card">
          <div className="field"><label>YouTube Match URL</label><input className="input" placeholder="https://youtube.com/watch?v=..." /></div>
          <div className="field"><label>Match Title</label><input className="input" placeholder="Falcon U18 vs Al-Nassr Youth · Apr 2026" /></div>
          <div className="field"><label>Match Date</label><input className="input" type="date" /></div>
          <div className="field"><label>Competition / League</label><input className="input" placeholder="Saudi U18 Championship" /></div>
          <div className="field"><label>Team A</label><select className="select">{teams.map((t) => <option key={t}>{t}</option>)}</select></div>
          <div className="field"><label>Team B</label><select className="select">{teams.map((t) => <option key={t}>{t}</option>)}</select></div>
          <button className="btn btn-primary">Submit for Processing</button>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Processing Status</h3>
          <p>1. YouTube URL Validated</p><p>2. Audio Transcription</p><p>3. AI Analysis</p><p>4. Report Draft Ready</p><p>5. Awaiting Admin Review</p>
        </div>
      </div>
    );
  }

  if (role === "admin" && path === "reports/pending") {
    return <div className="card"><h3 style={{ marginTop: 0 }}>R03 — Saudi U20 Championship</h3><p>AI report preview and raw data for approval workflow.</p><button className="btn btn-ghost">Edit</button>{" "}<button className="btn" style={{ background: "#fee2e2", color: "#7f1d1d" }}>Reject</button>{" "}<button className="btn" style={{ background: "var(--lime)" }}>Approve & Publish</button></div>;
  }

  if (role === "admin" && path === "profiles/players") {
    return <div className="card"><table className="table"><thead><tr><th>Name</th><th>Position</th><th>Team</th><th>Level</th><th>Coach</th><th>Status</th></tr></thead><tbody>{players.map((p) => <tr key={p.name}><td>{p.name}</td><td>{p.position}</td><td>{p.team}</td><td>{p.level}</td><td>{p.coach}</td><td><span className={badgeClass(p.status)}>{p.status}</span></td></tr>)}</tbody></table></div>;
  }

  if (role === "admin" && path === "profiles/coaches") {
    return <div className="card"><table className="table"><thead><tr><th>Name</th><th>Certification</th><th>Status</th><th>Active Students</th><th>Profile Status</th></tr></thead><tbody>{coaches.map((c) => <tr key={c.name}><td>{c.name}</td><td>{c.certification}</td><td>{c.status}</td><td>{c.activeStudents}</td><td><span className={badgeClass(c.profileStatus)}>{c.profileStatus}</span></td></tr>)}</tbody></table></div>;
  }

  if (role === "admin" && path === "profiles/pending") {
    return <div className="card"><p>Kareem Mostafa and Hassan Al-Zahrawi profile review queue.</p></div>;
  }
  if (role === "admin" && path === "users") {
    return <div className="card"><p>All users table with active/pending state.</p></div>;
  }
  if (role === "admin" && path === "users/invite") {
    return <div className="card"><div className="field"><label>Role</label><select className="select"><option>Player</option><option>Coach</option></select></div><div className="field"><label>First Name</label><input className="input" /></div><div className="field"><label>Last Name</label><input className="input" /></div><div className="field"><label>Email</label><input className="input" type="email" /></div><button className="btn btn-primary">Send Invite Email</button></div>;
  }
  if (role === "admin" && path === "settings") {
    return <div className="card"><p>Teams Registry, AI prompts, and notifications toggles.</p></div>;
  }

  if (role === "coach" && path === "dashboard") return <div className="grid-3"><div className="card">Active Players: 3</div><div className="card">Published Reports: 2</div><div className="card">Team Record: 4W-2L</div></div>;
  if (role === "coach" && path === "profile") return <div className="card"><p>Omar Salah full profile and AI philosophy.</p></div>;
  if (role === "coach" && path === "team") return <div className="card"><p>Falcon U18 roster and player cards.</p></div>;
  if (role === "coach" && path === "reports") return <div className="card"><p>R01 and R02 full report previews.</p></div>;

  if (role === "player" && path === "dashboard") return <div className="grid-3"><div className="card">PPG: 28.4</div><div className="card">APG: 7.2</div><div className="card">FT%: 87%</div></div>;
  if (role === "player" && path === "profile") return <div className="card"><p>Ahmed published profile with AI narrative bio.</p></div>;
  if (role === "player" && path === "reports") return <div className="card"><p>R01 and R02 reports with highlights.</p></div>;
  if (role === "player" && path === "reports/request") return <div className="card"><div className="field"><label>Match Name</label><input className="input" /></div><div className="field"><label>Match Date</label><input className="input" type="date" /></div><div className="field"><label>YouTube Link</label><input className="input" /></div><div className="field"><label>Notes</label><textarea className="textarea" rows={4} /></div><button className="btn btn-primary">Send Request</button></div>;

  return <div className="card">Page not found.</div>;
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const nav = {
  admin: [
    { label: "Overview", items: [{ href: "/admin/dashboard", name: "Dashboard" }] },
    {
      label: "Reports",
      items: [
        { href: "/admin/reports", name: "All Reports" },
        { href: "/admin/reports/new", name: "New Report" },
        { href: "/admin/reports/pending", name: "Pending Approval" }
      ]
    },
    {
      label: "Profiles",
      items: [
        { href: "/admin/profiles/players", name: "All Players" },
        { href: "/admin/profiles/coaches", name: "All Coaches" },
        { href: "/admin/profiles/pending", name: "Pending Approval" }
      ]
    },
    {
      label: "Users",
      items: [
        { href: "/admin/users", name: "All Users" },
        { href: "/admin/users/invite", name: "Invite User" }
      ]
    },
    { label: "Settings", items: [{ href: "/admin/settings", name: "Settings" }] }
  ],
  coach: [
    { label: "Overview", items: [{ href: "/coach/dashboard", name: "Dashboard" }] },
    { label: "My Profile", items: [{ href: "/coach/profile", name: "View Profile" }] },
    { label: "Team", items: [{ href: "/coach/team", name: "Team & Players" }] },
    { label: "Reports", items: [{ href: "/coach/reports", name: "Match Reports" }] }
  ],
  player: [
    { label: "Overview", items: [{ href: "/player/dashboard", name: "Dashboard" }] },
    { label: "My Profile", items: [{ href: "/player/profile", name: "View Profile" }] },
    {
      label: "Reports",
      items: [
        { href: "/player/reports", name: "My Reports" },
        { href: "/player/reports/request", name: "Request Report" }
      ]
    }
  ]
};

export default function AppShell({ user, children, title, subtitle }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <h2 style={{ margin: "0 8px 12px" }}>SPINOVA</h2>
        {nav[user.role].map((section) => (
          <div key={section.label}>
            <div className="side-label">{section.label}</div>
            {section.items.map((item) => (
              <Link
                className={`side-link ${pathname === item.href ? "active" : ""}`}
                key={item.href}
                href={item.href}
              >
                {item.name}
              </Link>
            ))}
          </div>
        ))}
        <button className="btn btn-ghost" onClick={logout} style={{ marginTop: 16, width: "100%" }}>
          Logout
        </button>
      </aside>
      <section className="main">
        <div className="topbar">
          <div>
            <strong>{title}</strong>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{subtitle}</div>
          </div>
          <div>
            <span className="badge blue" style={{ marginRight: 8 }}>
              {user.role.toUpperCase()}
            </span>
            {user.name}
          </div>
        </div>
        <main className="content">{children}</main>
      </section>
    </div>
  );
}

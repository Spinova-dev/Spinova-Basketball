import { promises as fs } from "node:fs";
import path from "node:path";
import { localHrefMaps } from "@/lib/route-map";

const demoRootCandidates = [
  path.join(process.cwd(), "Spinova Demo"),
  path.join(process.cwd(), "..", "Spinova Demo")
];

async function resolveDemoFile(relativeFile) {
  for (const root of demoRootCandidates) {
    try {
      const p = path.join(root, relativeFile);
      await fs.access(p);
      return p;
    } catch {}
  }
  return path.join(demoRootCandidates[0], relativeFile);
}

function buildTopbarUser(user) {
  return `
    <div class="topbar-user" id="topbar-user">
      <span class="role-badge">${user.role.toUpperCase()}</span>
      <span>${user.name}</span>
      <button class="logout-btn" onclick="logout()">Logout</button>
    </div>
  `;
}

function rewriteBody(body, role, user) {
  let html = body;
  html = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  html = html.replace(
    '<div class="topbar-user" id="topbar-user"></div>',
    buildTopbarUser(user)
  );
  html = html.replace(/href="\.\.\/login\.html"/g, 'href="/login"');
  html = html.replace(/href="login\.html"/g, 'href="/login"');

  const map = localHrefMaps[role] || {};
  for (const [from, to] of Object.entries(map)) {
    html = html.split(from).join(to);
  }
  return html;
}

export default async function LegacyTemplate({ file, role, user }) {
  const filePath = await resolveDemoFile(file);
  const source = await fs.readFile(filePath, "utf8");
  const bodyMatch = source.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyHtml = bodyMatch ? bodyMatch[1] : source;
  const output = rewriteBody(bodyHtml, role, user);

  return <div dangerouslySetInnerHTML={{ __html: output }} />;
}

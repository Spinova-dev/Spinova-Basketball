import { promises as fs } from "node:fs";
import path from "node:path";
import { localHrefMaps } from "@/lib/route-map";

const demoRoot = path.join(process.cwd(), "Spinova Demo");

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
  const filePath = path.join(demoRoot, file);
  const source = await fs.readFile(filePath, "utf8");
  const bodyMatch = source.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyHtml = bodyMatch ? bodyMatch[1] : source;
  const output = rewriteBody(bodyHtml, role, user);

  return <div dangerouslySetInnerHTML={{ __html: output }} />;
}

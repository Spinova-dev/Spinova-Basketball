export async function GET() {
  const authentikSourceSlug = (process.env.AUTH_AUTHENTIK_SOURCE_SLUG || "").trim() || null;
  return Response.json({ authentikSourceSlug });
}

import { auth } from "@/auth";
import { createReportArtifacts } from "@/lib/domain-store";
import { promises as fs } from "node:fs";
import path from "node:path";

function slugify(value) {
  return String(value || "report")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function extractVideoId(youtubeUrl) {
  try {
    const parsed = new URL(youtubeUrl);
    return parsed.searchParams.get("v") || null;
  } catch {
    return null;
  }
}

async function generateViaN8n(youtubeUrl) {
  const encodedUrl = encodeURIComponent(youtubeUrl);
  const endpoint = `https://dataflow.webmeccano.cloud/webhook/youtube?url=${encodedUrl}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8 * 60 * 1000);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      signal: controller.signal,
      cache: "no-store"
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`n8n flow failed (${response.status}): ${body.slice(0, 300)}`);
    }

    const rawText = await response.text();
    const trimmed = rawText?.trim();
    if (!trimmed) {
      throw new Error("n8n response was empty.");
    }

    // Case 1: webhook returns HTML directly.
    if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
      return rawText;
    }

    // Case 2: webhook returns JSON object or array with html field.
    try {
      const payload = JSON.parse(rawText);
      const first = Array.isArray(payload) ? payload[0] : payload;
      const html = first?.html || first?.reportHtml || first?.data?.html || null;
      if (typeof html === "string" && html.trim()) {
        return html;
      }
    } catch {
      // If not JSON, continue to error below.
    }

    throw new Error("n8n response did not contain valid HTML.");
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return Response.json({ error: "Admin access required." }, { status: 403 });
    }

    const body = await request.json();
    if (!body.youtubeUrl) {
      return Response.json({ error: "YouTube URL is required." }, { status: 400 });
    }

    const generatedHtml = await generateViaN8n(body.youtubeUrl);

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const reportSlug = slugify(body.matchTitle || body.competition || "basketball-report");
    const reportsDir = path.join(process.cwd(), "public", "generated", "reports");
    const transcriptsDir = path.join(process.cwd(), "public", "generated", "transcripts");
    const metaDir = path.join(process.cwd(), "public", "generated", "meta");
    const logsDir = path.join(process.cwd(), "generated");
    await fs.mkdir(reportsDir, { recursive: true });
    await fs.mkdir(transcriptsDir, { recursive: true });
    await fs.mkdir(metaDir, { recursive: true });
    await fs.mkdir(logsDir, { recursive: true });

    const reportFileName = `${reportSlug}-${id}.html`;
    const transcriptFileName = `${reportSlug}-${id}-transcript.json`;
    const metaFileName = `${reportSlug}-${id}-meta.json`;

    await fs.writeFile(path.join(reportsDir, reportFileName), generatedHtml, "utf8");
    await fs.writeFile(
      path.join(transcriptsDir, transcriptFileName),
      JSON.stringify([], null, 2),
      "utf8"
    );

    const meta = {
      id,
      createdAt: new Date().toISOString(),
      youtubeUrl: body.youtubeUrl,
      matchTitle: body.matchTitle || "",
      matchDate: body.matchDate || "",
      competition: body.competition || "",
      venue: body.venue || "",
      taggedPlayers: body.taggedPlayers || [],
      notes: body.notes || "",
      source: "n8n-youtube-webhook",
      transcriptCount: 0,
      transcriptFedCount: 0,
      reportFile: `/generated/reports/${reportFileName}`,
      transcriptFile: `/generated/transcripts/${transcriptFileName}`
    };

    await fs.writeFile(path.join(metaDir, metaFileName), JSON.stringify(meta, null, 2), "utf8");
    await fs.appendFile(path.join(logsDir, "report-generation-log.jsonl"), `${JSON.stringify(meta)}\n`, "utf8");

    const persistedReportId = await createReportArtifacts({
      appUserId: session.user.appUserId,
      reportInput: {
        ...body,
        html: generatedHtml,
        videoId: extractVideoId(body.youtubeUrl),
        role: session.user.role
      },
      reportFile: `/generated/reports/${reportFileName}`,
      transcriptFile: `/generated/transcripts/${transcriptFileName}`,
      transcriptRows: []
    });

    return Response.json({
      ok: true,
      reportId: persistedReportId,
      transcriptCount: 0,
      html: generatedHtml,
      transcriptFedPreview: [],
      transcriptFedCount: 0,
      model: "n8n-webhook",
      usage: null,
      estimatedCostUsd: null,
      downloadReportUrl: `/generated/reports/${reportFileName}`,
      transcriptFileUrl: `/generated/transcripts/${transcriptFileName}`,
      metadataFileUrl: `/generated/meta/${metaFileName}`,
      generationLogFile: "/generated/report-generation-log.jsonl"
    });
  } catch (error) {
    return Response.json(
      { error: error?.message || "Failed to generate report." },
      { status: 500 }
    );
  }
}

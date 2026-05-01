import { fetchTranscriptWithTimestamps, generateReportHtml } from "@/lib/report-generation";
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

    const transcript = await fetchTranscriptWithTimestamps(body.youtubeUrl);
    if (!transcript.length) {
      return Response.json({ error: "No transcript found for this video." }, { status: 400 });
    }

    const generated = await generateReportHtml({
      youtubeUrl: body.youtubeUrl,
      matchTitle: body.matchTitle || "",
      matchDate: body.matchDate || "",
      competition: body.competition || "",
      venue: body.venue || "",
      taggedPlayers: body.taggedPlayers || [],
      notes: body.notes || "",
      transcript
    });

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

    await fs.writeFile(path.join(reportsDir, reportFileName), generated.html, "utf8");
    await fs.writeFile(
      path.join(transcriptsDir, transcriptFileName),
      JSON.stringify(generated.transcriptUsed, null, 2),
      "utf8"
    );
    const transcriptFedPreview = [
      ...generated.transcriptUsed.slice(0, 80),
      ...(generated.transcriptUsed.length > 160 ? [{ index: -1, start: 0, duration: 0, text: "...truncated preview..." }] : []),
      ...generated.transcriptUsed.slice(-80)
    ];

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
      model: generated.model,
      usage: generated.usage,
      estimatedCostUsd: generated.estimatedCostUsd,
      transcriptCount: transcript.length,
      transcriptFedCount: generated.transcriptUsed.length,
      reportFile: `/generated/reports/${reportFileName}`,
      transcriptFile: `/generated/transcripts/${transcriptFileName}`
    };

    await fs.writeFile(path.join(metaDir, metaFileName), JSON.stringify(meta, null, 2), "utf8");
    await fs.appendFile(path.join(logsDir, "report-generation-log.jsonl"), `${JSON.stringify(meta)}\n`, "utf8");

    const persistedReportId = await createReportArtifacts({
      appUserId: session.user.appUserId,
      reportInput: {
        ...body,
        html: generated.html,
        videoId: extractVideoId(body.youtubeUrl),
        role: session.user.role
      },
      reportFile: `/generated/reports/${reportFileName}`,
      transcriptFile: `/generated/transcripts/${transcriptFileName}`,
      transcriptRows: generated.transcriptUsed
    });

    return Response.json({
      ok: true,
      reportId: persistedReportId,
      transcriptCount: transcript.length,
      html: generated.html,
      transcriptFedPreview,
      transcriptFedCount: generated.transcriptUsed.length,
      model: generated.model,
      usage: generated.usage,
      estimatedCostUsd: generated.estimatedCostUsd,
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

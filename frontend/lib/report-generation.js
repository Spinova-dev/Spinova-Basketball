import { promises as fs } from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { YoutubeTranscript } from "youtube-transcript";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const CHUNK_MODEL_CANDIDATES = ["claude-haiku-4-5-20251001", "claude-sonnet-4-6"];
const FINAL_MODEL_CANDIDATES = ["claude-sonnet-4-6", "claude-haiku-4-5-20251001", "claude-opus-4-7"];

const MODEL_PRICING_PER_MILLION_USD = {
  "claude-haiku-4-5-20251001": { input: 0.8, output: 4 },
  "claude-sonnet-4-6": { input: 3, output: 15 },
  "claude-opus-4-7": { input: 15, output: 75 }
};

const REPORT_TEMPLATES = {
  match1: "basketball_report.html",
  series: "basketball_series_report.html",
  match2: "basketball_report_match2.html"
};

function normalizeYouTubeUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/watch?v=${parsed.pathname.replace("/", "")}`;
    }
    return url;
  } catch {
    return url;
  }
}

function extractYouTubeVideoId(input) {
  const value = String(input || "").trim();
  if (!value) return null;

  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
    return value;
  }

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.replace("www.", "");

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id && id.length === 11 ? id : null;
    }

    if (host.endsWith("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v && v.length === 11) return v;

      const parts = parsed.pathname.split("/").filter(Boolean);
      const knownPrefix = ["shorts", "embed", "live", "v"];
      if (parts.length >= 2 && knownPrefix.includes(parts[0]) && parts[1].length === 11) {
        return parts[1];
      }
    }
  } catch {
    // Ignore URL parse failures, fallback regex below.
  }

  const match = value.match(/(?:v=|\/embed\/|\/shorts\/|youtu\.be\/|\/live\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1] || null;
}

export async function fetchTranscriptWithTimestamps(youtubeUrl) {
  const normalized = normalizeYouTubeUrl(youtubeUrl);
  const videoId = extractYouTubeVideoId(normalized);
  if (!videoId) {
    throw new Error("Invalid YouTube URL. Could not extract video ID.");
  }

  let transcript;
  try {
    transcript = await YoutubeTranscript.fetchTranscript(videoId);
  } catch {
    transcript = await YoutubeTranscript.fetchTranscript(normalized);
  }

  return transcript.map((item, index) => ({
    index: index + 1,
    start: Number(item.offset || 0),
    duration: Number(item.duration || 0),
    text: String(item.text || "").trim()
  }));
}

async function readTemplate(name) {
  const filePath = path.join(process.cwd(), "report-ex", name);
  return fs.readFile(filePath, "utf8");
}

function buildPrompt(data) {
  const markerText = `${data.matchTitle} ${data.notes}`.toLowerCase();
  let selectedTemplate = REPORT_TEMPLATES.match1;
  if (markerText.includes("series") || markerText.includes("combined")) {
    selectedTemplate = REPORT_TEMPLATES.series;
  } else if (markerText.includes("match 2") || markerText.includes("round robin")) {
    selectedTemplate = REPORT_TEMPLATES.match2;
  }
  const templateName = selectedTemplate;
  return { selectedTemplate, templateName };
}

function transcriptToCompactText(transcript) {
  return transcript
    .map((row) => {
      const startSec = Math.round(Number(row.start || 0) / 1000);
      return `[${startSec}s] ${row.text}`;
    })
    .join("\n");
}

function splitTranscriptIntoChunks(transcript, maxChunkChars = 22000) {
  const chunks = [];
  let currentChunk = [];
  let currentLength = 0;

  for (const row of transcript) {
    const line = `[${Math.round(Number(row.start || 0) / 1000)}s] ${row.text}`;
    if (currentChunk.length > 0 && currentLength + line.length > maxChunkChars) {
      chunks.push(currentChunk);
      currentChunk = [];
      currentLength = 0;
    }
    currentChunk.push(row);
    currentLength += line.length + 1;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function readTextContent(response) {
  return response?.content?.find((c) => c.type === "text")?.text?.trim() || "";
}

function parseJsonBlock(value) {
  const text = String(value || "").trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first >= 0 && last > first) {
      try {
        return JSON.parse(text.slice(first, last + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function callClaudeWithFallback({
  system,
  user,
  models = FINAL_MODEL_CANDIDATES,
  maxTokens = 4096,
  temperature = 0.1
}) {
  let lastError = null;
  for (const model of models) {
    try {
      const response = await anthropic.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        system,
        messages: [{ role: "user", content: user }]
      });
      return { response, model };
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(
    `${lastError?.message || "Claude model call failed."} Tried models: ${models.join(", ")}`
  );
}

function mergeChunkSummaries(summaries) {
  const teams = new Set();
  const players = new Set();
  const quarterMentions = new Set();
  const scoreMentions = [];
  const keyEvents = [];
  const coachNotes = [];
  const styleVotes = { single_match: 0, series: 0 };

  for (const s of summaries) {
    for (const t of s?.teamsDetected || []) teams.add(String(t).trim());
    for (const p of s?.players || []) players.add(String(p).trim());
    for (const q of s?.quarterMentions || []) quarterMentions.add(String(q).trim());
    for (const sm of s?.scoreMentions || []) scoreMentions.push(sm);
    for (const ev of s?.keyEvents || []) keyEvents.push(ev);
    for (const note of s?.coachNotes || []) coachNotes.push(String(note).trim());
    if (s?.style === "series") styleVotes.series += 1;
    else styleVotes.single_match += 1;
  }

  keyEvents.sort((a, b) => Number(a?.timeSec || 0) - Number(b?.timeSec || 0));

  return {
    teamsDetected: Array.from(teams).filter(Boolean).slice(0, 8),
    players: Array.from(players).filter(Boolean).slice(0, 30),
    quarterMentions: Array.from(quarterMentions).filter(Boolean).slice(0, 8),
    scoreMentions: scoreMentions.slice(0, 30),
    keyEvents: keyEvents.slice(0, 70),
    coachNotes: coachNotes.filter(Boolean).slice(0, 30),
    style: styleVotes.series > styleVotes.single_match ? "series" : "single_match"
  };
}

function hasBranding(html) {
  const value = String(html || "").toLowerCase();
  return (
    value.includes("spinova") &&
    (value.includes("/assets/images/spinova-logo.png") || value.includes("spinova-logo"))
  );
}

function isLikelyCompleteHtml(html) {
  const value = String(html || "").toLowerCase();
  return value.includes("<html") && value.includes("</html>") && value.includes("<body") && value.includes("</body>");
}

async function repairReportHtmlIfNeeded(html, templateHtml) {
  if (isLikelyCompleteHtml(html) && hasBranding(html)) return html;
  const repairPrompt = `
Fix the following generated report HTML.
Hard requirements:
1) Return COMPLETE valid standalone HTML.
2) Keep full content density; do not shorten sections.
3) Add Spinova branding header/footer and logo path exactly: /assets/images/spinova-logo.png
4) Keep score and team naming internally consistent across all sections.
5) Ensure all tags are properly closed.

Template reference:
${templateHtml}

Broken HTML:
${html}
`;
  const fixed = await callClaudeWithFallback({
    system: "You repair HTML reports with strict consistency. Return HTML only.",
    user: repairPrompt.trim(),
    models: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6"],
    maxTokens: 4096,
    temperature: 0
  });
  return readTextContent(fixed.response) || html;
}

async function buildTranscriptIntelligence(transcript) {
  const chunks = splitTranscriptIntoChunks(transcript);
  const summaries = [];
  const usedSegments = [];
  const usageByModel = {};

  const system = `
You are a basketball analyst. Extract high-confidence facts from transcript chunks.
Return ONLY valid JSON, no markdown.
`;

  for (let i = 0; i < chunks.length; i += 1) {
    const chunk = chunks[i];
    const chunkText = transcriptToCompactText(chunk);
    usedSegments.push(...chunk);

    const user = `
Chunk ${i + 1}/${chunks.length}
Extract data from this commentary transcript chunk.

Return JSON with this exact schema:
{
  "teamsDetected": ["..."],
  "scoreMentions": [{"score":"96-...","evidence":"quote","timeSec":123}],
  "quarterMentions": ["Q1","Q2","Q3","Q4","OT"],
  "keyEvents": [{"timeSec":123,"event":"...","team":"...","players":["..."]}], // max 8 items
  "players": ["..."], // max 10 names
  "coachNotes": ["..."], // max 5 notes
  "style": "single_match | series",
  "confidence": 0.0
}

Transcript:
${chunkText}
`;

    const { response, model } = await callClaudeWithFallback({
      system: system.trim(),
      user: user.trim(),
      models: CHUNK_MODEL_CANDIDATES,
      maxTokens: 2200,
      temperature: 0
    });

    const parsed = parseJsonBlock(readTextContent(response));
    if (parsed) summaries.push(parsed);

    usageByModel[model] = usageByModel[model] || { inputTokens: 0, outputTokens: 0 };
    usageByModel[model].inputTokens += Number(response?.usage?.input_tokens || 0);
    usageByModel[model].outputTokens += Number(response?.usage?.output_tokens || 0);
  }

  return { summaries, usageByModel, usedSegments };
}

export async function generateReportHtml(data) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is missing in .env.local");
  }

  const transcriptIntelligence = await buildTranscriptIntelligence(data.transcript);
  const mergedIntelligence = mergeChunkSummaries(transcriptIntelligence.summaries);
  const { selectedTemplate, templateName } = buildPrompt(data);
  const templateHtml = await readTemplate(templateName);
  const transcriptHead = data.transcript.slice(0, 120);
  const transcriptTail = data.transcript.slice(-80);

  const systemPrompt = `
You generate complete basketball match reports in HTML.
Return ONLY valid standalone HTML.
The output must visually and structurally match the provided template style exactly:
- same style philosophy
- same section density
- realistic basketball metrics and narratives
- rich tables/cards/timelines where applicable
Do not include markdown fences.
`;

  const userPrompt = `
Generate a full report HTML using this exact style template as reference:
TEMPLATE_NAME: ${templateName}

TEMPLATE_HTML:
${templateHtml}

INPUT:
${JSON.stringify(
    {
      reportMeta: {
        youtubeUrl: data.youtubeUrl,
        title: data.matchTitle,
        date: data.matchDate,
        competition: data.competition,
        venue: data.venue,
        taggedPlayers: data.taggedPlayers,
        notes: data.notes
      },
      transcriptHead,
      transcriptTail,
      mergedIntelligence
    },
    null,
    2
  )}

Rules:
1) Output a COMPLETE HTML file.
2) Include deep, realistic analytics that are consistent with transcript timing.
3) Use transcript timestamps to create a timeline section.
4) Infer BOTH team names and final score from transcript context directly; never ask for manual team names or score.
5) Keep language professional, coaching-oriented, and specific.
6) If score evidence is weak, provide a clearly labeled "estimated final score from transcript evidence".
7) Keep all styles inline within HTML like the template.
8) If details are missing, infer plausible values but maintain consistency.
9) MANDATORY BRANDING: include Spinova branding in header and footer and logo image path '/assets/images/spinova-logo.png'.
10) MANDATORY CONSISTENCY: one final score only; same score everywhere in hero, team cards, quarter summaries, and narrative.
11) Include all major sections from template (overview, both teams, players, timeline/moments, coaching notes, footer).
`;

  const finalGeneration = await callClaudeWithFallback({
    system: systemPrompt.trim(),
    user: userPrompt.trim(),
    models: FINAL_MODEL_CANDIDATES,
    maxTokens: 8192,
    temperature: 0.2
  });
  let response = finalGeneration.response;
  const selectedModel = finalGeneration.model;
  let html = readTextContent(response);

  // If generation hits token cap and HTML is incomplete, request continuation chunks.
  let continuationCount = 0;
  while (
    continuationCount < 2 &&
    response?.stop_reason === "max_tokens" &&
    html &&
    !html.toLowerCase().includes("</html>")
  ) {
    continuationCount += 1;
    const continuationPrompt = `
Continue the SAME HTML file from the exact end.
Do not restart, do not repeat earlier sections, do not add markdown.
Start directly with the next missing characters only.
Current ending snippet:
${html.slice(-1200)}
`;
    const continuation = await callClaudeWithFallback({
      system: "You continue existing HTML exactly.",
      user: continuationPrompt.trim(),
      models: FINAL_MODEL_CANDIDATES,
      maxTokens: 4096,
      temperature: 0.1
    });
    response = continuation.response;
    const continuationText = readTextContent(continuation.response);
    if (!continuationText) {
      break;
    }
    html += continuationText;
  }

  html = String(html || "").trim();
  if (!html) {
    throw new Error("Claude returned empty HTML output.");
  }
  html = await repairReportHtmlIfNeeded(html, templateHtml);

  const usageByModel = { ...transcriptIntelligence.usageByModel };
  usageByModel[selectedModel] = usageByModel[selectedModel] || { inputTokens: 0, outputTokens: 0 };
  usageByModel[selectedModel].inputTokens += Number(finalGeneration.response?.usage?.input_tokens || 0);
  usageByModel[selectedModel].outputTokens += Number(finalGeneration.response?.usage?.output_tokens || 0);

  const totalUsage = { inputTokens: 0, outputTokens: 0 };
  let estimatedCostUsd = 0;
  for (const [model, usage] of Object.entries(usageByModel)) {
    totalUsage.inputTokens += Number(usage.inputTokens || 0);
    totalUsage.outputTokens += Number(usage.outputTokens || 0);
    const pricing = MODEL_PRICING_PER_MILLION_USD[model] || { input: 0, output: 0 };
    estimatedCostUsd += (Number(usage.inputTokens || 0) / 1_000_000) * pricing.input;
    estimatedCostUsd += (Number(usage.outputTokens || 0) / 1_000_000) * pricing.output;
  }
  estimatedCostUsd = Number(estimatedCostUsd.toFixed(6));

  return {
    html,
    model: selectedModel,
    usage: totalUsage,
    usageByModel,
    estimatedCostUsd,
    transcriptUsed: transcriptIntelligence.usedSegments
  };
}

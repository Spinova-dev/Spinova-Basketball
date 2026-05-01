import { dbQuery, isDatabaseReady } from "@/lib/db";

function toUuidOrNull(value) {
  const text = String(value || "");
  return /^[0-9a-f-]{36}$/i.test(text) ? text : null;
}

export async function createReportArtifacts({
  appUserId,
  reportInput,
  reportFile,
  transcriptFile,
  transcriptRows
}) {
  if (!isDatabaseReady()) {
    return null;
  }

  const createdBy = toUuidOrNull(appUserId);
  if (!createdBy) {
    return null;
  }

  const reportResult = await dbQuery(
    `
      INSERT INTO reports (
        created_by,
        report_type,
        title,
        summary,
        source_video_url,
        source_video_id,
        report_html,
        metadata,
        status,
        generated_at
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8::jsonb,
        'published',
        NOW()
      )
      RETURNING id
    `,
    [
      createdBy,
      "match",
      reportInput.matchTitle || "Basketball Report",
      reportInput.notes || null,
      reportInput.youtubeUrl || null,
      reportInput.videoId || null,
      reportInput.html || "",
      JSON.stringify({
        matchDate: reportInput.matchDate || null,
        competition: reportInput.competition || null,
        venue: reportInput.venue || null,
        taggedPlayers: reportInput.taggedPlayers || []
      })
    ]
  );

  const reportId = reportResult.rows[0].id;

  await dbQuery(
    `
      INSERT INTO report_media (
        report_id,
        media_type,
        storage_provider,
        storage_key,
        file_name,
        mime_type,
        metadata,
        created_by
      )
      VALUES
        ($1, 'html', 'local', $2, $3, 'text/html', '{}'::jsonb, $4),
        ($1, 'json', 'local', $5, $6, 'application/json', '{}'::jsonb, $4)
    `,
    [reportId, reportFile, reportFile.split("/").pop(), transcriptFile, transcriptFile.split("/").pop(), createdBy]
  );

  await dbQuery(
    `
      INSERT INTO report_transcripts (
        report_id,
        language_code,
        source,
        transcript_json,
        transcript_text,
        segment_count,
        created_by
      )
      VALUES ($1, 'en', 'youtube', $2::jsonb, $3, $4, $5)
    `,
    [
      reportId,
      JSON.stringify(transcriptRows),
      transcriptRows.map((row) => row.text).join(" ").slice(0, 20000),
      transcriptRows.length,
      createdBy
    ]
  );

  await dbQuery(
    `
      INSERT INTO activity_log (
        actor_user_id,
        actor_role,
        event_type,
        entity_type,
        entity_id,
        payload
      )
      VALUES ($1, $2, 'report.created', 'report', $3, $4::jsonb)
    `,
    [createdBy, reportInput.role || "player", reportId, JSON.stringify({ title: reportInput.matchTitle || "" })]
  );

  return reportId;
}

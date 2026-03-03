import {
  buildFollowUpEmailHtml,
  getDailyFollowUpRows,
  getRecipientList,
  getTodayRangeInTimeZone,
  insertEmailJobLog,
  listOwnerUsers,
  requireCronAuth,
  sendResendEmail,
} from "@/lib/cruise-crm-email";

const TIME_ZONE = "Atlantic/Reykjavik";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    requireCronAuth(request);

    const baseUrl = process.env.CRUISE_CRM_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const fallbackRecipients = getRecipientList(process.env.CRUISE_CRM_FOLLOWUP_TO);
    const { endUtcIso, todayLabel } = getTodayRangeInTimeZone(TIME_ZONE);

    const [rows, owners] = await Promise.all([getDailyFollowUpRows(endUtcIso), listOwnerUsers()]);

    if (rows.length === 0) {
      await insertEmailJobLog({
        job_name: "daily_followup",
        status: "skipped",
        rows_count: 0,
        emails_sent: 0,
        message: "No due/overdue follow-ups",
      });

      return Response.json({ ok: true, skipped: true, reason: "no_due_rows" }, { status: 200 });
    }

    const ownerById = new Map(owners.map((owner) => [owner.id, owner]));
    const grouped = new Map<string, typeof rows>();
    for (const row of rows) {
      const key = row.owner_user_id ?? "unassigned";
      grouped.set(key, [...(grouped.get(key) ?? []), row]);
    }

    let sent = 0;

    for (const [ownerId, ownerRows] of grouped.entries()) {
      const owner = ownerById.get(ownerId);
      const recipients = owner?.email ? [owner.email] : fallbackRecipients;

      if (recipients.length === 0) {
        continue;
      }

      const html = buildFollowUpEmailHtml({
        ownerName: owner?.name ?? (ownerId === "unassigned" ? "Unassigned Leads" : ownerId),
        rows: ownerRows,
        baseUrl,
        todayLabel,
      });

      await sendResendEmail({
        to: recipients,
        subject: `Cruise CRM Follow-ups (${todayLabel})`,
        html,
      });

      sent += 1;
    }

    await insertEmailJobLog({
      job_name: "daily_followup",
      status: sent > 0 ? "success" : "skipped",
      rows_count: rows.length,
      emails_sent: sent,
      message: sent > 0 ? "Daily follow-up emails sent" : "No eligible recipients",
    });

    return Response.json({ ok: true, rows: rows.length, emails_sent: sent }, { status: 200 });
  } catch (error) {
    await insertEmailJobLog({
      job_name: "daily_followup",
      status: "error",
      rows_count: 0,
      emails_sent: 0,
      message: error instanceof Error ? error.message : String(error),
    }).catch(() => undefined);

    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unexpected error",
      },
      { status: 500 }
    );
  }
}

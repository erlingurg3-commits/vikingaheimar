import {
  buildWeeklyDigestEmailHtml,
  getRecipientList,
  getWeekRangeInTimeZone,
  getWeeklyDigestData,
  insertEmailJobLog,
  requireCronAuth,
  sendResendEmail,
} from "@/lib/cruise-crm-email";

const TIME_ZONE = "Atlantic/Reykjavik";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    requireCronAuth(request);

    const recipients = getRecipientList(process.env.CRUISE_CRM_DIGEST_TO);
    const baseUrl = process.env.CRUISE_CRM_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    if (recipients.length === 0) {
      await insertEmailJobLog({
        job_name: "weekly_digest",
        status: "skipped",
        rows_count: 0,
        emails_sent: 0,
        message: "No CRUISE_CRM_DIGEST_TO recipients configured",
      });

      return Response.json({ ok: true, skipped: true, reason: "no_recipients" }, { status: 200 });
    }

    const { startUtcIso, endUtcIso } = getWeekRangeInTimeZone(TIME_ZONE);
    const digest = await getWeeklyDigestData({ weekStartIso: startUtcIso, weekEndIso: endUtcIso });

    const totalLeads = Array.from(digest.statusCounts.values()).reduce((sum, value) => sum + value, 0);
    if (totalLeads === 0 && digest.topCruises.length === 0) {
      await insertEmailJobLog({
        job_name: "weekly_digest",
        status: "skipped",
        rows_count: 0,
        emails_sent: 0,
        message: "No digest data",
      });

      return Response.json({ ok: true, skipped: true, reason: "no_digest_rows" }, { status: 200 });
    }

    const html = buildWeeklyDigestEmailHtml({
      weekStartIso: startUtcIso,
      weekEndIso: endUtcIso,
      baseUrl,
      statusCounts: digest.statusCounts,
      wonThisWeek: digest.wonThisWeek,
      lostThisWeek: digest.lostThisWeek,
      topCruises: digest.topCruises,
      noOwner: digest.noOwner,
      noAgency: digest.noAgency,
    });

    await sendResendEmail({
      to: recipients,
      subject: "Cruise Sales Pipeline Digest",
      html,
    });

    await insertEmailJobLog({
      job_name: "weekly_digest",
      status: "success",
      rows_count: totalLeads,
      emails_sent: 1,
      message: "Weekly digest sent",
    });

    return Response.json(
      {
        ok: true,
        totalLeads,
        topCruises: digest.topCruises.length,
      },
      { status: 200 }
    );
  } catch (error) {
    await insertEmailJobLog({
      job_name: "weekly_digest",
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

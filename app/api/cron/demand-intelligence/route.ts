import { requireCronAuth } from "@/lib/cruise-crm-email";
import { refreshDemandIntelligence } from "@/lib/demand-intelligence/refresh";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isIsoDate(value: string | null) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export async function GET(request: Request) {
  try {
    requireCronAuth(request);

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    const result = await refreshDemandIntelligence({
      startDate: isIsoDate(startDate) ? startDate ?? undefined : undefined,
      endDate: isIsoDate(endDate) ? endDate ?? undefined : undefined,
    });

    return Response.json(
      {
        ok: true,
        storage: result.storage,
        archivePath: result.archivePath,
        latestPath: result.latestPath,
        generatedAt: result.file.generated_at,
        dateRange: result.file.date_range,
        signalCount: result.file.signals.length,
        highAlertDays: result.file.daily_summary.filter((row) => row.high_alert_day).length,
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unexpected error",
      },
      { status: 500 }
    );
  }
}
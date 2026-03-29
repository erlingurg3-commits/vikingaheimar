import { NextResponse } from "next/server";
import { syncBookings } from "@/lib/bokun/sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const now = new Date();

    // Default: sync current year from Jan 1 to today
    const from = body.from ?? { year: now.getFullYear(), month: 1, day: 1 };
    const to = body.to ?? {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };

    const result = await syncBookings({ from, to });

    return NextResponse.json({
      status: "ok",
      ...result,
      range: { from, to },
      syncedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}

// GET for easy browser testing
export async function GET() {
  const now = new Date();
  try {
    const result = await syncBookings({
      from: { year: now.getFullYear(), month: 1, day: 1 },
      to: {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
      },
    });
    return NextResponse.json({ status: "ok", ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: "error", message }, { status: 500 });
  }
}

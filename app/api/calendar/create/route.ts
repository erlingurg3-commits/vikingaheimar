import { NextRequest, NextResponse } from "next/server";
import { createCalendarEvent } from "@/lib/google-calendar";

const CALENDAR_ID = "info@vikingworld.is";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = await createCalendarEvent(CALENDAR_ID, body);
    return NextResponse.json(event);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/calendar/create]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

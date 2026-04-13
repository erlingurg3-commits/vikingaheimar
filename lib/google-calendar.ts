import { google, calendar_v3 } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

let cachedClient: calendar_v3.Calendar | null = null;

function getCalendarClient(): calendar_v3.Calendar {
  if (cachedClient) return cachedClient;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!email || !key) {
    throw new Error(
      "Google service account not configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY in .env.local.",
    );
  }

  const auth = new google.auth.JWT({
    email,
    key: key.replace(/\\n/g, "\n"),
    scopes: SCOPES,
  });

  cachedClient = google.calendar({ version: "v3", auth });
  return cachedClient;
}

export async function listCalendarEvents(
  calendarId: string,
  timeMin: string,
  timeMax: string,
) {
  const calendar = getCalendarClient();

  const res = await calendar.events.list({
    calendarId,
    timeMin,
    timeMax,
    timeZone: "Atlantic/Reykjavik",
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 250,
  });

  return (res.data.items ?? []) as Record<string, unknown>[];
}

export async function createCalendarEvent(
  calendarId: string,
  event: calendar_v3.Schema$Event,
) {
  // Service account is read-only scoped. Create requires a writable auth
  // (OAuth or an expanded scope). Kept as a stub to preserve import surface.
  throw new Error(
    "createCalendarEvent is not supported with the read-only service account. " +
      "Re-enable OAuth or broaden the service account scope to write events.",
  );
  // Unreachable — referenced to silence unused-parameter lint.
  void calendarId;
  void event;
}

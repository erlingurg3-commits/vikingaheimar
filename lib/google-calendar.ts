const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3";

let cachedToken: { token: string; expires: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires - 60_000) {
    return cachedToken.token;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Google Calendar not configured. Visit /api/calendar/auth to set up."
    );
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (!data.access_token) {
    throw new Error(
      "Failed to get Google access token: " + (data.error_description || data.error || "unknown")
    );
  }

  cachedToken = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in ?? 3600) * 1000,
  };

  return data.access_token;
}

export async function listCalendarEvents(
  calendarId: string,
  timeMin: string,
  timeMax: string
) {
  const token = await getAccessToken();
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    maxResults: "250",
    singleEvents: "true",
    orderBy: "startTime",
  });

  const res = await fetch(
    `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Calendar API ${res.status}: ${err.slice(0, 300)}`);
  }

  const data = await res.json();
  return (data.items || []) as Record<string, unknown>[];
}

export async function createCalendarEvent(
  calendarId: string,
  event: Record<string, unknown>
) {
  const token = await getAccessToken();

  const res = await fetch(
    `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Calendar API ${res.status}: ${err.slice(0, 300)}`);
  }

  return await res.json();
}

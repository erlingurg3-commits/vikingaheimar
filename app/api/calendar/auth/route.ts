import { NextRequest, NextResponse } from "next/server";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

function getRedirectUri() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return `${base}/api/calendar/auth`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new NextResponse(
      `<html><body style="background:#0d0c0a;color:#e8e0d2;font-family:monospace;padding:40px;max-width:640px">
        <h2 style="color:#c05a5a">Missing Google Credentials</h2>
        <p>Add these to your <code>.env.local</code> file:</p>
        <pre style="background:#1a1815;padding:16px;border-radius:4px">GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret</pre>
        <p style="color:#a89880;margin-top:24px">To get these:</p>
        <ol style="color:#a89880;line-height:2">
          <li>Go to <a href="https://console.cloud.google.com/apis/credentials" style="color:#c8874a">Google Cloud Console → Credentials</a></li>
          <li>Create an OAuth 2.0 Client ID (Web application)</li>
          <li>Add redirect URI: <code>${getRedirectUri()}</code></li>
          <li>Enable the <a href="https://console.cloud.google.com/apis/library/calendar-json.googleapis.com" style="color:#c8874a">Google Calendar API</a></li>
          <li>Copy Client ID and Secret to .env.local, then restart dev server</li>
          <li>Visit this page again to authorize</li>
        </ol>
      </body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  if (!code) {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: getRedirectUri(),
      response_type: "code",
      scope: "https://www.googleapis.com/auth/calendar",
      access_type: "offline",
      prompt: "consent",
    });
    return NextResponse.redirect(`${GOOGLE_AUTH_URL}?${params}`);
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getRedirectUri(),
      grant_type: "authorization_code",
    }),
  });

  const data = await res.json();

  if (data.refresh_token) {
    return new NextResponse(
      `<html><body style="background:#0d0c0a;color:#e8e0d2;font-family:monospace;padding:40px;max-width:640px">
        <h2 style="color:#7a9e8a">&#10003; Google Calendar Connected</h2>
        <p>Add this to your <code>.env.local</code>:</p>
        <pre style="background:#1a1815;padding:16px;border-radius:4px;word-break:break-all">GOOGLE_REFRESH_TOKEN=${data.refresh_token}</pre>
        <p style="color:#a89880">Then restart your dev server and open the <a href="/control-room.html" style="color:#c8874a">Control Room</a>.</p>
      </body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  return new NextResponse(
    `<html><body style="background:#0d0c0a;color:#e8e0d2;font-family:monospace;padding:40px">
      <h2 style="color:#c05a5a">Authorization Failed</h2>
      <pre style="background:#1a1815;padding:16px;border-radius:4px">${JSON.stringify(data, null, 2)}</pre>
      <p style="color:#a89880"><a href="/api/calendar/auth" style="color:#c8874a">Try again</a></p>
    </body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
}

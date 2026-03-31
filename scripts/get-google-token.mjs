import { readFileSync } from "fs";
import { createInterface } from "readline";
import { request } from "https";

// ── Read .env.local ──────────────────────────────────────────
const env = readFileSync(".env.local", "utf-8");
const get = (key) => {
  const m = env.match(new RegExp(`^${key}=(.+)$`, "m"));
  return m?.[1]?.trim();
};

const CLIENT_ID = get("GOOGLE_CLIENT_ID");
const CLIENT_SECRET = get("GOOGLE_CLIENT_SECRET");

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env.local");
  process.exit(1);
}

const REDIRECT_URI = "http://localhost:3099/api/auth/callback";
const SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent select_account",
  }).toString();

console.log("\n1. Open this URL in your browser:\n");
console.log(authUrl);
console.log("\n2. Sign in and grant access.");
console.log("3. Google will redirect to a localhost URL that won't load — that's OK.");
console.log("4. Copy the FULL URL from your browser address bar and paste it below.\n");

const rl = createInterface({ input: process.stdin, output: process.stdout });

rl.question("Paste the full redirect URL: ", (input) => {
  rl.close();
  let code;
  try {
    // Try parsing as a URL first (e.g. http://localhost?code=xxx)
    const url = new URL(input.trim());
    code = url.searchParams.get("code");
  } catch {
    // If that fails, treat the raw input as the code itself
    code = input.trim();
  }
  if (!code) {
    console.error("Could not extract authorization code from input.");
    process.exit(1);
  }
  exchangeCode(code);
});

function exchangeCode(code) {
  const body = new URLSearchParams({
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
  }).toString();

  const req = request(
    {
      hostname: "oauth2.googleapis.com",
      path: "/token",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(body),
      },
    },
    (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            console.error("\nToken exchange failed:", json.error, json.error_description ?? "");
            process.exit(1);
          }
          console.log("\n── Token response ──────────────────────────");
          if (json.refresh_token) {
            console.log(`\nGOOGLE_REFRESH_TOKEN=${json.refresh_token}\n`);
            console.log("Add this to your .env.local file.");
          } else {
            console.log("\nNo refresh_token returned. Full response:");
            console.log(JSON.stringify(json, null, 2));
            console.log("\nTip: revoke access at https://myaccount.google.com/permissions and try again.");
          }
        } catch {
          console.error("\nFailed to parse response:", data);
        }
        process.exit(0);
      });
    }
  );

  req.on("error", (err) => {
    console.error("Request failed:", err.message);
    process.exit(1);
  });

  req.write(body);
  req.end();
}

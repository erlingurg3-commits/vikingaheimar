# CLAUDE.md — Víkingaheimar (Viking World) Control Room

This file provides Claude Code with full project context. Read this before touching any file.

---

## Project Overview

**Project:** Víkingaheimar (Viking World) — Next.js website + Control Room dashboard  
**Owner:** Erlingur Gunnarsson (`erlingur@vikingworld.is`, `erlingurg3@gmail.com`)  
**Deployed:** Vercel  
**Repo root:** `C:\Users\erlin\vikingaheimar\` (Windows)  
**Live site:** vikingworld.is  

This is a Viking heritage museum on the Reykjanes Peninsula being transformed into an immersive entertainment center. The codebase serves two purposes:
1. **Public-facing website** — visitor info, booking, Viking content
2. **Control Room** — internal operations and intelligence dashboard (hidden from public nav, accessible via direct URL)

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase |
| Hosting | Vercel |
| Fonts | Norse (custom, `public/fonts/Norse.otf`, weight 400 only) + Cinzel (Google) |
| Animation | Framer Motion + CSS keyframes + Intersection Observer |
| Email | Resend |
| AI | Anthropic SDK (`@anthropic-ai/sdk`) — model: `claude-sonnet-4-20250514` |

---

## Brand & Design

**Palette:**
- Cyan: `#00c8ff` (primary accent)
- Deep navy: `#0a1628` (background)
- Viking gold: `#d4a843` (secondary accent)
- Nordic green: used sparingly

**Typography:**
- Display/headings: Norse (`public/fonts/Norse.otf`) — single weight 400 only, no bold variant
- Secondary headings: Cinzel (Google Fonts)
- Body: system sans

**Design rules:**
- Dark theme throughout — no light mode
- Norse/geometric aesthetic
- Cinematic scroll animations preferred
- Never use generic AI aesthetics

---

## Project Structure

```
app/
  (public)/          # Public-facing pages
    page.tsx         # Homepage
    booking/         # Booking page with Bokun widget + ship animation
    vikings/         # /vikings — Viking facts, Arsenal animations, Gunnbjörn AI
    the-saga/        # Cinematic Íslendingur voyage page
    groups/          # Groups/events enquiry page
  api/
    bokun/           # Bokun HMAC-SHA1 signed proxy routes
    calendar/        # Google Calendar routes (service account JWT)
      daily-events/route.ts
    financial/
      reconcile/route.ts
    ai/
      financial-narrative/route.ts
    groups-enquiry/route.ts   # Resend email handler
    claude/route.ts           # Anthropic API proxy (same-origin CORS fix)
  revenue/           # Financial Intelligence Agent (iframe embed)
  components/
    admin/
      AdminNavBar.tsx
    VikingArsenal.tsx
    VikingWorldMap.tsx
    GunnbjornChat.tsx          # AI Viking character (Anthropic API, streaming)
public/
  fonts/Norse.otf
  financial-agent.html         # Standalone financial dashboard served as iframe at /revenue
  Íslendingur.mp4
```

---

## Environment Variables

All vars in `.env.local` at project root. **Never log or expose these.**

```
# Anthropic
ANTHROPIC_API_KEY=

# Bokun.io
BOKUN_ACCESS_KEY=
BOKUN_SECRET_KEY=
BOKUN_BASE_URL=https://api.bokun.io

# Google Calendar (service account JWT)
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=   # Single line, double-quoted, literal \n chars
GOOGLE_CALENDAR_ID=info@vikingworld.is

# Google OAuth (alternate auth path)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=

# Resend (email)
RESEND_API_KEY=

# Site
NEXT_PUBLIC_SITE_URL=
```

**Critical:** `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` must be stored as a single line in double quotes with literal `\n` characters. Apply `.replace(/\\n/g, '\n')` in code before using it in JWT auth.

---

## Key Integrations

### Bokun.io (Booking Engine)
- Product ID: **293626** (Viking World Entrance) — flexible/date-only type
- HMAC-SHA1 signing: `base64(hmac-sha1(SECRET, "{httpDate}\n{ACCESS_KEY}\nGET\n{path}"))`
- All Bokun requests proxied through `/api/bokun/*` — never call Bokun directly from client
- Agency field: `b.agent?.title` (not `b.externalParty?.name`)

**Top agencies by pax:**
- Atlantik (~67% of pax — AIDAsol cruise groups)
- Iceland Travel (EF Cultural Tours)
- IcelandProServices (TTT)
- Arctic Adventures
- Activity Iceland
- GJ Travel

### Google Calendar (`info@vikingworld.is`)
- 322 confirmed 2026 bookings as of last audit
- Pax regex: `/(\d{1,4})\s*\+?\s*(\d{1,4})?\s*pax/i` — cap at 4 digits to avoid reading booking refs as counts
- Auth: service account JWT, scope `https://www.googleapis.com/auth/calendar.readonly`
- Timezone: `Atlantic/Reykjavik`

### Resend (Email)
- Groups enquiry form sends to `info@vikingworld.is` AND `erlingur@vikingworld.is`
- **Critical:** Instantiate Resend inside the POST handler, not at module level (causes Vercel build failure)
  ```ts
  // ✅ Correct
  export async function POST(req: Request) {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    ...
  }
  ```

### Anthropic API
- Model: `claude-sonnet-4-20250514`
- Proxied via `/api/claude` (Next.js route) to avoid CORS — client never calls Anthropic directly
- Gunnbjörn AI character: streaming typewriter, rate-limited, constrained to museum knowledge only
- Financial narrative: non-streaming, structured JSON response

---

## Critical Rules — Read Before Every Edit

1. **Never delete code.** Comment out if needed, never remove.
2. **Never touch form, ticket, or payment logic** unless explicitly instructed.
3. **One surgical change at a time.** No multi-file refactors in a single step.
4. **SSR-safe components:** Use the mounted guard pattern for anything with browser APIs.
   ```tsx
   const [mounted, setMounted] = useState(false);
   useEffect(() => setMounted(true), []);
   if (!mounted) return null;
   ```
5. **Control Room is hidden from public nav** — do not add it to any public navigation. Accessible via direct URL only.
6. **Norse font is single weight (400) only.** Never apply `font-weight: bold` or `font-bold` to Norse text — it will render incorrectly.
7. **Windows dev environment** — Turbopack can be unstable. If crashes loop, switch to `next dev --no-turbopack`.

---

## Pages & Routes

| Route | Status | Notes |
|---|---|---|
| `/` | Public | Homepage with longship transformer animation |
| `/booking` | Public | Bokun widget + North Atlantic sailing animation |
| `/vikings` | Public | Viking facts, VikingArsenal, Gunnbjörn AI chat |
| `/the-saga` | Public | Íslendingur voyage + video |
| `/groups` | Public | Event hall coming-soon + Resend contact form |
| `/revenue` | Internal | Financial Intelligence Agent iframe (`/public/financial-agent.html`) |
| `/control-room` | Internal | Hidden — direct URL access only |

---

## Agents Available (Claude Code)

Located at `~/.claude/agents/design/`:

- **`vikingaheimar-content-curator`** — fact-checker for all website content; knows every museum exhibit, Íslendingur voyage facts, Viking history used on site
- **`animation-specialist`** — SVG/CSS animation expert for Norse aesthetic; use for scroll-triggered, assembly-style, or cinematic animations

---

## Íslendingur Voyage Facts (Verified)

Key facts for content accuracy — do not change without checking the curator agent:

- Ship weight: **25 tons**
- Phone: **+354 422 2000**
- Hours: **09:00–17:00**
- 2000 voyage: departed Iceland → Greenland (arrived **15 July 2000**) → L'Anse aux Meadows (arrived **28 July 2000**) → New York (arrived **5 October 2000**)

---

## Contacts

| Role | Name | Email |
|---|---|---|
| Owner / Dev lead | Erlingur Gunnarsson | erlingur@vikingworld.is |
| General museum | — | info@vikingworld.is |
| Printer (Prentun.is) | — | prentun@prentun.is |

import {
  // GOOGLE_MAPS_URL,
  // GOOGLE_RATING,
  // GOOGLE_REVIEW_COUNT,
  //   ^ disabled 2026-08-19 — see "GOOGLE FIGURES DISABLED" note below.
  TRIPADVISOR_RATING,
  TRIPADVISOR_REVIEW_COUNT,
  TRIPADVISOR_URL,
} from "@/lib/socialProof";

/*
 * GOOGLE FIGURES DISABLED — 2026-08-19
 *
 * The hand-maintained Google rating/count that used to render here is now
 * served live from the Google Places API by
 * app/components/visit/GoogleReviews.tsx (via /api/reviews). Showing both
 * would put two Google ratings on /visit that could disagree, so the live
 * section is the single source of truth for Google.
 *
 * This component is now TripAdvisor-only. TripAdvisor has no live feed, so
 * its hand-maintained figures in lib/socialProof.ts stay in use.
 *
 * The GOOGLE_* constants remain exported from lib/socialProof.ts (unused)
 * rather than being removed.
 */

// Plain-text fallback rendering — no logos, no bubbles — so we do
// not trigger TripAdvisor's brand display requirements (Ollie logo,
// Moss #00AA6C, solid-white background, etc.). Swap for a branded
// white card later if the design brief calls for it.

function isSet(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value !== "TODO";
}

// 2026-08-19: the three GOOGLE_* checks were removed from this gate along
// with the Google row — leaving them in would keep the whole block hidden
// forever on account of values nothing renders any more.
const ALL_VALUES_SET =
  // isSet(GOOGLE_REVIEW_COUNT) &&
  // isSet(GOOGLE_RATING) &&
  // isSet(GOOGLE_MAPS_URL) &&
  isSet(TRIPADVISOR_REVIEW_COUNT) &&
  isSet(TRIPADVISOR_RATING) &&
  isSet(TRIPADVISOR_URL);

if (!ALL_VALUES_SET && process.env.NODE_ENV !== "production") {
  console.warn(
    "[SocialProof] one or more values in lib/socialProof.ts are unset — block is hidden until real numbers are provided.",
  );
}

function safeHref(value: string): string | undefined {
  return value && value !== "TODO" ? value : undefined;
}

function Item({
  count,
  rating,
  platform,
  url,
  tone,
}: {
  count: string;
  rating: string;
  platform: string;
  url: string;
  tone: "light" | "dark";
}) {
  const href = safeHref(url);
  const color = tone === "light" ? "rgba(255,255,255,0.72)" : "rgba(19,19,30,0.78)";
  const accent = tone === "light" ? "rgba(255,255,255,0.92)" : "rgba(19,19,30,0.95)";
  const label = (
    <span style={{ color }}>
      <span style={{ color: accent, fontWeight: 500 }}>{count}</span> reviews on{" "}
      <span style={{ color: accent, fontWeight: 500 }}>{platform}</span>
      <span style={{ opacity: 0.6 }}> · </span>
      <span style={{ color: accent }}>{rating}★</span>
    </span>
  );
  if (!href) return <span>{label}</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none" }}
    >
      {label}
    </a>
  );
}

export default function SocialProof({
  tone = "light",
  align = "start",
}: {
  tone?: "light" | "dark";
  align?: "start" | "center";
}) {
  if (!ALL_VALUES_SET) return null;
  const justify = align === "center" ? "justify-center" : "justify-start";
  return (
    <div
      className={`flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] ${justify}`}
    >
      {/* Google row + its divider disabled 2026-08-19 — the live
          <GoogleReviews /> section on /visit is now the only Google figure.
      <Item
        count={GOOGLE_REVIEW_COUNT}
        rating={GOOGLE_RATING}
        platform="Google"
        url={GOOGLE_MAPS_URL}
        tone={tone}
      />
      <span
        aria-hidden="true"
        style={{
          width: 1,
          height: 12,
          background: tone === "light" ? "rgba(255,255,255,0.20)" : "rgba(19,19,30,0.20)",
        }}
      />
      */}
      <Item
        count={TRIPADVISOR_REVIEW_COUNT}
        rating={TRIPADVISOR_RATING}
        platform="TripAdvisor"
        url={TRIPADVISOR_URL}
        tone={tone}
      />
    </div>
  );
}

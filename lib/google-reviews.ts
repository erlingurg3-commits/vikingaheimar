/**
 * Google Places reviews — SERVER ONLY.
 *
 * Added 2026-08-19. Read-only display of our live Google rating for the
 * /visit page. We are not collecting or submitting reviews.
 *
 * SECURITY: GOOGLE_PLACES_API_KEY must never reach the browser. This module
 * is imported exclusively by app/api/reviews/route.ts (a server route
 * handler). Do not import it from any "use client" component — the client
 * gets this data over /api/reviews instead.
 *
 * The `server-only` package is not installed in this project, so that
 * boundary is enforced by convention rather than by a build-time guard.
 *
 * COST: Places Details is billed per call. The fetch below is cached by Next
 * for 86400s (24h), so we hit Google at most once per day per deployment.
 * That also keeps us inside Google's caching policy for Places content.
 */

/** Uses the Places API (New) — v1 places endpoint with a field mask. */
const PLACES_ENDPOINT = "https://places.googleapis.com/v1/places";

/** Only the fields we actually render — a narrower mask is cheaper. */
const FIELD_MASK = "rating,userRatingCount,googleMapsUri,reviews";

/** Google's branding policy: never show more than the reviews they return. */
const MAX_REVIEWS = 5;

/* ------------------------------------------------------------------------
 * REVIEW SELECTION — added 2026-08-21
 *
 * We display only strong reviews. Google's Places API caps `reviews` at 5 and
 * chooses which 5 itself, so this filters that set — it does not search the
 * full review history. If Google returns a weak batch, we show fewer cards
 * rather than weaker ones.
 *
 * IMPORTANT: this affects the review CARDS only. The headline `rating` and
 * `total` stay exactly as Google reports them — they remain the real,
 * unfiltered aggregate across every review. Filtering the cards while quoting
 * the true average keeps the summary honest.
 * --------------------------------------------------------------------- */

/** Preferred: show only five-star reviews. */
const PREFERRED_RATING = 5;

/** Hard floor — nothing below this ever renders, regardless of fallback. */
const MINIMUM_RATING = 4;

/** If fewer than this many five-star reviews exist, top up with four-star. */
const MIN_CARDS = 3;

export type GoogleReview = {
  author: string;
  rating: number;
  text: string;
  relativeTime: string;
  profilePhoto?: string;
  /** RFC3339 from Google; used for newest-first ordering, not rendered. */
  publishTime?: string;
};

/** Newest first. Missing timestamps sort last rather than throwing off order. */
function byNewest(a: GoogleReview, b: GoogleReview): number {
  const ta = a.publishTime ? Date.parse(a.publishTime) : 0;
  const tb = b.publishTime ? Date.parse(b.publishTime) : 0;
  return tb - ta;
}

/**
 * Pick which reviews to show.
 *
 * - Five-star only, newest first, up to MAX_REVIEWS.
 * - If that yields fewer than MIN_CARDS, top up with four-star reviews
 *   (rating desc, then newest) until MIN_CARDS is reached.
 * - Anything below MINIMUM_RATING is never eligible.
 */
export function selectStrongReviews(all: GoogleReview[]): GoogleReview[] {
  const eligible = all.filter((r) => r.rating >= MINIMUM_RATING);

  const fiveStar = eligible
    .filter((r) => r.rating >= PREFERRED_RATING)
    .sort(byNewest);

  if (fiveStar.length >= MIN_CARDS) return fiveStar.slice(0, MAX_REVIEWS);

  // Not enough five-star to fill the row — top up with the best of the rest.
  const rest = eligible
    .filter((r) => r.rating < PREFERRED_RATING)
    .sort((a, b) => b.rating - a.rating || byNewest(a, b));

  return [...fiveStar, ...rest].slice(0, MIN_CARDS);
}

export type GoogleReviews = {
  rating: number;
  total: number;
  url: string;
  reviews: GoogleReview[];
};

/** Shape of the slice of the Places API (New) response we consume. */
type PlacesResponse = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: Array<{
    rating?: number;
    relativePublishTimeDescription?: string;
    /** RFC3339 timestamp — used to order the cards newest first. */
    publishTime?: string;
    text?: { text?: string };
    originalText?: { text?: string };
    authorAttribution?: {
      displayName?: string;
      photoUri?: string;
    };
  }>;
};

/**
 * Fetch our live Google rating + recent reviews.
 *
 * Returns null — never throws — when the env vars are missing, the API
 * errors, or the payload has no usable rating. Callers render nothing on
 * null, so a Google outage degrades to an absent section, not a broken page.
 */
export async function getGoogleReviews(): Promise<GoogleReviews | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACES_PLACE_ID;

  // Graceful silent fallback — the section simply does not render.
  if (!apiKey || !placeId) return null;

  try {
    const res = await fetch(`${PLACES_ENDPOINT}/${encodeURIComponent(placeId)}`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      // At most one call to Google per day.
      next: { revalidate: 86400 },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as PlacesResponse;

    const rating = typeof data.rating === "number" ? data.rating : null;
    if (rating === null) return null;

    const url =
      data.googleMapsUri ||
      `https://search.google.com/local/reviews?placeid=${encodeURIComponent(placeId)}`;

    const withText: GoogleReview[] = (data.reviews ?? [])
      .map((r) => ({
        author: r.authorAttribution?.displayName?.trim() || "Google user",
        rating: typeof r.rating === "number" ? r.rating : 0,
        // Prefer Google's translated text, fall back to the original.
        text: (r.text?.text ?? r.originalText?.text ?? "").trim(),
        relativeTime: r.relativePublishTimeDescription?.trim() || "",
        profilePhoto: r.authorAttribution?.photoUri || undefined,
        publishTime: r.publishTime,
      }))
      .filter((r) => r.text.length > 0);

    // Show only strong reviews (see SELECTION block above). Was previously
    // just `.slice(0, MAX_REVIEWS)` on the raw list — changed 2026-08-21.
    const reviews = selectStrongReviews(withText);

    return {
      rating,
      total: typeof data.userRatingCount === "number" ? data.userRatingCount : 0,
      url,
      reviews,
    };
  } catch {
    // Network failure, DNS, malformed JSON — all degrade to "no section".
    return null;
  }
}

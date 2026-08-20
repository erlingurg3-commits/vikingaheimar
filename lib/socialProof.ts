// Hand-maintained social proof figures.
//
// These values are NOT fetched from any API — they are copied from
// the Google Business and TripAdvisor dashboards by hand. Re-check
// them quarterly and bump LAST_VERIFIED when you do.

// UNUSED since 2026-08-19 — nothing reads these three any more. The Google
// rating/count now come live from the Places API via /api/reviews and render
// in app/components/visit/GoogleReviews.tsx. Filling these in will NOT put a
// Google figure back on the site. Kept rather than deleted.
export const GOOGLE_REVIEW_COUNT = "TODO";
export const GOOGLE_RATING = "TODO";
export const GOOGLE_MAPS_URL = "TODO";

export const TRIPADVISOR_REVIEW_COUNT = "TODO";
export const TRIPADVISOR_RATING = "TODO";
export const TRIPADVISOR_URL = "TODO";

export const LAST_VERIFIED = "TODO";

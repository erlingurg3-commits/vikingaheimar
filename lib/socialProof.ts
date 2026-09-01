// Hand-maintained social proof figures.
//
// These values are NOT fetched from any API — they are copied from
// the Google Business and TripAdvisor dashboards by hand. Re-check
// them quarterly and bump LAST_VERIFIED when you do.

// LIVE as of 2026-08-31: GOOGLE_RATING, GOOGLE_MAPS_URL,
// TRIPADVISOR_RANK_LABEL and TRIPADVISOR_URL feed the credibility badge in the
// /visit hero (see Accolades in app/visit/VisitPageClient.tsx). Editing them
// changes what visitors see.
//
// This supersedes the 2026-08-19 note that called the Google constants unused:
// that was true while the figure came from the Places API section, which has
// since been replaced by the Trustindex widget lower down the page.
export const GOOGLE_RATING = "4.1";
export const GOOGLE_MAPS_URL =
  "https://maps.google.com/?q=Vikingaheimar+Reykjanesbaer";

// Tripadvisor is shown as a RANKING accolade (no live feed, no logo).
export const TRIPADVISOR_RANK_LABEL = "#1 of 17 things to do in Keflavík";
export const TRIPADVISOR_URL =
  "https://www.tripadvisor.com/Attraction_Review-g189964-d3704460-Reviews-Viking_World-Keflavik_Reykjanesbaer_Reykjanes_Peninsula.html";

// Unused by the badge, which quotes a rating and a ranking rather than review
// counts. Kept for the dormant SocialProof component, which is gated on these
// being set and is not rendered anywhere.
export const GOOGLE_REVIEW_COUNT = "TODO";
export const TRIPADVISOR_REVIEW_COUNT = "TODO";
export const TRIPADVISOR_RATING = "TODO";

export const LAST_VERIFIED = "2026-08-31";

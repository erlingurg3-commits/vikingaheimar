/**
 * GET /api/reviews — live Google rating + recent reviews for /visit.
 *
 * Added 2026-08-19. This route is the ONLY thing the browser talks to;
 * GOOGLE_PLACES_API_KEY stays server-side and never enters the client
 * bundle. Read-only — no POST, we are not collecting reviews.
 *
 * Returns a 200 with a JSON `null` body when getGoogleReviews() yields null
 * (missing env vars or a Google-side failure) so the client silently renders
 * nothing.
 *
 * NOTE: this deliberately does NOT use 204 No Content. On Next 16.2.5 the
 * Response constructor rejects `new Response(null, { status: 204 })`
 * ("Invalid response status code 204") and the prerender cache refuses the
 * zero-byte body ("calculateSize returned 0"). A null JSON body is the
 * equivalent signal and survives both. The client treats it as "no data".
 */
import { getGoogleReviews } from "@/lib/google-reviews";

// Matches the 24h cache in lib/google-reviews.ts — the route response is
// revalidated on the same cadence as the upstream Places call.
export const revalidate = 86400;

export async function GET() {
  const data = await getGoogleReviews();

  // JSON `null` rather than 204 — see note above.
  return Response.json(data ?? null);
}

import { track } from "@vercel/analytics";

type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

/**
 * Single funnel for custom events.
 *
 * 2026-08-25: wired to Vercel Web Analytics. Previously this only console.info'd
 * behind a "TODO: replace with real analytics provider" note — every existing
 * call site (book_tickets_click in CinematicHero, HomePageClient and
 * TicketsConversionPage) now reports for real without touching those files.
 *
 * SSR-safe: the window guard stays, so server renders are a no-op.
 *
 * NO PERSONAL DATA. Payloads must carry only non-identifying context such as
 * which surface the click came from — never names, emails, message text or
 * enquiry details. Vercel also drops undefined values, so optional fields are
 * filtered out before sending.
 */
function emitAnalyticsEvent(eventName: string, payload?: AnalyticsPayload) {
  if (typeof window === "undefined") {
    return;
  }

  // Vercel's track() rejects undefined values — strip them.
  const clean = payload
    ? Object.fromEntries(
        Object.entries(payload).filter(([, v]) => v !== undefined)
      )
    : undefined;

  try {
    track(eventName, clean as Record<string, string | number | boolean>);
  } catch {
    // Analytics must never break a user interaction.
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[analytics]", eventName, clean ?? {});
  }
}

export function trackEvent(eventName: string, payload?: AnalyticsPayload) {
  emitAnalyticsEvent(eventName, payload);
}

export function trackBookTicketsClick(payload?: AnalyticsPayload) {
  emitAnalyticsEvent("book_tickets_click", payload);
}

export function trackGroupsInquiryClick(payload?: AnalyticsPayload) {
  emitAnalyticsEvent("groups_inquiry_click", payload);
}

/* Added 2026-08-25 — named helpers for the remaining key actions, so call
   sites stay declarative and event names are defined in exactly one place. */

export function trackGjaldskraOpen(payload?: AnalyticsPayload) {
  emitAnalyticsEvent("gjaldskra_open", payload);
}

export function trackGunnbjornOpen(payload?: AnalyticsPayload) {
  emitAnalyticsEvent("gunnbjorn_open", payload);
}

export function trackGroupsEnquirySubmit(payload?: AnalyticsPayload) {
  emitAnalyticsEvent("groups_enquiry_submit", payload);
}

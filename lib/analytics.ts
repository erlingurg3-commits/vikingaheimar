type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

function emitAnalyticsEvent(eventName: string, payload?: AnalyticsPayload) {
  if (typeof window === "undefined") {
    return;
  }

  // TODO: Replace with real analytics provider integration (GA4, Segment, etc.)
  console.info("[analytics]", eventName, payload ?? {});
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

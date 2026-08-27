import { getSessionId } from "./session-id";

type TrackPayload = {
  type: string;
  path?: string;
  referrer_host?: string | null;
  source?: string | null;
};

/** Host of an EXTERNAL referrer only — internal navigations return null so we
 *  don't double-count our own domain as a referrer. */
export function externalReferrerHost(): string | null {
  if (typeof document === "undefined") return null;
  try {
    if (!document.referrer) return null;
    const u = new URL(document.referrer);
    if (u.hostname === window.location.hostname) return null;
    return u.hostname;
  } catch {
    return null;
  }
}

export function sendTrack(payload: TrackPayload, opts?: { beacon?: boolean }) {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({ ...payload, session_id: getSessionId() });
    if (opts?.beacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
      // sendBeacon posts as text/plain — the route already parses that path.
      navigator.sendBeacon("/api/track", body);
      return;
    }
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* analytics must never break the page */
  }
}

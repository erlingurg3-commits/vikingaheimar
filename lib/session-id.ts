// Anonymous, cookieless per-session id. sessionStorage means it lives only for
// the current tab session and is never a persistent user identifier. All access
// is wrapped — private mode / disabled storage must never throw.
const KEY = "vh_sid";

export function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    let id = window.sessionStorage.getItem(KEY);
    if (!id) {
      id =
        (typeof crypto !== "undefined" && crypto.randomUUID?.()) ||
        `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      window.sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

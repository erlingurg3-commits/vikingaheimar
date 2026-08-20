// Single source of truth for museum opening hours.
//
// SUMMER_START and SUMMER_END are INTERNAL switchover values only.
// They must NEVER be rendered anywhere user-facing, and must not
// appear in metadata, JSON-LD, alt text, or comments in shipped
// markup. Only the derived hour strings are safe to display.

export const SUMMER_START = { month: 6, day: 1 };
export const SUMMER_END = { month: 9, day: 30 };

export const SUMMER_HOURS = { open: "09:00", close: "17:00" } as const;
export const WINTER_HOURS = { open: "10:00", close: "16:00" } as const;

export const MUSEUM_TIME_ZONE = "Atlantic/Reykjavik";

export type Hours = { open: string; close: string };

function getMonthDayInZone(
  timeZone: string,
  date: Date,
): { month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const pick = (t: string) =>
    Number(parts.find((p) => p.type === t)?.value ?? "0");
  return { month: pick("month"), day: pick("day") };
}

function isInSummer(month: number, day: number): boolean {
  const afterStart =
    month > SUMMER_START.month ||
    (month === SUMMER_START.month && day >= SUMMER_START.day);
  const beforeEnd =
    month < SUMMER_END.month ||
    (month === SUMMER_END.month && day <= SUMMER_END.day);
  return afterStart && beforeEnd;
}

export function getCurrentHours(
  timeZone: string = MUSEUM_TIME_ZONE,
): Hours {
  const { month, day } = getMonthDayInZone(timeZone, new Date());
  return isInSummer(month, day) ? { ...SUMMER_HOURS } : { ...WINTER_HOURS };
}

export function getTodayLabel(
  timeZone: string = MUSEUM_TIME_ZONE,
): string {
  const { open, close } = getCurrentHours(timeZone);
  return `Today ${open}–${close}`;
}

export function getSeasonalLabel(): string {
  return `Summer ${SUMMER_HOURS.open}–${SUMMER_HOURS.close} · Winter ${WINTER_HOURS.open}–${WINTER_HOURS.close}`;
}

export const SEASONAL_NOTE =
  "Hours change seasonally – the time shown is today’s.";

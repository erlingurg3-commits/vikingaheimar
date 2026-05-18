/**
 * Events Registry
 * ---------------
 * Add a new event here and it will automatically appear on /groups/events
 * and get its own page at /groups/events/[slug].
 *
 * To add a new event:
 *   1. Drop the SVG into /public/events/<slug>.svg
 *   2. Add an entry below with the matching slug.
 */

export type EventFact = {
  value: string;
  label: string;
};

export type EventTiming = {
  phase: string;
  time: string;
  highlight?: boolean; // true = totality row, rendered brighter
};

export type EventSection = {
  heading: string;
  body: string;
};

export type VikingEvent = {
  /** URL-safe slug — used as the route: /groups/events/[slug] */
  slug: string;
  /** Display title shown on the card and detail page */
  title: string;
  /** Short subtitle or tagline (optional) */
  tagline?: string;
  /** Absolute path to the SVG in /public, e.g. "/events/total-eclipse.svg" */
  svgPath: string;
  /** Optional date string shown on the card, e.g. "2026 · August" */
  date?: string;

  // ── Rich content (detail page) ─────────────────────────────────
  /** Lead paragraph below the title */
  intro?: string;
  /** Key stats strip — up to 4 items */
  facts?: EventFact[];
  /** Eclipse / event timing rows */
  timing?: EventTiming[];
  /** Freeform content sections */
  sections?: EventSection[];
  /** Source attribution shown at the bottom */
  attribution?: { text: string; url: string; label: string };
};

export const events: VikingEvent[] = [
  {
    slug: "almyrkvi",
    title: "Almyrkvi",
    tagline: "The great darkness — a total solar eclipse over the Viking shore",
    svgPath: "/events/almyrkvi.svg",
    date: "12 August · 2026",

    intro:
      "On the afternoon of August 12, 2026, the Moon's umbral shadow races across Iceland at 3,400 km/h. The Reykjanes Peninsula — where Víkingaheimar stands — is among the last places on Earth the shadow touches before crossing the Atlantic. Totality lasts up to 1 minute 47 seconds here. Witness it.",

    facts: [
      { value: "1m 47s",    label: "Totality at Reykjanestá" },
      { value: "17:48 UT",  label: "Totality begins in Reykjavík" },
      { value: "1433",      label: "Last total eclipse over Reykjavík" },
      { value: "2245",      label: "Next total eclipse over Reykjavík" },
    ],

    timing: [
      { phase: "Partial begins",   time: "16:47 UT" },
      { phase: "Totality begins",  time: "17:48:19 UT", highlight: true },
      { phase: "Maximum",          time: "17:48:48 UT", highlight: true },
      { phase: "Totality ends",    time: "17:49:18 UT", highlight: true },
      { phase: "Partial ends",     time: "18:47 UT" },
    ],

    sections: [
      {
        heading: "A once-in-600-year moment",
        body: "This is the first total solar eclipse to cross Reykjavík since June 17, 1433 — nearly six centuries ago. The path of totality sweeps across the Reykjanes Peninsula, passing directly over the Viking shore. The next opportunity for Reykjavík will not come until May 26, 2245. The window is narrow: totality lasts less than two minutes. Stand in the right place at the right moment, and you will witness something most people never see in a lifetime.",
      },
      {
        heading: "What the sky reveals",
        body: "As totality begins, day turns to deep twilight. Four planets emerge from the darkened sky: Venus blazes in the southwest, Jupiter and Mercury appear in the west, and Mars may be spotted low in the northwest. Look up: Regulus in Leo, the twin stars Castor and Pollux in Gemini, and the stars of the Big Dipper may all become visible overhead. On this same evening, the Perseid meteor shower reaches its annual peak — one of the great coincidences of 2026.",
      },
      {
        heading: "The path across Reykjanes",
        body: "The Moon's umbral shadow spends 6 minutes 48 seconds total over Iceland. On the Reykjanes Peninsula, Garður and Sandgerði see totality for just over 1 minute 40 seconds, Keflavík International Airport for 1 minute 38 seconds. The last piece of Icelandic soil the shadow touches is Reykjanestá Lighthouse at 17:50:07 UT — 1 minute 47 seconds of totality, above sea cliffs overlooking the open Atlantic.",
      },
    ],

    attribution: {
      text: "Eclipse data sourced from",
      label: "eclipse2026.is",
      url: "https://eclipse2026.is",
    },
  },
];

/** Returns undefined when no event matches the slug. */
export function getEventBySlug(slug: string): VikingEvent | undefined {
  return events.find((e) => e.slug === slug);
}

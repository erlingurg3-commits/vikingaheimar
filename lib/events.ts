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
};

export const events: VikingEvent[] = [
  {
    slug: "almyrkvi",
    title: "Almyrkvi",
    tagline: "The great darkness — a total solar eclipse over the Viking shore",
    svgPath: "/events/almyrkvi.svg",
    date: "12 August · 2026",
  },
];

/** Returns undefined when no event matches the slug. */
export function getEventBySlug(slug: string): VikingEvent | undefined {
  return events.find((e) => e.slug === slug);
}

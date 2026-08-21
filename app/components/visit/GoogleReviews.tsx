"use client";

/**
 * GoogleReviews — live Google rating + recent reviews for /visit.
 *
 * Added 2026-08-19. Read-only social proof — we do not collect reviews.
 *
 * SSR-safe: the data is fetched in an effect, so the server renders only a
 * 1px spacer and there is no hydration mismatch. No browser API is touched
 * outside useEffect.
 *
 * The Places API key lives server-side only — this component talks to
 * /api/reviews, never to Google directly.
 *
 * Google branding policy: reviewer name, photo, rating and text are shown as
 * Google returns them (layout only — the content itself is not restyled or
 * edited), with attribution and a link back to the listing.
 */

import React, { useEffect, useState } from "react";
// import { useScrollReveal } from "@/app/components/hooks/useScrollReveal";
//   ^ unused since 2026-08-21 — this section no longer gates on scroll reveal.

type Review = {
  author: string;
  rating: number;
  text: string;
  relativeTime: string;
  profilePhoto?: string;
};

type ReviewsPayload = {
  rating: number;
  total: number;
  url: string;
  reviews: Review[];
};

/* ------------------------------------------------------------------ */
/*  Shared /visit design tokens (reused, not re-invented)              */
/* ------------------------------------------------------------------ */

const container = "mx-auto w-full max-w-[1080px] px-8 md:px-16";
const ACCENT = "#4ea8de";
const EYEBROW = "rgba(78,168,222,0.80)";
const INK = "#1a1a1a";
const MUTED = "#7a7672";

/* Unused since 2026-08-21 — this section renders unconditionally visible.
   Kept for reference rather than deleted.
function reveal(visible: boolean, delay = 0): React.CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(32px)",
    transition: `opacity 1000ms cubic-bezier(0.25,0.1,0.25,1) ${delay}ms, transform 1000ms cubic-bezier(0.25,0.1,0.25,1) ${delay}ms`,
  };
}
*/

/* ------------------------------------------------------------------ */
/*  Stars                                                              */
/* ------------------------------------------------------------------ */

/**
 * Star row. `value` is rounded to the nearest whole star for the graphic;
 * the precise figure is always shown numerically alongside it.
 */
function Stars({ value, size = 16 }: { value: number; size?: number }) {
  const filled = Math.round(value);

  return (
    <span className="inline-flex items-center gap-[2px]" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill={i <= filled ? ACCENT : "rgba(122,118,114,0.25)"}
        >
          <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */

export default function GoogleReviews() {
  const [data, setData] = useState<ReviewsPayload | null>(null);
  const [settled, setSettled] = useState(false);

  /* Scroll-reveal removed here 2026-08-21.
     This content mounts only after /api/reviews resolves, so it is exactly the
     case that used to strand elements at opacity:0 forever. useScrollReveal is
     fixed now (callback ref), but review content is social proof we cannot
     afford to have hidden by any future regression in the reveal path, so it
     renders unconditionally visible — no opacity/transform gate at all.
     The rest of the site keeps its scroll animations.
  const { ref: labelRef, isVisible: labelVis } = useScrollReveal<HTMLDivElement>();
  const { ref: gridRef, isVisible: gridVis } = useScrollReveal<HTMLDivElement>({ delay: 150 });
  */

  useEffect(() => {
    let active = true;

    fetch("/api/reviews")
      .then((res) => (res.ok && res.status !== 204 ? res.json() : null))
      .then((json: ReviewsPayload | null) => {
        if (active) setData(json);
      })
      .catch(() => {
        // Silent — a Google outage degrades to an absent section.
        if (active) setData(null);
      })
      .finally(() => {
        if (active) setSettled(true);
      });

    return () => {
      active = false;
    };
  }, []);

  // Before the fetch settles, and whenever there is nothing to show, render
  // an inert 1px spacer rather than a placeholder block: the section sits
  // above the CTA, so reserving real height would leave a visible gap on the
  // (expected) empty path.
  if (!settled || !data || data.reviews.length === 0) {
    return <div aria-hidden="true" style={{ backgroundColor: "#f5f3ee", height: 1 }} />;
  }

  const ratingLabel = data.rating.toFixed(1);

  return (
    <section style={{ backgroundColor: "#f5f3ee" }} aria-label="Google reviews">
      <div className={`${container} pb-20 md:pb-28`}>
        {/* Section label + rating summary */}
        {/* was: ref={labelRef} style={reveal(labelVis)} — reveal gate removed 2026-08-21 */}
        <div className="text-center mb-10">
          <p
            style={{
              color: EYEBROW,
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.25em",
            }}
          >
            What Visitors Say
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            {/* Norse display face — weight 400 only, never bold (CLAUDE.md rule 6) */}
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontSize: "40px",
                lineHeight: 1,
                color: INK,
              }}
            >
              {ratingLabel}
            </span>

            <Stars value={data.rating} size={18} />

            <span style={{ fontSize: "15px", lineHeight: 1.65, color: MUTED }}>
              {data.total > 0
                ? `(${data.total.toLocaleString("en-GB")} reviews on Google)`
                : "on Google"}
            </span>
          </div>

          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block"
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: ACCENT,
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            View on Google
          </a>
        </div>

        {/* Review cards */}
        {/* was: ref={gridRef} style={reveal(gridVis, 150)} — reveal gate removed 2026-08-21 */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.reviews.map((review, i) => (
            <figure
              key={`${review.author}-${i}`}
              className="flex h-full flex-col rounded-lg p-6"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid rgba(78,168,222,0.18)",
              }}
            >
              <figcaption className="flex items-center gap-3">
                {review.profilePhoto ? (
                  // Reviewer avatars are served from Google CDN hosts that
                  // vary — a plain <img> avoids adding next/image
                  // remotePatterns config for a 32px decorative image.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={review.profilePhoto}
                    alt=""
                    width={32}
                    height={32}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="rounded-full"
                    style={{ width: 32, height: 32, objectFit: "cover" }}
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: 32,
                      height: 32,
                      backgroundColor: "rgba(78,168,222,0.15)",
                      color: ACCENT,
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  >
                    {review.author.charAt(0).toUpperCase()}
                  </span>
                )}

                <span>
                  <span
                    className="block"
                    style={{ fontSize: "14px", fontWeight: 500, color: INK }}
                  >
                    {review.author}
                  </span>
                  {review.relativeTime ? (
                    <span className="block" style={{ fontSize: "12px", color: MUTED }}>
                      {review.relativeTime}
                    </span>
                  ) : null}
                </span>
              </figcaption>

              <div className="mt-4">
                <Stars value={review.rating} />
                <span className="sr-only">{review.rating} out of 5</span>
              </div>

              {/* Clamped so cards stay even — full text lives on Google */}
              <blockquote
                className="mt-3 line-clamp-6"
                style={{ fontSize: "15px", lineHeight: 1.65, color: MUTED }}
              >
                {review.text}
              </blockquote>
            </figure>
          ))}
        </div>

        {/* Google attribution */}
        <p className="mt-8 text-center" style={{ fontSize: "12px", color: MUTED }}>
          Reviews from{" "}
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: ACCENT, textDecoration: "underline", textUnderlineOffset: "3px" }}
          >
            Google
          </a>
        </p>
      </div>
    </section>
  );
}

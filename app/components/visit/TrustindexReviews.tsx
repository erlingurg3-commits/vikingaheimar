"use client";

/**
 * TrustindexReviews — third-party reviews widget for /visit.
 *
 * Added 2026-08-25, replacing the custom <GoogleReviews /> section. Trustindex
 * supplies its own rating summary and review cards, so this component only
 * provides the on-brand heading and a container to mount into.
 *
 * SSR-safe: nothing touches the DOM outside an effect, and the mounted guard
 * keeps the server and first client render identical.
 *
 * LAZY: the loader script is injected only when the section comes within
 * ~300px of the viewport, and only once. That keeps roughly 100KB+ of
 * third-party JavaScript off the initial load — third-party weight is already
 * ~65% of this page.
 *
 * DELIBERATELY NOT SCROLL-REVEALED. The earlier invisible-reviews bug was
 * exactly this shape: async content mounting inside an opacity:0 reveal whose
 * observer never attached, leaving it hidden from every visitor. This section
 * renders visible with no opacity or transform gate, and must stay that way.
 */

import React, { useEffect, useRef, useState } from "react";

const TRUSTINDEX_SRC =
  "https://cdn.trustindex.io/loader.js?70beb2c797e7992070168e87d7c";

/** Start loading this far before the section scrolls into view. */
const ROOT_MARGIN = "300px";

/* ------------------------------------------------------------------ */
/*  Shared /visit design tokens (reused, not re-invented)              */
/* ------------------------------------------------------------------ */

const container = "mx-auto w-full max-w-[1080px] px-8 md:px-16";
const EYEBROW = "rgba(78,168,222,0.80)";

export default function TrustindexReviews() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  // Ref, not state: the guard must be synchronous so a second observer
  // callback in the same tick cannot inject the loader twice.
  const injectedRef = useRef(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    const host = hostRef.current;
    if (!host) return;

    const inject = () => {
      if (injectedRef.current) return;
      injectedRef.current = true;

      const s = document.createElement("script");
      s.src = TRUSTINDEX_SRC;
      s.async = true;
      s.defer = true;
      // Trustindex renders its widget immediately after its own script node,
      // so appending here places the widget inside this container.
      host.appendChild(s);
    };

    // No IntersectionObserver support — load it rather than risk never
    // loading it at all. Same fail-open principle as useScrollReveal.
    if (typeof IntersectionObserver === "undefined") {
      inject();
      return;
    }

    let observer: IntersectionObserver;

    try {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            inject();
            observer.disconnect();
          }
        },
        { rootMargin: ROOT_MARGIN }
      );
      observer.observe(host);
    } catch {
      inject();
      return;
    }

    return () => observer.disconnect();
  }, [mounted]);

  return (
    <section style={{ backgroundColor: "#f5f3ee" }} aria-label="Visitor reviews">
      <div className={`${container} pb-20 md:pb-28`}>
        {/* On-brand eyebrow — the widget supplies the rating and cards below */}
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
        </div>

        {/* Trustindex mounts here. No opacity/transform gate — see note above. */}
        <div ref={hostRef} />
      </div>
    </section>
  );
}

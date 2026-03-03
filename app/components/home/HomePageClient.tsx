"use client";

/**
 * HomePageClient — minimal visual reset 2026-02-22
 *
 * Design system:
 *   Background  #f7f6f2  (warm paper)
 *   Text        #111111
 *   Muted       #6b6b6b
 *   Accent      accent-frost-blue — primary CTA only
 *   SVG         stroke-width 2, no fill
 *   No gradients · No shadows · No backdrop-blur · No card surfaces
 *
 * Note: Header is transparent on "/" when not scrolled. The global header
 * uses white text — on the light background this is low contrast until
 * the user scrolls. Update Header.tsx transparent-mode text colour if
 * needed as a follow-up pass.
 */

import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@/lib/site-routes";
import { getBookTicketsLink } from "@/lib/ticketing";
import { trackBookTicketsClick } from "@/lib/analytics";

// ─────────────────────────────────────────────
// Inline SVG primitives — stroke-width 2, no fill
// ─────────────────────────────────────────────

function AxeIconSm() {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="w-10 h-10 shrink-0 mt-1"
    >
      <line x1="16" y1="32" x2="16" y2="16" />
      <path d="M 16 16 L 6 6 L 4 2 L 10 4 L 16 10" />
      <path d="M 16 16 L 26 6 L 28 2 L 22 4 L 16 10" />
    </svg>
  );
}

// ─────────────────────────────────────────────
// Shared layout constant
// ─────────────────────────────────────────────

const container = "mx-auto w-full max-w-[1100px] px-6";

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function HomePageClient() {
  const ticketLink = getBookTicketsLink();

  return (
    <main
      className="w-full overflow-hidden"
      style={{ backgroundColor: "#f7f6f2", color: "#111111" }}
    >
      {/* ══════════════════════════════════════
          1. HERO
          ══════════════════════════════════════ */}
      <section className="relative w-full min-h-[95vh] overflow-hidden">
        <Image
          src="/ship.jpg"
          alt="Interior bow of the Íslendingur Viking ship"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_56%] md:object-center"
        />

        <div className="absolute inset-0" style={{ backgroundColor: "rgba(10,8,6,0.33)" }} />

        <div className="relative z-10 min-h-[95vh] flex items-start justify-center px-6 pt-[44vh] pb-20">
          <div className="w-full max-w-[900px] text-center">
            <div className="max-w-[800px] mx-auto">
              <h1
                className="font-display font-extrabold text-white tracking-[-0.01em] text-[40px] md:text-[clamp(72px,6vw,80px)]"
                style={{ lineHeight: 1.02 }}
              >
                Enter a Viking World
              </h1>
              <p
                className="mt-[42px] font-display font-normal tracking-[0.05em] text-[13px] md:text-[15px]"
                style={{ lineHeight: 1.25, color: "rgba(255,255,255,0.85)" }}
              >
                Where exploration began.
              </p>
            </div>

            <div className="mt-16 flex items-center justify-center">
              <a
                href={ticketLink.href}
                target={ticketLink.target}
                rel={ticketLink.rel}
                onClick={() => trackBookTicketsClick({ source: "homepage-hero" })}
                className="inline-flex items-center px-10 py-5 text-base font-semibold tracking-[0.06em] uppercase bg-[#f7f6f2] text-[#111111] visited:text-[#111111] hover:text-[#111111] focus:text-[#111111] active:text-[#111111] rounded-[4px] hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f7f6f2]"
              >
                BOOK TICKETS
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 z-10 flex flex-col items-center gap-3">
          <div className="w-12 h-px bg-white" style={{ opacity: 0.6 }} />
          <p className="text-sm font-light tracking-[0.12em] text-white" style={{ opacity: 0.75 }}>
            — Discover the Íslendingur
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          2. EXPERIENCE
          ══════════════════════════════════════ */}
      <section className="py-40">
        <div className={container}>
          {/* Ceremonial divider */}
          <div className="flex justify-center mb-20">
            <div className="w-full max-w-[850px] h-px" style={{ backgroundColor: "#d4d0c8" }} />
          </div>

          <div className="max-w-[850px] mx-auto">
            <div className="flex flex-col items-center text-center" style={{ color: "#111111" }}>
              <h2
                className="font-display font-light leading-tight"
                style={{ fontSize: "clamp(2.25rem, 3.75vw, 3.25rem)", color: "#111111" }}
              >
                The Ancient World,
                <br />
                Made Present.
              </h2>
            </div>

            <div className="mt-16 space-y-16 max-w-[700px] mx-auto text-center">
              <div>
                <h3 
                  className="font-display font-normal text-lg tracking-wide mb-3"
                  style={{ color: "#111111", lineHeight: 1.4 }}
                >
                  Íslendingur
                </h3>
                <p 
                  className="text-base"
                  style={{ color: "#111111", lineHeight: 1.7 }}
                >
                  A full-scale Viking longship - built to cross oceans.
                </p>
              </div>

              <div>
                <h3 
                  className="font-display font-normal text-lg tracking-wide mb-3"
                  style={{ color: "#111111", lineHeight: 1.4 }}
                >
                  Norse Artifacts
                </h3>
                <p 
                  className="text-base"
                  style={{ color: "#111111", lineHeight: 1.7 }}
                >
                  Authentic objects drawn from archaeological discovery.
                </p>
              </div>

              <div>
                <h3 
                  className="font-display font-normal text-lg tracking-wide mb-3"
                  style={{ color: "#111111", lineHeight: 1.4 }}
                >
                  Saga Storytelling
                </h3>
                <p 
                  className="text-base"
                  style={{ color: "#111111", lineHeight: 1.7 }}
                >
                  The voices and voyages that shaped the North Atlantic.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className={container}>
        <hr style={{ borderColor: "#d4d0c8", borderTopWidth: "1px" }} />
      </div>

      {/* ══════════════════════════════════════
          3. IMMERSIVE IMAGE BREAK
          ══════════════════════════════════════ */}
      <section className="py-28">
        <div className="relative w-full h-[42vh] md:h-[46vh] max-h-[50vh] overflow-hidden">
          <Image
            src="/wood.jpg"
            alt="Close-up of ship wood and iron rivet detail"
            fill
            quality={95}
            sizes="100vw"
            className="object-cover object-center"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
            aria-hidden="true"
          />
          <div className="absolute bottom-5 left-0 right-0 z-10 flex flex-col items-center gap-1 pointer-events-none">
            <p
              className="text-[11px] font-light tracking-[0.12em] uppercase text-white"
              style={{ opacity: 0.68 }}
            >
              Explore Further
            </p>
            <span className="text-xs text-white leading-none" style={{ opacity: 0.58 }} aria-hidden="true">
              ↓
            </span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          4. CTA
          ══════════════════════════════════════ */}
      <section className="py-24">
        <div className={container}>
          <div className="max-w-[480px] mx-auto text-center">
            <h2
              className="font-display font-light leading-tight"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", color: "#111111" }}
            >
              Visit the Viking World
            </h2>
            <p className="mt-4 text-base leading-relaxed" style={{ color: "#6b6b6b" }}>
              Allow 60–90 minutes to explore.
              <br />
              Open year-round in Reykjanesbær.
            </p>
            <div className="mt-14 flex flex-wrap items-center justify-center gap-6">
              <a
                href={ticketLink.href}
                target={ticketLink.target}
                rel={ticketLink.rel}
                onClick={() => trackBookTicketsClick({ source: "homepage-cta" })}
                className="inline-flex items-center px-10 py-4 text-sm font-semibold tracking-widest uppercase bg-accent-frost-blue text-[#111111] hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-frost-blue"
              >
                BOOK TICKETS
              </a>
              <Link
                href={ROUTES.groups}
                className="text-sm font-medium tracking-widest uppercase underline underline-offset-4 hover:no-underline transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ color: "#6b6b6b" }}
              >
                GROUPS &amp; SCHOOLS
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

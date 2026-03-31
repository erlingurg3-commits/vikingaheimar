"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useScrollReveal } from "@/app/components/hooks/useScrollReveal";
import NorthernLights from "@/app/components/effects/NorthernLights";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function reveal(visible: boolean, delay = 0): React.CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(32px)",
    transition: `opacity 1000ms cubic-bezier(0.25,0.1,0.25,1) ${delay}ms, transform 1000ms cubic-bezier(0.25,0.1,0.25,1) ${delay}ms`,
  };
}

const container = "mx-auto w-full max-w-[1080px] px-8 md:px-16";

/* ------------------------------------------------------------------ */
/*  SECTION 1 — Hero                                                  */
/* ------------------------------------------------------------------ */

function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background image */}
      <Image
        src="/ship.jpg"
        alt="The Íslendingur Viking ship inside Víkingaheimar"
        fill
        priority
        sizes="100vw"
        className="object-cover animate-slowZoom"
      />

      {/* Cool gradient overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,12,15,0.25) 0%, rgba(10,12,15,0.45) 50%, rgba(10,12,15,0.92) 100%)",
        }}
      />

      {/* Bottom-anchored content */}
      <div className="absolute inset-0 flex items-end">
        <div className={`${container} pb-20 md:pb-28`}>
          {/* Eyebrow */}
          <p
            className="hero-fade-1 text-[11px] font-semibold uppercase tracking-[0.25em]"
            style={{ color: "rgba(78,168,222,0.80)" }}
          >
            5 minutes from KEF Airport
          </p>

          {/* Heading */}
          <h1
            className="hero-fade-2 mt-5"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(36px, 6vw, 64px)",
              lineHeight: 1.08,
              color: "#ffffff",
            }}
          >
            Already here.
          </h1>

          {/* Subtitle */}
          <p
            className="hero-fade-3 mt-5 max-w-[520px] text-[15px] leading-relaxed"
            style={{ color: "rgba(255,255,255,0.70)" }}
          >
            Víkingaheimar is the closest cultural landmark to Keflavík
            International Airport. If you have 90&nbsp;minutes, you have enough.
          </p>

          {/* CTA */}
          <div className="hero-fade-4 mt-8">
            <Link
              href="/booking"
              className="inline-block rounded-sm px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors"
              style={{ backgroundColor: "#c8874a" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#b5763d")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#c8874a")
              }
            >
              Book Tickets
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="hero-fade-5 mt-12 flex flex-col items-start gap-2">
            <span
              className="text-[10px] uppercase tracking-[0.3em]"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Scroll
            </span>
            <div
              className="h-8 w-px"
              style={{ backgroundColor: "rgba(255,255,255,0.20)" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTION 2 — At a Glance                                           */
/* ------------------------------------------------------------------ */

function AtAGlanceSection() {
  const { ref: r1, isVisible: v1 } = useScrollReveal<HTMLDivElement>();
  const { ref: r2, isVisible: v2 } = useScrollReveal<HTMLDivElement>({ delay: 120 });
  const { ref: r3, isVisible: v3 } = useScrollReveal<HTMLDivElement>({ delay: 240 });

  const eyebrowStyle: React.CSSProperties = {
    color: "rgba(78,168,222,0.80)",
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.25em",
  };

  const h3Style: React.CSSProperties = {
    fontFamily: "var(--font-display)",
    fontWeight: 300,
    fontSize: "22px",
    lineHeight: 1.3,
    color: "#1a1a1a",
    marginTop: "12px",
  };

  const bodyStyle: React.CSSProperties = {
    fontSize: "15px",
    lineHeight: 1.65,
    color: "#7a7672",
    marginTop: "8px",
  };

  return (
    <section style={{ backgroundColor: "#f5f3ee" }}>
      {/* Gradient bridge */}
      <div
        aria-hidden="true"
        style={{
          height: 120,
          background:
            "linear-gradient(to bottom, #0d0c0a, #f5f3ee)",
        }}
      />

      <div className={`${container} py-20 md:py-28`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {/* Column 1 — Opening Hours */}
          <div
            ref={r1}
            className="border-t border-[#e2ddd7] pt-8 md:border-t-0 md:border-r md:border-[#e2ddd7] md:pr-10 md:pt-0"
            style={reveal(v1)}
          >
            <p style={eyebrowStyle}>Opening Hours</p>
            <h3 style={h3Style}>Daily 10:00–18:00</h3>
            <p style={bodyStyle}>Open every day of the year</p>
          </div>

          {/* Column 2 — Location */}
          <div
            ref={r2}
            className="border-t border-[#e2ddd7] pt-8 mt-8 md:border-t-0 md:border-r md:border-[#e2ddd7] md:px-10 md:pt-0 md:mt-0"
            style={reveal(v2, 120)}
          >
            <p style={eyebrowStyle}>Location</p>
            <h3 style={h3Style}>Reykjanesbær</h3>
            <p style={bodyStyle}>Víkingabraut 1, 260 Reykjanesbær</p>
            <Link
              href="https://maps.google.com/?q=Vikingaheimar+Reykjanesbaer"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-[13px] font-medium transition-colors"
              style={{ color: "#c8874a" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "#b5763d")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "#c8874a")
              }
            >
              View on map &rarr;
            </Link>
          </div>

          {/* Column 3 — Duration */}
          <div
            ref={r3}
            className="border-t border-[#e2ddd7] pt-8 mt-8 md:border-t-0 md:pl-10 md:pt-0 md:mt-0"
            style={reveal(v3, 240)}
          >
            <p style={eyebrowStyle}>Duration</p>
            <h3 style={h3Style}>60–90 minutes</h3>
            <p style={bodyStyle}>Perfect for a layover or day trip</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTION 3 — Getting Here                                          */
/* ------------------------------------------------------------------ */

const transportCards = [
  {
    title: "By Car",
    headline: "5-minute drive",
    body: "Take Route 41 from Keflavík. Free parking on-site with space for coaches and campervans.",
  },
  {
    title: "By Bus",
    headline: "Route 55 from KEF",
    body: "Straetó bus route 55 connects the airport to Reykjanesbær. Stop at Víkingabraut, 2-minute walk.",
  },
  {
    title: "By Taxi",
    headline: "8 minutes, direct",
    body: "Taxis queue outside KEF arrivals. Approximate fare 3,000–4,000 ISK one way.",
  },
];

function GettingHereSection() {
  const { ref: labelRef, isVisible: labelVis } = useScrollReveal<HTMLDivElement>();
  const { ref: c1, isVisible: v1 } = useScrollReveal<HTMLDivElement>({ delay: 100 });
  const { ref: c2, isVisible: v2 } = useScrollReveal<HTMLDivElement>({ delay: 220 });
  const { ref: c3, isVisible: v3 } = useScrollReveal<HTMLDivElement>({ delay: 340 });
  const cardRefs = [c1, c2, c3];
  const cardVis = [v1, v2, v3];

  return (
    <section style={{ backgroundColor: "#f5f3ee" }}>
      <div className={`${container} pb-20 md:pb-28`}>
        {/* Section label */}
        <div ref={labelRef} className="text-center mb-14" style={reveal(labelVis)}>
          <p
            style={{
              color: "rgba(78,168,222,0.80)",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.25em",
            }}
          >
            How to Reach Us
          </p>
        </div>

        {/* Transport cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {transportCards.map((card, i) => (
            <div
              key={card.title}
              ref={cardRefs[i]}
              className="rounded-lg border border-[#e2ddd7] p-8"
              style={{
                borderTop: "4px solid #4ea8de",
                ...reveal(cardVis[i], i * 120),
              }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: "rgba(78,168,222,0.80)" }}
              >
                {card.title}
              </p>
              <h3
                className="mt-3"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 300,
                  fontSize: "22px",
                  lineHeight: 1.3,
                  color: "#1a1a1a",
                }}
              >
                {card.headline}
              </h3>
              <p
                className="mt-3"
                style={{
                  fontSize: "15px",
                  lineHeight: 1.65,
                  color: "#7a7672",
                }}
              >
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTION 4 — The Perfect Layover                                   */
/* ------------------------------------------------------------------ */

const timelineEntries = [
  { time: "10:00", desc: "Land at KEF, collect bags" },
  { time: "10:15", desc: "Drive to Víkingaheimar (5 min)" },
  { time: "10:30 – 12:00", desc: "Explore the museum" },
  { time: "12:15", desc: "Return to KEF, continue your journey" },
];

function LayoverSection() {
  const { ref: labelRef, isVisible: labelVis } = useScrollReveal<HTMLDivElement>();
  const t0 = useScrollReveal<HTMLDivElement>({ delay: 100 });
  const t1 = useScrollReveal<HTMLDivElement>({ delay: 250 });
  const t2 = useScrollReveal<HTMLDivElement>({ delay: 400 });
  const t3 = useScrollReveal<HTMLDivElement>({ delay: 550 });
  const nodes = [t0, t1, t2, t3];
  const { ref: quoteRef, isVisible: quoteVis } = useScrollReveal<HTMLDivElement>({ delay: 200 });

  return (
    <section style={{ backgroundColor: "#f5f3ee" }}>
      <div className={`${container} pb-20 md:pb-28`}>
        {/* Section label */}
        <div ref={labelRef} className="text-center mb-14" style={reveal(labelVis)}>
          <p
            style={{
              color: "rgba(78,168,222,0.80)",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.25em",
            }}
          >
            The Perfect Layover
          </p>
        </div>

        {/* Timeline */}
        <div className="relative mx-auto max-w-[540px]">
          {/* Vertical line */}
          <div
            aria-hidden="true"
            className="absolute left-[7px] top-2 bottom-2 w-px"
            style={{ backgroundColor: "rgba(78,168,222,0.25)" }}
          />

          <div className="space-y-10">
            {timelineEntries.map((entry, i) => (
              <div
                key={entry.time}
                ref={nodes[i].ref}
                className="relative flex items-start gap-6 pl-7"
                style={reveal(nodes[i].isVisible, i * 150)}
              >
                {/* Dot */}
                <div
                  aria-hidden="true"
                  className="absolute left-0 top-[6px] h-[14px] w-[14px] rounded-full"
                  style={{ backgroundColor: "#4ea8de" }}
                />

                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 300,
                      fontSize: "22px",
                      lineHeight: 1.3,
                      color: "#1a1a1a",
                    }}
                  >
                    {entry.time}
                  </p>
                  <p
                    className="mt-1"
                    style={{
                      fontSize: "15px",
                      lineHeight: 1.65,
                      color: "#7a7672",
                    }}
                  >
                    {entry.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pull-quote */}
        <div
          ref={quoteRef}
          className="mt-16 text-center"
          style={reveal(quoteVis, 200)}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontStyle: "italic",
              fontSize: "clamp(18px, 2.5vw, 24px)",
              lineHeight: 1.5,
              color: "rgba(28,20,12,0.50)",
              maxWidth: 540,
              margin: "0 auto",
            }}
          >
            &ldquo;You don&rsquo;t need a full day. You just need to
            arrive.&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTION 5 — Final CTA                                             */
/* ------------------------------------------------------------------ */

function FinalCtaSection() {
  const { ref: r1, isVisible: v1 } = useScrollReveal<HTMLParagraphElement>();
  const { ref: r2, isVisible: v2 } = useScrollReveal<HTMLHeadingElement>({ delay: 120 });
  const { ref: r3, isVisible: v3 } = useScrollReveal<HTMLParagraphElement>({ delay: 240 });
  const { ref: r4, isVisible: v4 } = useScrollReveal<HTMLDivElement>({ delay: 360 });

  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: "#0d0c0a" }}
    >
      {/* Gradient bridge */}
      <div
        aria-hidden="true"
        style={{
          height: 120,
          background: "linear-gradient(to bottom, #f5f3ee, #0d0c0a)",
        }}
      />

      {/* Northern Lights canvas */}
      <div className="relative py-28 md:py-36">
        <NorthernLights />

        <div
          className={`${container} relative z-10 flex flex-col items-center text-center`}
        >
          <div style={{ maxWidth: 640 }}>
            {/* Eyebrow */}
            <p
              ref={r1}
              className="text-[11px] font-semibold uppercase tracking-[0.25em]"
              style={{
                color: "rgba(78,168,222,0.80)",
                ...reveal(v1),
              }}
            >
              Open Daily 10:00–18:00
            </p>

            {/* Heading */}
            <h2
              ref={r2}
              className="mt-5"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 300,
                fontSize: "clamp(40px, 6vw, 72px)",
                lineHeight: 1.08,
                color: "#ffffff",
                ...reveal(v2, 120),
              }}
            >
              Your layover just got legendary.
            </h2>

            {/* Subtitle */}
            <p
              ref={r3}
              className="mt-5"
              style={{
                fontSize: "15px",
                lineHeight: 1.65,
                color: "rgba(255,255,255,0.60)",
                ...reveal(v3, 240),
              }}
            >
              Book online, skip the queue, walk straight in.
            </p>

            {/* Buttons */}
            <div
              ref={r4}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
              style={reveal(v4, 360)}
            >
              <Link
                href="/booking"
                className="inline-block rounded-sm px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors"
                style={{ backgroundColor: "#c8874a" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#b5763d")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#c8874a")
                }
              >
                Book Tickets
              </Link>

              <Link
                href="/groups"
                className="inline-block rounded-sm border px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors"
                style={{
                  borderColor: "rgba(255,255,255,0.25)",
                  color: "rgba(255,255,255,0.70)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.50)";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.70)";
                }}
              >
                Group Bookings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function VisitPageClient() {
  return (
    <main>
      <HeroSection />
      <AtAGlanceSection />
      <GettingHereSection />
      <LayoverSection />
      <FinalCtaSection />
    </main>
  );
}

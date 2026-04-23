"use client";

import Link from "next/link";
import Image from "next/image";
import type React from "react";
import { ROUTES } from "@/lib/site-routes";
import { getBookTicketsLink } from "@/lib/ticketing";
import { trackBookTicketsClick } from "@/lib/analytics";
import { useScrollReveal } from "@/app/components/hooks/useScrollReveal";
import NorthernLights from "@/app/components/effects/NorthernLights";
import OceanSoundToggle from "@/app/components/effects/OceanSoundToggle";
import IslendingurBlueprint from "@/app/components/home/IslendingurBlueprint";
import HeroButton from "@/app/components/ui/HeroButton";


const container = "mx-auto w-full max-w-[1080px] px-8 md:px-16";

/** Shared scroll-reveal inline style. Drops opacity and lifts up when not visible. */
function reveal(visible: boolean, delay = 0): React.CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(32px)",
    transition: `opacity 1000ms cubic-bezier(0.25,0.1,0.25,1) ${delay}ms, transform 1000ms cubic-bezier(0.25,0.1,0.25,1) ${delay}ms`,
  };
}

export default function HomePageClient() {
  const ticketLink = getBookTicketsLink();

  const { ref: statementRef, isVisible: statementVisible } =
    useScrollReveal<HTMLDivElement>();
  const { ref: expRef, isVisible: expVisible } =
    useScrollReveal<HTMLDivElement>();
  const { ref: infoRef, isVisible: infoVisible } =
    useScrollReveal<HTMLDivElement>();
  const { ref: ctaRef, isVisible: ctaVisible } =
    useScrollReveal<HTMLDivElement>();
  const { ref: cardsRef, isVisible: cardsVisible } =
    useScrollReveal<HTMLDivElement>({ threshold: 0.06 });

  return (
    <div>
      {/* ═══════════════════════════════════════════════════════════════
          1. HERO — full viewport, content at bottom, gradient fade
          ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          backgroundColor: "#0d0c0a",
        }}
      >
        {/* Layer 1: Onboard video — autoplay, loop, muted, cross-fade on loop */}
        <video
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          className="hero-video"
          ref={(el) => {
            if (!el) return;
            const FADE = 1.5;
            const onTime = () => {
              const remaining = el.duration - el.currentTime;
              if (remaining <= FADE) {
                el.style.opacity = String(remaining / FADE);
              } else if (el.currentTime <= FADE) {
                el.style.opacity = String(Math.min(el.currentTime / FADE, 1));
              } else {
                el.style.opacity = "1";
              }
            };
            el.addEventListener("timeupdate", onTime);
            el.addEventListener("seeked", () => { el.style.opacity = "0"; });
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 55%",
            opacity: 0,
            transition: "opacity 0.3s ease",
          }}
        >
          <source src="/onboard.mp4" type="video/mp4" />
        </video>

        {/* Layer 2: Gradient overlay — near-transparent top, near-black bottom */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(10,8,6,0) 0%, rgba(10,8,6,0.2) 40%, rgba(10,8,6,0.75) 75%, rgba(13,11,9,0.96) 100%)",
          }}
        />

        {/* Layer 3: Content — anchored to bottom, sequential CSS reveal */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingBottom: "100px",
            paddingLeft: "24px",
            paddingRight: "24px",
            textAlign: "center",
          }}
        >
          {/* Location label — hero-fade-1: 1000ms delay 200ms */}
          <p
            className="font-text hero-fade-1"
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.18em",
              color: "rgba(255,255,255,0.45)",
              marginBottom: 28,
              textTransform: "uppercase",
            }}
          >
            REYKJANESBÆR, ICELAND
          </p>

          {/* H1 — hero-fade-2: 1200ms delay 400ms */}
          <h1
            className="hero-fade-2"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "clamp(32px, 4vw, 56px)",
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              color: "white",
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            Step into the Viking Age.
          </h1>

          {/* Subtitle — hero-fade-3: 1000ms delay 700ms */}
          <p
            className="font-display hero-fade-3"
            style={{
              marginTop: "24px",
              fontSize: "clamp(13px, 1.2vw, 16px)",
              fontWeight: 400,
              color: "rgba(255,255,255,0.65)",
              maxWidth: "480px",
              lineHeight: 1.7,
            }}
          >
            Iceland&apos;s authentic Viking museum — open year-round.
          </p>

          {/* CTA button — hero-fade-4: 800ms delay 1000ms */}
          <div className="hero-fade-4" style={{ marginTop: "40px" }}>
            <HeroButton
              href="/booking"
              label="BOOK TICKETS"
              onClick={() => trackBookTicketsClick({ source: "homepage-hero" })}
            />
          </div>

          {/* Gunnbjörn link — hero-fade-5: subtle, minimal */}
          <Link
            href="/vikings#gunnbjorn"
            className="font-display hero-fade-5"
            style={{
              marginTop: "20px",
              fontSize: 11,
              fontWeight: 400,
              letterSpacing: "0.14em",
              color: "rgba(255,255,255,0.35)",
              textDecoration: "none",
              transition: "color 300ms",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(200,135,74,0.8)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
          >
            Have a question? Ask Gunnbjörn ᛫
          </Link>

          {/* Scroll indicator — hero-fade-6: 600ms delay 1400ms */}
          <div
            className="hero-fade-5"
            style={{
              marginTop: "48px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 1,
                height: 48,
                background: "rgba(255,255,255,0.3)",
              }}
            />
            <span
              className="font-text"
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.2em",
                color: "rgba(255,255,255,0.3)",
                marginTop: 12,
                textTransform: "uppercase",
              }}
            >
              SCROLL
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          GRADIENT BRIDGE — dark hero dissolves into warm parchment
          ═══════════════════════════════════════════════════════════════ */}
      <div
        aria-hidden="true"
        style={{
          height: 120,
          background:
            "linear-gradient(to bottom, #0d0c0a 0%, #2a2520 30%, #e8e4dc 70%, #f5f3ee 100%)",
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════
          2. STATEMENT — single thought, generous breathing room
          ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: "#f5f3ee",
          paddingTop: "clamp(80px, 10vh, 140px)",
          paddingBottom: "clamp(16px, 2vh, 24px)",
        }}
      >
        <div
          ref={statementRef}
          className={container}
          style={{ textAlign: "center", ...reveal(statementVisible) }}
        >
          {/* Thin amber accent line */}
          <div
            style={{
              width: 48,
              height: 1,
              background: "#c8874a",
              margin: "0 auto 48px",
            }}
          />

          <h2
            className="font-display"
            style={{
              fontSize: "clamp(32px, 4vw, 52px)",
              fontWeight: 400,
              color: "#1a1a1a",
              lineHeight: 1.1,
              maxWidth: 720,
              margin: "0 auto",
            }}
          >
            The ancient world, made present.
          </h2>

          <p
            className="font-text"
            style={{
              fontSize: 17,
              fontWeight: 400,
              lineHeight: 1.85,
              color: "#7a7672",
              maxWidth: 480,
              margin: "32px auto 0",
            }}
          >
            Víkingaheimar is built around the Íslendingur —
            a full-scale Viking longship that crossed the Atlantic.
            Come and stand beside it.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          ÍSLENDINGUR BLUEPRINT — top-down ship, draws on scroll
          ═══════════════════════════════════════════════════════════════ */}
      <IslendingurBlueprint />

      {/* ═══════════════════════════════════════════════════════════════
          3. TWO-CARD SPLIT — full bleed, edge to edge
          ═══════════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: "#f5f3ee" }}>
        <div
          ref={cardsRef as React.RefObject<HTMLDivElement>}
          className="flex flex-col md:flex-row"
          style={{
            position: "relative",
            width: "100%",
            transition: "opacity 1400ms cubic-bezier(0.16,1,0.3,1), transform 1400ms cubic-bezier(0.16,1,0.3,1)",
            opacity: cardsVisible ? 1 : 0,
            transform: cardsVisible ? "translateY(0)" : "translateY(40px)",
          }}
        >
          {/* Top fade — parchment bleeds into cards from above */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 120,
              background: "linear-gradient(to bottom, #f5f3ee 0%, transparent 100%)",
              zIndex: 10,
              pointerEvents: "none",
            }}
          />
          {/* Card 1 — Individual Visit */}
          <a
            href="/booking"
            onClick={() => trackBookTicketsClick({ source: "homepage-split" })}
            className="group"
            style={{
              flex: 1,
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              minHeight: "clamp(360px, 56vh, 860px)",
              display: "block",
              textDecoration: "none",
            }}
          >
            <Image
              src="/ship.jpg"
              alt="Visit the Museum — Íslendingur Viking longship"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover group-hover:scale-[1.02]"
              style={{ transition: "transform 8s cubic-bezier(0.16,1,0.3,1)" }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(8,6,4,0.88) 0%, rgba(8,6,4,0.40) 50%, rgba(8,6,4,0.10) 100%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "clamp(32px, 5vw, 64px)",
              }}
            >
              <p
                className="font-text"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.16em",
                  color: "rgba(200,135,74,0.9)",
                  marginBottom: 16,
                  textTransform: "uppercase",
                }}
              >
                INDIVIDUAL VISIT
              </p>
              <h3
                className="font-display"
                style={{
                  fontSize: "clamp(24px, 2.6vw, 36px)",
                  fontWeight: 400,
                  color: "#ffffff",
                  lineHeight: 1.1,
                  marginBottom: 12,
                }}
              >
                Visit the Museum
              </h3>
              <p
                className="font-text"
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.60)",
                  marginBottom: 32,
                }}
              >
                Open year-round · Allow 60–90 minutes
              </p>
              <span
                className="font-text"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  color: "#c8874a",
                  textTransform: "uppercase",
                }}
              >
                BOOK TICKETS <span style={{ transition: "transform 600ms cubic-bezier(0.16,1,0.3,1)" }} className="group-hover:translate-x-1">→</span>
              </span>
            </div>
          </a>

          {/* Vertical divider */}
          <div
            className="hidden md:block"
            style={{ width: 1, background: "rgba(255,255,255,0.15)" }}
          />

          {/* Card 2 — Group Visits */}
          <Link
            href={ROUTES.groups}
            className="group"
            style={{
              flex: 1,
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              minHeight: "clamp(360px, 56vh, 860px)",
              display: "block",
              textDecoration: "none",
            }}
          >
            <Image
              src="/building.jpg"
              alt="Group Visits — building exterior"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover group-hover:scale-[1.02]"
              style={{ transition: "transform 8s cubic-bezier(0.16,1,0.3,1)" }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(8,6,4,0.88) 0%, rgba(8,6,4,0.40) 50%, rgba(8,6,4,0.10) 100%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "clamp(32px, 5vw, 64px)",
              }}
            >
              <p
                className="font-text"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.16em",
                  color: "rgba(200,135,74,0.9)",
                  marginBottom: 16,
                  textTransform: "uppercase",
                }}
              >
                GROUPS AND PRIVATE EVENTS
              </p>
              <h3
                className="font-display"
                style={{
                  fontSize: "clamp(24px, 2.6vw, 36px)",
                  fontWeight: 400,
                  color: "#ffffff",
                  lineHeight: 1.1,
                  marginBottom: 12,
                }}
              >
                Visit as a Group
              </h3>
              <p
                className="font-text"
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.60)",
                  marginBottom: 32,
                }}
              >
                Private events · Tailored experience
              </p>
              <span
                className="font-text"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  color: "#c8874a",
                  textTransform: "uppercase",
                }}
              >
                ENQUIRE <span style={{ transition: "transform 600ms cubic-bezier(0.16,1,0.3,1)" }} className="group-hover:translate-x-1">→</span>
              </span>
            </div>
          </Link>
          {/* Bottom fade — cards bleed into parchment below */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 120,
              background: "linear-gradient(to top, #f5f3ee 0%, transparent 100%)",
              zIndex: 10,
              pointerEvents: "none",
            }}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          4–5. EXPERIENCE + PRACTICAL INFO — with sword backdrop
          ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: "#f5f3ee",
          position: "relative",
          overflow: "hidden",
          paddingTop: "clamp(96px, 12vh, 160px)",
          paddingBottom: "clamp(96px, 12vh, 160px)",
          boxShadow: "inset 0 40px 80px -20px rgba(245,243,238,0.8)",
        }}
      >
        {/* Sword background — large, centered, very subtle */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "clamp(500px, 60vw, 900px)",
            height: "100%",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <Image
            src="/sword.png"
            alt=""
            fill
            sizes="900px"
            style={{
              objectFit: "contain",
              objectPosition: "center",
              opacity: 0.06,
              mixBlendMode: "multiply",
            }}
          />
        </div>

        {/* Content — above the sword */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className={container}>
            {/* Section label row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                marginBottom: 80,
              }}
            >
              <div style={{ flex: 1, height: 1, background: "#e2ddd7" }} />
              <span
                className="font-text"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  color: "#c8874a",
                  whiteSpace: "nowrap",
                  textTransform: "uppercase",
                }}
              >
                THE EXPERIENCE
              </span>
              <div style={{ flex: 1, height: 1, background: "#e2ddd7" }} />
            </div>

            {/* Three columns — staggered reveal */}
            <div
              ref={expRef}
              className="grid grid-cols-1 md:grid-cols-3 gap-16"
            >
              {/* Item 1 — Íslendingur */}
              <div
                style={{
                  paddingTop: 40,
                  borderTop: "1px solid #e2ddd7",
                  ...reveal(expVisible, 0),
                }}
              >
                <h3
                  className="font-display"
                  style={{
                    fontSize: "clamp(19px, 2.2vw, 26px)",
                    fontWeight: 400,
                    color: "#1a1a1a",
                    marginBottom: 20,
                  }}
                >
                  Íslendingur
                </h3>
                <p
                  className="font-text"
                  style={{ fontSize: 15, lineHeight: 1.85, color: "#7a7672" }}
                >
                  A full-scale Viking longship built to cross the
                  Atlantic — and the centerpiece of everything we are.
                </p>
              </div>

              {/* Item 2 — Norse Artifacts */}
              <div
                style={{
                  paddingTop: 40,
                  borderTop: "1px solid #e2ddd7",
                  ...reveal(expVisible, 180),
                }}
              >
                <h3
                  className="font-display"
                  style={{
                    fontSize: "clamp(19px, 2.2vw, 26px)",
                    fontWeight: 400,
                    color: "#1a1a1a",
                    marginBottom: 20,
                  }}
                >
                  Norse Artifacts
                </h3>
                <p
                  className="font-text"
                  style={{ fontSize: 15, lineHeight: 1.85, color: "#7a7672" }}
                >
                  Authentic objects recovered from archaeological
                  sites across the Norse world. Touch a thousand years of history.
                </p>
              </div>

              {/* Item 3 — Saga Storytelling */}
              <div
                style={{
                  paddingTop: 40,
                  borderTop: "1px solid #e2ddd7",
                  ...reveal(expVisible, 360),
                }}
              >
                <h3
                  className="font-display"
                  style={{
                    fontSize: "clamp(19px, 2.2vw, 26px)",
                    fontWeight: 400,
                    color: "#1a1a1a",
                    marginBottom: 20,
                  }}
                >
                  Saga Storytelling
                </h3>
                <p
                  className="font-text"
                  style={{ fontSize: 15, lineHeight: 1.85, color: "#7a7672" }}
                >
                  The sagas that shaped the North Atlantic, told where
                  they were lived. This is Iceland. This is the story.
                </p>
              </div>
            </div>
          </div>

          {/* Divider between experience and info */}
          <div
            className={container}
            style={{ paddingTop: "clamp(80px, 10vh, 140px)" }}
          >
            <div
              style={{
                width: "100%",
                height: 1,
                background: "#e2ddd7",
                marginBottom: 80,
              }}
            />
          </div>

          {/* Practical info */}
          <div className={container}>
            <div
              ref={infoRef}
              className="flex flex-col md:flex-row"
            >
            {/* Column 1 — Hours */}
            <div
              className="flex-1 pb-10 md:pb-0 md:pr-12"
              style={reveal(infoVisible, 0)}
            >
              <p
                className="font-text"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  color: "#c8874a",
                  textTransform: "uppercase",
                  marginBottom: 20,
                }}
              >
                OPENING HOURS
              </p>
              <h3
                className="font-display"
                style={{
                  fontSize: 28,
                  fontWeight: 400,
                  color: "#1a1a1a",
                  marginBottom: 12,
                }}
              >
                Daily 10:00–16:00
              </h3>
              <p
                className="font-text"
                style={{ fontSize: 15, color: "#7a7672", lineHeight: 1.7 }}
              >
                Open every day of the year
              </p>
            </div>

            {/* Divider 1 */}
            <div
              className="hidden md:block"
              style={{
                width: 1,
                alignSelf: "stretch",
                background: "#e2ddd7",
              }}
            />

            {/* Column 2 — Location */}
            <div
              className="flex-1 py-10 md:py-0 md:px-12 border-t md:border-t-0"
              style={{ borderColor: "#e2ddd7", ...reveal(infoVisible, 120) }}
            >
              <p
                className="font-text"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  color: "#c8874a",
                  textTransform: "uppercase",
                  marginBottom: 20,
                }}
              >
                LOCATION
              </p>
              <h3
                className="font-display"
                style={{
                  fontSize: 28,
                  fontWeight: 400,
                  color: "#1a1a1a",
                  marginBottom: 12,
                }}
              >
                Reykjanesbær
              </h3>
              <p
                className="font-text"
                style={{ fontSize: 15, color: "#7a7672", lineHeight: 1.7 }}
              >
                Víkingabraut 1, 260 Reykjanesbær
              </p>
              <a
                href="https://maps.google.com/?q=Vikingaheimar,+Víkingabraut+1,+260+Reykjanesbær,+Iceland"
                target="_blank"
                rel="noopener noreferrer"
                className="font-text"
                style={{
                  marginTop: 16,
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  color: "#c8874a",
                  textDecoration: "none",
                  transition: "color 250ms",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#b5763d";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#c8874a";
                }}
              >
                View on map →
              </a>
            </div>

            {/* Divider 2 */}
            <div
              className="hidden md:block"
              style={{
                width: 1,
                alignSelf: "stretch",
                background: "#e2ddd7",
              }}
            />

            {/* Column 3 — Getting Here */}
            <div
              className="flex-1 pt-10 md:pt-0 md:pl-12 border-t md:border-t-0"
              style={{ borderColor: "#e2ddd7", ...reveal(infoVisible, 240) }}
            >
              <p
                className="font-text"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  color: "#c8874a",
                  textTransform: "uppercase",
                  marginBottom: 20,
                }}
              >
                GETTING HERE
              </p>
              <h3
                className="font-display"
                style={{
                  fontSize: 28,
                  fontWeight: 400,
                  color: "#1a1a1a",
                  marginBottom: 12,
                }}
              >
                10 min from Keflavík
              </h3>
              <p
                className="font-text"
                style={{ fontSize: 15, color: "#7a7672", lineHeight: 1.7 }}
              >
                10 min from Keflavík Airport
                <br />
                45 min from Reykjavík
              </p>
            </div>
          </div>
        </div>
      </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          GRADIENT BRIDGE — soft dissolve from parchment to near-black
          ═══════════════════════════════════════════════════════════════ */}
      <div
        aria-hidden="true"
        style={{
          height: 120,
          background:
            "linear-gradient(to bottom, #f5f3ee 0%, #e8e4dc 30%, #2a2520 70%, #0d0c0a 100%)",
        }}
      />

      {/* ═══════════════════════════════════════════════════════════════
          6. FINAL CTA — dark, ambient glow, amber buttons
          ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: "#0d0c0a",
          position: "relative",
          overflow: "hidden",
          paddingTop: "clamp(100px, 14vh, 180px)",
          paddingBottom: "clamp(100px, 14vh, 180px)",
        }}
      >
        <NorthernLights />

        <div
          ref={ctaRef}
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: 640,
            margin: "0 auto",
            textAlign: "center",
            padding: "0 32px",
          }}
        >
          {/* Eyebrow — stagger 0ms */}
          <p
            className="font-text"
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.18em",
              color: "rgba(200,135,74,0.70)",
              textTransform: "uppercase",
              marginBottom: 40,
              ...reveal(ctaVisible, 0),
            }}
          >
            OPEN YEAR-ROUND · REYKJANESBÆR
          </p>

          {/* H2 — stagger 100ms */}
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(46px, 6vw, 84px)",
              fontWeight: 400,
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              marginBottom: 32,
              ...reveal(ctaVisible, 100),
            }}
          >
            Come aboard.
          </h2>

          {/* Subtitle — stagger 200ms */}
          <p
            className="font-display"
            style={{
              fontSize: "clamp(15px, 1.8vw, 19px)",
              fontWeight: 400,
              color: "rgba(255,255,255,0.50)",
              lineHeight: 1.6,
              ...reveal(ctaVisible, 200),
            }}
          >
            A thousand years. One crossing. Your turn.
          </p>

          {/* Buttons — stagger 350ms */}
          <div
            style={{
              marginTop: 56,
              display: "flex",
              gap: 16,
              justifyContent: "center",
              flexWrap: "wrap",
              ...reveal(ctaVisible, 350),
            }}
          >
            {/* Primary — BOOK TICKETS */}
            <HeroButton
              href="/booking"
              label="BOOK TICKETS"
              onClick={() =>
                trackBookTicketsClick({ source: "homepage-final-cta" })
              }
            />

            {/* Secondary — GROUPS */}
            <HeroButton
              href={ROUTES.groups}
              label="GROUPS"
              variant="frost"
            />
          </div>
        </div>
      </section>

      {/* Fixed ambient sound toggle */}
      <OceanSoundToggle />
    </div>
  );
}

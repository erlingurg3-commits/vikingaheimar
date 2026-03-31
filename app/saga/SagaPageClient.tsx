"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type React from "react";
import { useScrollReveal } from "@/app/components/hooks/useScrollReveal";

const container = "mx-auto w-full max-w-[1080px] px-8 md:px-16";

function reveal(visible: boolean, delay = 0): React.CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(32px)",
    transition: `opacity 1000ms cubic-bezier(0.25,0.1,0.25,1) ${delay}ms, transform 1000ms cubic-bezier(0.25,0.1,0.25,1) ${delay}ms`,
  };
}

const VOYAGE_WAYPOINTS = [
  {
    date: "17 June 2000",
    place: "Reykjavík, Iceland",
    text: "Nine men board a ship built without blueprints. The harbour watches them leave.",
  },
  {
    date: "18–24 June",
    place: "Open North Atlantic",
    text: "No GPS. No engine. Just wool sails and the same stars the settlers followed a thousand years before.",
  },
  {
    date: "28 June",
    place: "L'Anse aux Meadows",
    text: "Landfall at the Viking settlement in Newfoundland. The first Europeans stood here in 1000 AD.",
  },
  {
    date: "5 July",
    place: "New York Harbour",
    text: "The Íslendingur passes the Statue of Liberty. A Viking ship in Manhattan — one thousand years late.",
  },
] as const;

export default function SagaPageClient() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);

  const { ref: voyageRef, isVisible: voyageVisible } =
    useScrollReveal<HTMLElement>();
  const { ref: ctaRef, isVisible: ctaVisible } =
    useScrollReveal<HTMLDivElement>();

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return (
    <div>
      {/* ═══════════════════════════════════════════════════════════════
          1. HERO — fullscreen video, ship name reveals over darkness
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
        <video
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 55%",
          }}
        >
          <source src="/Íslendingur.mp4" type="video/mp4" />
        </video>

        {/* Gradient veil */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(10,8,6,0.30) 0%, rgba(10,8,6,0.15) 40%, rgba(10,8,6,0.70) 75%, rgba(13,11,9,0.96) 100%)",
          }}
        />

        {/* Content — anchored to bottom */}
        <div
          style={{
            position: "absolute",
            inset: 0,
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
          {/* Ship name */}
          <h1
            className="hero-fade-2"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              fontSize: "clamp(48px, 7vw, 96px)",
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
              color: "white",
              margin: "0 auto",
            }}
          >
            Íslendingur.
          </h1>

          {/* Tagline */}
          <p
            className="font-display hero-fade-3"
            style={{
              marginTop: "28px",
              fontSize: "clamp(15px, 1.6vw, 20px)",
              fontWeight: 300,
              color: "rgba(255,255,255,0.60)",
              maxWidth: "520px",
              lineHeight: 1.6,
            }}
          >
            Iceland to New York. No GPS. No engine. Just wind.
          </p>

          {/* Pulsing anchor arrow */}
          <div
            className="hero-fade-5"
            style={{
              marginTop: "56px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              animation: "anchorPulse 2.4s ease-in-out infinite",
            }}
          >
            <svg
              width="20"
              height="32"
              viewBox="0 0 20 32"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 0 L10 28 M2 20 L10 28 L18 20"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Pulse keyframe — injected once */}
        <style>{`
          @keyframes anchorPulse {
            0%, 100% { opacity: 0.4; transform: translateY(0); }
            50% { opacity: 1; transform: translateY(8px); }
          }
          @media (prefers-reduced-motion: reduce) {
            [style*="anchorPulse"] { animation: none !important; opacity: 0.5; }
          }
        `}</style>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          2. VIDEO — contained player with controls
          ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: "#0d0c0a",
          paddingTop: "clamp(64px, 8vh, 100px)",
          paddingBottom: "clamp(64px, 8vh, 100px)",
        }}
      >
        <div className={container}>
          <div style={{ position: "relative", borderRadius: 4, overflow: "hidden" }}>
            <video
              ref={videoRef}
              src="/Íslendingur.mp4"
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: "100%",
                aspectRatio: "16 / 9",
                objectFit: "cover",
                display: "block",
                backgroundColor: "#000",
              }}
            />

            {/* Controls overlay */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 20px",
                background: "linear-gradient(to top, rgba(0,0,0,0.60) 0%, transparent 100%)",
              }}
            >
              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                aria-label={playing ? "Pause video" : "Play video"}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  color: "rgba(255,255,255,0.85)",
                  transition: "color 200ms",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}
              >
                {playing ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <rect x="4" y="3" width="4" height="14" rx="1" />
                    <rect x="12" y="3" width="4" height="14" rx="1" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3.5L16 10L5 16.5V3.5Z" />
                  </svg>
                )}
              </button>

              {/* Volume */}
              <button
                onClick={toggleMute}
                aria-label={muted ? "Unmute" : "Mute"}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                  alignItems: "center",
                  color: "rgba(255,255,255,0.85)",
                  transition: "color 200ms",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}
              >
                {muted ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          4. THE VOYAGE — captain's log timeline
          ═══════════════════════════════════════════════════════════════ */}
      <section
        ref={voyageRef}
        style={{
          backgroundColor: "#0d0c0a",
          paddingTop: "clamp(80px, 10vh, 140px)",
          paddingBottom: "clamp(80px, 10vh, 140px)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Faint radial glow behind timeline */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "600px",
            height: "600px",
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(ellipse at center, rgba(200,135,74,0.04) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div className={container} style={{ position: "relative", zIndex: 1 }}>
          {/* Section label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              marginBottom: 80,
              ...reveal(voyageVisible, 0),
            }}
          >
            <div
              style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }}
            />
            <span
              className="font-text"
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.18em",
                color: "rgba(200,135,74,0.70)",
                whiteSpace: "nowrap",
                textTransform: "uppercase",
              }}
            >
              THE VOYAGE &middot; AD 2000
            </span>
            <div
              style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }}
            />
          </div>

          {/* Timeline */}
          <div
            style={{
              position: "relative",
              maxWidth: 640,
              margin: "0 auto",
              paddingLeft: 40,
            }}
          >
            {/* Vertical line */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 7,
                top: 8,
                bottom: 8,
                width: 1,
                background:
                  "linear-gradient(to bottom, rgba(200,135,74,0.40), rgba(200,135,74,0.08))",
              }}
            />

            {VOYAGE_WAYPOINTS.map((wp, i) => (
              <div
                key={wp.place}
                style={{
                  position: "relative",
                  paddingBottom: i < VOYAGE_WAYPOINTS.length - 1 ? 56 : 0,
                  ...reveal(voyageVisible, 200 + i * 150),
                }}
              >
                {/* Amber dot */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: -33,
                    top: 8,
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    border: "2px solid #c8874a",
                    background: "#0d0c0a",
                  }}
                />

                <p
                  className="font-text"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#c8874a",
                    marginBottom: 8,
                  }}
                >
                  {wp.date}
                </p>

                <h3
                  className="font-display"
                  style={{
                    fontSize: "clamp(22px, 2.5vw, 30px)",
                    fontWeight: 300,
                    color: "#ffffff",
                    marginBottom: 12,
                    lineHeight: 1.2,
                  }}
                >
                  {wp.place}
                </h3>

                <p
                  className="font-text"
                  style={{
                    fontSize: 15,
                    lineHeight: 1.8,
                    color: "rgba(255,255,255,0.45)",
                    maxWidth: 480,
                  }}
                >
                  {wp.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          5. COME ABOARD — full-width dark CTA
          ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: "#0d0c0a",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "clamp(100px, 14vh, 180px)",
          paddingBottom: "clamp(100px, 14vh, 180px)",
        }}
      >
        <div
          ref={ctaRef}
          style={{
            maxWidth: 640,
            margin: "0 auto",
            textAlign: "center",
            padding: "0 32px",
          }}
        >
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(48px, 7vw, 88px)",
              fontWeight: 300,
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              ...reveal(ctaVisible, 0),
            }}
          >
            The ship is waiting.
          </h2>

          <p
            className="font-display"
            style={{
              marginTop: 28,
              fontSize: "clamp(17px, 2vw, 22px)",
              fontWeight: 300,
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.6,
              ...reveal(ctaVisible, 100),
            }}
          >
            11 minutes from Keflavík Airport.
          </p>

          <div
            style={{
              marginTop: 56,
              ...reveal(ctaVisible, 250),
            }}
          >
            <Link
              href="/booking"
              className="font-text"
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: "#c8874a",
                color: "#ffffff",
                padding: "20px 56px",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                borderRadius: 2,
                border: "none",
                textDecoration: "none",
                transition: "background 250ms, transform 250ms",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#b5763d";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#c8874a";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              BOOK YOUR VISIT
              <span style={{ marginLeft: 10, fontSize: 14 }}>&#8594;</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

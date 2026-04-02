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
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const { ref: ctaRef, isVisible: ctaVisible } =
    useScrollReveal<HTMLDivElement>();


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
          <source src="/Íslendingur loop.mp4" type="video/mp4" />
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
          2. VIDEO — two-column layout with Norse frame
          ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: "#0d0c0a",
          paddingTop: 80,
          paddingBottom: 120,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 60px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 60 }}>
          {/* Left column — video with Norse frame (60%) */}
          <div style={{ flex: "1 1 60%", minWidth: 300 }}>
              {/* Norse decorative frame — outer border */}
              <div
                style={{
                  position: "relative",
                  border: "1px solid rgba(200,135,74,0.3)",
                  padding: 6,
                }}
              >
                {/* Corner accent — top left */}
                <svg width="16" height="16" viewBox="0 0 16 16" style={{ position: "absolute", top: -8, left: -8, zIndex: 2 }} aria-hidden="true">
                  <line x1="8" y1="2" x2="8" y2="14" stroke="#c8874a" strokeWidth="1.5" />
                  <line x1="2" y1="8" x2="14" y2="8" stroke="#c8874a" strokeWidth="1.5" />
                </svg>
                {/* Corner accent — top right */}
                <svg width="16" height="16" viewBox="0 0 16 16" style={{ position: "absolute", top: -8, right: -8, zIndex: 2 }} aria-hidden="true">
                  <line x1="8" y1="2" x2="8" y2="14" stroke="#c8874a" strokeWidth="1.5" />
                  <line x1="2" y1="8" x2="14" y2="8" stroke="#c8874a" strokeWidth="1.5" />
                </svg>
                {/* Corner accent — bottom left */}
                <svg width="16" height="16" viewBox="0 0 16 16" style={{ position: "absolute", bottom: -8, left: -8, zIndex: 2 }} aria-hidden="true">
                  <line x1="8" y1="2" x2="8" y2="14" stroke="#c8874a" strokeWidth="1.5" />
                  <line x1="2" y1="8" x2="14" y2="8" stroke="#c8874a" strokeWidth="1.5" />
                </svg>
                {/* Corner accent — bottom right */}
                <svg width="16" height="16" viewBox="0 0 16 16" style={{ position: "absolute", bottom: -8, right: -8, zIndex: 2 }} aria-hidden="true">
                  <line x1="8" y1="2" x2="8" y2="14" stroke="#c8874a" strokeWidth="1.5" />
                  <line x1="2" y1="8" x2="14" y2="8" stroke="#c8874a" strokeWidth="1.5" />
                </svg>

                {/* Inner border */}
                <div
                  style={{
                    position: "relative",
                    border: "1px solid #c8874a",
                    overflow: "hidden",
                  }}
                >
                  <video
                    ref={videoRef}
                    src="/Íslendingur.mp4"
                    muted={muted}
                    playsInline
                    preload="metadata"
                    onEnded={() => { setPlaying(false); setProgress(0); }}
                    onTimeUpdate={() => {
                      const v = videoRef.current;
                      if (v && v.duration) setProgress(v.currentTime / v.duration);
                    }}
                    style={{
                      width: "100%",
                      aspectRatio: "16 / 9",
                      objectFit: "cover",
                      display: "block",
                      backgroundColor: "#000",
                    }}
                  />

                  {/* Custom play button overlay — shown when paused */}
                  {!playing && (
                    <button
                      onClick={() => {
                        const v = videoRef.current;
                        if (!v) return;
                        v.play().then(() => {
                          v.muted = false;
                          setMuted(false);
                        });
                        setPlaying(true);
                      }}
                      aria-label="Play video"
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        zIndex: 1,
                      }}
                    >
                      <div
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: "50%",
                          backgroundColor: "rgba(13,12,10,0.65)",
                          border: "1px solid rgba(200,135,74,0.4)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "background-color 250ms, border-color 250ms",
                        }}
                      >
                        <svg width="28" height="32" viewBox="0 0 28 32" fill="none" aria-hidden="true">
                          <path d="M6 4L24 16L6 28V4Z" fill="white" />
                        </svg>
                      </div>
                    </button>
                  )}

                  {/* Controls bar — visible while playing */}
                  {playing && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 14px",
                        background: "linear-gradient(to top, rgba(13,12,10,0.85), rgba(13,12,10,0))",
                        zIndex: 2,
                      }}
                    >
                      {/* Pause button */}
                      <button
                        onClick={() => {
                          const v = videoRef.current;
                          if (!v) return;
                          v.pause();
                          setPlaying(false);
                        }}
                        aria-label="Pause video"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 4,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <svg width="16" height="18" viewBox="0 0 16 18" fill="none" aria-hidden="true">
                          <rect x="1" y="1" width="4" height="16" rx="1" fill="white" />
                          <rect x="11" y="1" width="4" height="16" rx="1" fill="white" />
                        </svg>
                      </button>

                      {/* Progress bar */}
                      <div
                        role="progressbar"
                        aria-valuenow={Math.round(progress * 100)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Video progress"
                        onClick={(e) => {
                          const v = videoRef.current;
                          if (!v) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                          v.currentTime = pct * v.duration;
                          setProgress(pct);
                        }}
                        style={{
                          flex: 1,
                          height: 4,
                          backgroundColor: "rgba(255,255,255,0.15)",
                          borderRadius: 2,
                          cursor: "pointer",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            width: `${progress * 100}%`,
                            height: "100%",
                            backgroundColor: "#c8874a",
                            borderRadius: 2,
                            transition: "width 100ms linear",
                          }}
                        />
                      </div>

                      {/* Mute / Unmute button */}
                      <button
                        onClick={() => {
                          const v = videoRef.current;
                          if (!v) return;
                          v.muted = !v.muted;
                          setMuted(v.muted);
                        }}
                        aria-label={muted ? "Unmute" : "Mute"}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 4,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {muted ? (
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                            <path d="M2 6.5h3L9 3v12L5 11.5H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1z" fill="white" />
                            <line x1="12" y1="6" x2="17" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            <line x1="17" y1="6" x2="12" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                            <path d="M2 6.5h3L9 3v12L5 11.5H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1z" fill="white" />
                            <path d="M12.5 5.5a5 5 0 0 1 0 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M14.5 3.5a8 8 0 0 1 0 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
          </div>

          {/* Right column — voyage timeline (40%) */}
          <div
            style={{
              flex: "1 1 40%",
              minWidth: 260,
              backgroundColor: "#111010",
              display: "flex",
              flexDirection: "column",
              padding: "clamp(24px, 3vw, 40px)",
              overflowY: "auto",
            }}
          >
            {/* Section label */}
            <span
              className="font-text"
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(200,135,74,0.70)",
                marginBottom: 32,
              }}
            >
              THE VOYAGE &middot; AD 2000
            </span>

            {/* Timeline entries */}
            <div
              style={{
                position: "relative",
                paddingLeft: 32,
                flex: 1,
              }}
            >
              {/* Vertical line */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: 6,
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
                    paddingBottom: i < VOYAGE_WAYPOINTS.length - 1 ? 28 : 0,
                  }}
                >
                  {/* Amber dot */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: -26,
                      top: 6,
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      border: "2px solid #c8874a",
                      background: "#111010",
                    }}
                  />

                  <p
                    className="font-text"
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "#c8874a",
                      marginBottom: 4,
                    }}
                  >
                    {wp.date}
                  </p>

                  <h3
                    className="font-display"
                    style={{
                      fontSize: "clamp(18px, 2vw, 24px)",
                      fontWeight: 300,
                      color: "#ffffff",
                      marginBottom: 6,
                      lineHeight: 1.2,
                    }}
                  >
                    {wp.place}
                  </h3>

                  <p
                    className="font-text"
                    style={{
                      fontSize: 13,
                      lineHeight: 1.7,
                      color: "rgba(255,255,255,0.45)",
                    }}
                  >
                    {wp.text}
                  </p>
                </div>
              ))}
            </div>
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

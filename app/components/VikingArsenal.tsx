"use client";

import { useRef, useState, useEffect, useCallback } from "react";

/* ── Intersection Observer hook (single-fire) ── */
function useInView(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/* ── Shared CSS injected once ── */
const ARSENAL_CSS = `
@keyframes arsenalBreathe {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.02); }
}
@keyframes arsenalSway {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}
@keyframes arsenalGlow {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 0.5; }
}
@keyframes arsenalRimGlow {
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.4; }
}
@keyframes arsenalBlink {
  0%, 38%, 42%, 100% { transform: scaleY(1); }
  40% { transform: scaleY(0.05); }
}
@keyframes arsenalShake {
  0% { transform: translate(0,0); }
  15% { transform: translate(-2px,1px); }
  30% { transform: translate(2px,-1px); }
  45% { transform: translate(-1px,2px); }
  60% { transform: translate(1px,-2px); }
  75% { transform: translate(-2px,0); }
  100% { transform: translate(0,0); }
}
@keyframes arsenalGlint {
  0% { opacity: 0; transform: translateY(0); }
  30% { opacity: 1; }
  100% { opacity: 0; transform: translateY(60px); }
}
@keyframes arsenalDashDraw {
  to { stroke-dashoffset: 0; }
}
@keyframes arsenalDropBounce {
  0% { transform: translateY(-30px); opacity: 0; }
  60% { transform: translateY(3px); opacity: 1; }
  80% { transform: translateY(-2px); }
  100% { transform: translateY(0); }
}
@keyframes arsenalScaleIn {
  0% { transform: scale(0); }
  70% { transform: scale(1.08); }
  100% { transform: scale(1); }
}
@keyframes arsenalSwingLeft {
  0% { transform: rotate(-45deg); opacity: 0; }
  70% { transform: rotate(3deg); opacity: 1; }
  100% { transform: rotate(0deg); }
}
@keyframes arsenalSwingRight {
  0% { transform: rotate(45deg); opacity: 0; }
  70% { transform: rotate(-3deg); opacity: 1; }
  100% { transform: rotate(0deg); }
}
@keyframes arsenalClipReveal {
  0% { clip-path: inset(100% 0 0 0); }
  100% { clip-path: inset(0 0 0 0); }
}
@keyframes arsenalPunchIn {
  0% { transform: scale(0); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
@keyframes arsenalRipple {
  0% { r: 8; opacity: 0.6; }
  100% { r: 40; opacity: 0; }
}
@keyframes arsenalFadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
@keyframes arsenalImpactFlash {
  0% { fill: #e8e0d0; }
  30% { fill: #ffffff; }
  100% { fill: #e8e0d0; }
}
@keyframes arsenalPlankIn0 { 0% { transform: translate(-60px, 20px) rotate(-15deg); opacity: 0; } 70% { transform: translate(2px, 0) rotate(1deg); opacity: 1; } 100% { transform: translate(0,0) rotate(0deg); } }
@keyframes arsenalPlankIn1 { 0% { transform: translate(60px, -20px) rotate(12deg); opacity: 0; } 70% { transform: translate(-2px, 0) rotate(-1deg); opacity: 1; } 100% { transform: translate(0,0) rotate(0deg); } }
@keyframes arsenalPlankIn2 { 0% { transform: translate(-50px, 30px) rotate(-10deg); opacity: 0; } 70% { transform: translate(1px, 0) rotate(0.5deg); opacity: 1; } 100% { transform: translate(0,0) rotate(0deg); } }
@keyframes arsenalPlankIn3 { 0% { transform: translate(40px, -30px) rotate(18deg); opacity: 0; } 70% { transform: translate(-1px, 0) rotate(-0.5deg); opacity: 1; } 100% { transform: translate(0,0) rotate(0deg); } }
@keyframes arsenalPlankIn4 { 0% { transform: translate(-70px, 10px) rotate(-20deg); opacity: 0; } 70% { transform: translate(2px, 0) rotate(1deg); opacity: 1; } 100% { transform: translate(0,0) rotate(0deg); } }
@keyframes arsenalPlankIn5 { 0% { transform: translate(55px, 25px) rotate(14deg); opacity: 0; } 70% { transform: translate(-1px, 0) rotate(-0.5deg); opacity: 1; } 100% { transform: translate(0,0) rotate(0deg); } }
@keyframes arsenalPlankIn6 { 0% { transform: translate(-45px, -25px) rotate(-16deg); opacity: 0; } 70% { transform: translate(1px, 0) rotate(0.5deg); opacity: 1; } 100% { transform: translate(0,0) rotate(0deg); } }
@media (prefers-reduced-motion: reduce) {
  .arsenal-anim * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
`;

/* ── Card wrapper ── */
function ArsenalCard({
  label,
  descriptor,
  delay,
  triggered,
  onReplay,
  children,
}: {
  label: string;
  descriptor: string;
  delay: number;
  triggered: boolean;
  onReplay: () => void;
  children: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onReplay}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onReplay(); }}
      aria-label={`${label} animation — click to replay`}
      style={{
        flex: "1 1 220px",
        maxWidth: 280,
        cursor: "pointer",
        position: "relative",
        opacity: triggered ? 1 : 0,
        transform: triggered ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 600ms ease ${delay}ms, transform 600ms ease ${delay}ms`,
      }}
    >
      {/* Norse knotwork border */}
      <div
        style={{
          border: "1px solid rgba(200,135,74,0.2)",
          borderRadius: 2,
          padding: 2,
        }}
      >
        <div
          style={{
            border: "1px solid rgba(200,135,74,0.08)",
            borderRadius: 1,
            background: "rgba(255,255,255,0.015)",
            padding: "32px 16px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            overflow: "hidden",
            minHeight: 240,
            justifyContent: "center",
          }}
        >
          {/* Replay hint */}
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 10,
              fontSize: 10,
              color: "rgba(200,135,74,0.4)",
              opacity: hovered ? 1 : 0,
              transition: "opacity 200ms",
              fontFamily: "var(--font-text)",
            }}
          >
            &#8634; replay
          </span>

          {children}
        </div>
      </div>

      {/* Label */}
      <p
        style={{
          marginTop: 16,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "#c8874a",
          textAlign: "center",
          fontFamily: "var(--font-display)",
        }}
      >
        {label}
      </p>
      {/* Descriptor */}
      <p
        style={{
          marginTop: 6,
          fontSize: 12,
          lineHeight: 1.5,
          color: "rgba(255,255,255,0.35)",
          textAlign: "center",
          fontFamily: "var(--font-text)",
        }}
      >
        {descriptor}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ANIMATION 1 — THE VIKING
   ═══════════════════════════════════════════════════════ */
function VikingAnim({ play }: { play: boolean }) {
  return (
    <svg viewBox="0 0 120 180" width="120" height="180" className="arsenal-anim" aria-hidden="true">
      {/* Boots */}
      <g style={{ animation: play ? "arsenalDropBounce 400ms ease-out 0ms both" : "none", opacity: play ? 1 : 0 }}>
        <rect x="38" y="158" width="16" height="18" rx="2" fill="#e8e0d0" />
        <rect x="66" y="158" width="16" height="18" rx="2" fill="#e8e0d0" />
      </g>
      {/* Legs */}
      <g style={{ animation: play ? "arsenalClipReveal 350ms ease-out 150ms both" : "none", opacity: play ? 1 : 0 }}>
        <rect x="42" y="120" width="10" height="40" fill="#e8e0d0" />
        <rect x="68" y="120" width="10" height="40" fill="#e8e0d0" />
      </g>
      {/* Torso */}
      <g style={{ animation: play ? "arsenalScaleIn 400ms cubic-bezier(0.34,1.56,0.64,1) 300ms both" : "none", opacity: play ? 1 : 0, transformOrigin: "60px 100px" }}>
        <rect x="36" y="72" width="48" height="50" rx="3" fill="#e8e0d0" />
        {/* Belt */}
        <rect x="36" y="110" width="48" height="5" fill="#c8874a" opacity="0.6" />
      </g>
      {/* Left arm */}
      <g style={{ animation: play ? "arsenalSwingLeft 400ms ease-out 450ms both" : "none", opacity: play ? 1 : 0, transformOrigin: "36px 76px" }}>
        <rect x="22" y="76" width="14" height="38" rx="2" fill="#e8e0d0" />
      </g>
      {/* Right arm */}
      <g style={{ animation: play ? "arsenalSwingRight 400ms ease-out 450ms both" : "none", opacity: play ? 1 : 0, transformOrigin: "84px 76px" }}>
        <rect x="84" y="76" width="14" height="38" rx="2" fill="#e8e0d0" />
      </g>
      {/* Helmet */}
      <g style={{ animation: play ? "arsenalDropBounce 400ms ease-out 600ms both" : "none", opacity: play ? 1 : 0 }}>
        <path d="M40,62 L60,42 L80,62 Z" fill="#e8e0d0" />
        <rect x="40" y="58" width="40" height="16" rx="2" fill="#e8e0d0" />
        {/* Spectacle guard — Gjermundbu style, NO horns */}
        <path d="M44,66 Q50,72 56,66 M64,66 Q70,72 76,66" stroke="#0d0c0a" strokeWidth="2" fill="none" />
      </g>
      {/* Beard */}
      <g style={{ opacity: play ? 1 : 0 }}>
        <path
          d="M50,74 Q48,88 46,94 M60,74 Q60,90 60,98 M70,74 Q72,88 74,94"
          stroke="#e8e0d0"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          style={{
            strokeDasharray: 30,
            strokeDashoffset: play ? 0 : 30,
            transition: play ? "stroke-dashoffset 500ms ease 750ms" : "none",
          }}
        />
      </g>
      {/* Eyes */}
      <g style={{ animation: play ? "arsenalFadeIn 200ms ease 900ms both" : "none", opacity: play ? 1 : 0 }}>
        <g style={{ animation: play ? "arsenalBlink 4s ease-in-out 2s infinite" : "none", transformOrigin: "52px 65px" }}>
          <circle cx="52" cy="65" r="2" fill="#c8874a" />
        </g>
        <g style={{ animation: play ? "arsenalBlink 4s ease-in-out 2s infinite" : "none", transformOrigin: "68px 65px" }}>
          <circle cx="68" cy="65" r="2" fill="#c8874a" />
        </g>
      </g>
      {/* Idle breathing on torso */}
      {play && (
        <rect
          x="36" y="72" width="48" height="50" rx="3"
          fill="transparent"
          style={{ animation: "arsenalBreathe 3s ease-in-out 1.5s infinite", transformOrigin: "60px 97px" }}
        />
      )}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   ANIMATION 2 — THE AXE
   ═══════════════════════════════════════════════════════ */
function AxeAnim({ play }: { play: boolean }) {
  return (
    <svg viewBox="0 0 120 180" width="120" height="180" className="arsenal-anim" aria-hidden="true">
      <g style={{ animation: play ? "arsenalSway 4s ease-in-out 2s infinite" : "none", transformOrigin: "60px 170px" }}>
        {/* Handle — stroke draw upward */}
        <line
          x1="60" y1="170" x2="60" y2="50"
          stroke="#e8e0d0"
          strokeWidth="5"
          strokeLinecap="round"
          style={{
            strokeDasharray: 120,
            strokeDashoffset: play ? 0 : 120,
            transition: play ? "stroke-dashoffset 600ms ease 0ms" : "none",
          }}
        />
        {/* Handle grain texture */}
        {[60, 75, 90, 105, 120, 135, 150].map((y) => (
          <line
            key={y}
            x1="58" y1={y} x2="62" y2={y}
            stroke="rgba(10,10,10,0.3)"
            strokeWidth="0.5"
            style={{ opacity: play ? 1 : 0, transition: `opacity 200ms ease ${400}ms` }}
          />
        ))}
        {/* Axe head — left half */}
        <path
          d="M60,55 Q38,45 30,60 Q28,70 60,75"
          fill="#e8e0d0"
          style={{
            opacity: play ? 1 : 0,
            transform: play ? "translate(0,0) rotate(0deg)" : "translate(-30px,0) rotate(-15deg)",
            transition: play ? "all 400ms cubic-bezier(0.34,1.56,0.64,1) 400ms" : "none",
            transformOrigin: "60px 65px",
          }}
        />
        {/* Axe head — right half */}
        <path
          d="M60,55 Q82,50 85,60 Q86,68 60,75"
          fill="#e8e0d0"
          style={{
            opacity: play ? 1 : 0,
            transform: play ? "translate(0,0) rotate(0deg)" : "translate(30px,0) rotate(15deg)",
            transition: play ? "all 400ms cubic-bezier(0.34,1.56,0.64,1) 500ms" : "none",
            transformOrigin: "60px 65px",
          }}
        />
        {/* Knotwork etch on blade */}
        <path
          d="M40,62 Q45,58 50,62 Q55,66 50,70 Q45,66 40,70 Q35,74 40,62"
          stroke="#c8874a"
          strokeWidth="1"
          fill="none"
          style={{
            strokeDasharray: 60,
            strokeDashoffset: play ? 0 : 60,
            transition: play ? "stroke-dashoffset 600ms ease 700ms" : "none",
          }}
        />
        {/* Edge glint */}
        <line
          x1="32" y1="58" x2="30" y2="68"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{
            opacity: 0,
            animation: play ? "arsenalGlint 400ms ease 1400ms both" : "none",
          }}
        />
      </g>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   ANIMATION 3 — THE SWORD
   ═══════════════════════════════════════════════════════ */
function SwordAnim({ play }: { play: boolean }) {
  const bladeSegments = [
    { y: 28, h: 14 },
    { y: 42, h: 14 },
    { y: 56, h: 14 },
    { y: 70, h: 14 },
    { y: 84, h: 14 },
    { y: 98, h: 14 },
  ];

  return (
    <svg viewBox="0 0 120 180" width="120" height="180" className="arsenal-anim" aria-hidden="true">
      <defs>
        <filter id="swordGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Blade tip */}
      <polygon
        points="60,18 55,28 65,28"
        fill="#e8e0d0"
        style={{
          opacity: play ? 1 : 0,
          transition: play ? "opacity 200ms ease 0ms" : "none",
        }}
      />

      {/* Blade segments — build downward */}
      {bladeSegments.map((seg, i) => (
        <rect
          key={i}
          x="53" y={seg.y} width="14" height={seg.h}
          fill="#e8e0d0"
          style={{
            opacity: play ? 1 : 0,
            transform: play ? "scaleY(1)" : "scaleY(0)",
            transformOrigin: `60px ${seg.y}px`,
            transition: play ? `all 150ms ease ${i * 100}ms` : "none",
          }}
        />
      ))}

      {/* Blade edge glow */}
      <rect
        x="52" y="18" width="16" height="94" rx="1"
        fill="none"
        stroke="#c8874a"
        strokeWidth="0.5"
        filter="url(#swordGlow)"
        style={{
          opacity: play ? 0.3 : 0,
          animation: play ? "arsenalGlow 5s ease-in-out 1700ms infinite" : "none",
          transition: play ? "opacity 400ms ease 1700ms" : "none",
        }}
      />

      {/* Crossguard */}
      <rect
        x="30" y="112" width="60" height="6" rx="2"
        fill="#e8e0d0"
        style={{
          opacity: play ? 1 : 0,
          transform: play ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "60px 115px",
          transition: play ? "all 300ms cubic-bezier(0.34,1.56,0.64,1) 650ms" : "none",
        }}
      />

      {/* Grip wraps */}
      {Array.from({ length: 8 }).map((_, i) => (
        <line
          key={i}
          x1="54" y1={122 + i * 4} x2="66" y2={119 + i * 4}
          stroke="#e8e0d0"
          strokeWidth="1.5"
          style={{
            strokeDasharray: 16,
            strokeDashoffset: play ? 0 : 16,
            transition: play ? `stroke-dashoffset 80ms ease ${750 + i * 50}ms` : "none",
          }}
        />
      ))}

      {/* Pommel */}
      <circle
        cx="60" cy="158" r="7"
        fill="#e8e0d0"
        style={{
          opacity: play ? 1 : 0,
          transform: play ? "scale(1)" : "scale(1.3)",
          transformOrigin: "60px 158px",
          transition: play ? "all 200ms ease 1100ms" : "none",
        }}
      />

      {/* Rune inscription — Tiwaz (ᛏ) — the rune of Tyr, god of war and justice */}
      <path
        d="M60,50 L60,90 M52,52 L60,50 L68,52"
        stroke="#c8874a"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        style={{
          strokeDasharray: 60,
          strokeDashoffset: play ? 0 : 60,
          transition: play ? "stroke-dashoffset 500ms ease 1200ms" : "none",
        }}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   ANIMATION 4 — THE SHIELD
   ═══════════════════════════════════════════════════════ */
function ShieldAnim({ play }: { play: boolean }) {
  const plankWidth = 14;
  const planks = Array.from({ length: 7 }).map((_, i) => ({
    x: 25 + i * plankWidth,
    animName: `arsenalPlankIn${i}`,
    delay: i * 60,
  }));

  return (
    <svg viewBox="0 0 160 180" width="140" height="160" className="arsenal-anim" aria-hidden="true">
      <defs>
        <clipPath id="shieldCircle">
          <circle cx="80" cy="90" r="60" />
        </clipPath>
      </defs>

      {/* Shield impact shake wrapper */}
      <g style={{ animation: play ? "arsenalShake 150ms ease 2000ms 1" : "none" }}>
        {/* Planks — clipped to circle */}
        <g clipPath="url(#shieldCircle)">
          {planks.map((p, i) => (
            <rect
              key={i}
              x={p.x} y="30" width={plankWidth - 1} height="120"
              fill="#e8e0d0"
              stroke="rgba(10,10,10,0.15)"
              strokeWidth="0.5"
              style={{
                animation: play ? `${p.animName} 400ms ease-out ${p.delay}ms both` : "none",
                opacity: play ? 1 : 0,
              }}
            />
          ))}
        </g>

        {/* Rim — stroke draw */}
        <circle
          cx="80" cy="90" r="60"
          fill="none"
          stroke="#e8e0d0"
          strokeWidth="3"
          style={{
            strokeDasharray: 377,
            strokeDashoffset: play ? 0 : 377,
            transition: play ? "stroke-dashoffset 500ms ease 600ms" : "none",
          }}
        />

        {/* Iron boss */}
        <circle
          cx="80" cy="90" r="12"
          fill="#e8e0d0"
          style={{
            opacity: play ? 1 : 0,
            transform: play ? "scale(1)" : "scale(0)",
            transformOrigin: "80px 90px",
            transition: play ? "all 300ms cubic-bezier(0.34,1.56,0.64,1) 1100ms" : "none",
          }}
        />

        {/* Boss impact ripple */}
        <circle
          cx="80" cy="90" r="8"
          fill="none"
          stroke="rgba(200,135,74,0.4)"
          strokeWidth="1"
          style={{
            opacity: 0,
            animation: play ? "arsenalRipple 400ms ease-out 1100ms 1" : "none",
          }}
        />

        {/* Knotwork ring */}
        <circle
          cx="80" cy="90" r="45"
          fill="none"
          stroke="#c8874a"
          strokeWidth="1"
          style={{
            strokeDasharray: 283,
            strokeDashoffset: play ? 0 : 283,
            transition: play ? "stroke-dashoffset 700ms ease 1300ms" : "none",
          }}
        />
        {/* Second knotwork — interleaved wave */}
        <path
          d="M43,65 Q55,55 67,65 Q79,75 91,65 Q103,55 115,65"
          stroke="#c8874a"
          strokeWidth="0.8"
          fill="none"
          transform="translate(-27, 25)"
          style={{
            strokeDasharray: 100,
            strokeDashoffset: play ? 0 : 100,
            transition: play ? "stroke-dashoffset 700ms ease 1400ms" : "none",
          }}
        />

        {/* Impact flash on boss */}
        <circle
          cx="80" cy="90" r="12"
          fill="white"
          style={{
            opacity: 0,
            animation: play ? "arsenalImpactFlash 200ms ease 2000ms 1" : "none",
          }}
        />
      </g>

      {/* Rim glow idle */}
      {play && (
        <circle
          cx="80" cy="90" r="60"
          fill="none"
          stroke="#c8874a"
          strokeWidth="1"
          style={{ animation: "arsenalRimGlow 6s ease-in-out 2.5s infinite" }}
        />
      )}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function VikingArsenal() {
  const { ref, inView } = useInView(0.3);
  const [keys, setKeys] = useState([0, 0, 0, 0]);

  const replay = useCallback((index: number) => {
    setKeys((prev) => {
      const next = [...prev];
      next[index] = prev[index] + 1;
      return next;
    });
  }, []);

  /* Curator-verified descriptors */
  const items = [
    {
      label: "THE VIKING",
      descriptor: "All free Norse men carried weapons at all times.",
      render: (play: boolean) => <VikingAnim play={play} />,
    },
    {
      label: "THE AXE",
      descriptor: "Most common weapon \u2014 found even in female graves.",
      render: (play: boolean) => <AxeAnim play={play} />,
    },
    {
      label: "THE SWORD",
      descriptor: "Double-edged, 90\u00a0cm blade, based on the Roman spatha.",
      render: (play: boolean) => <SwordAnim play={play} />,
    },
    {
      label: "THE SHIELD",
      descriptor: "Linden or fir planks with a steel boss \u2014 their first defence.",
      render: (play: boolean) => <ShieldAnim play={play} />,
    },
  ];

  return (
    <section
      ref={ref}
      style={{
        backgroundColor: "#0d0c0a",
        padding: "clamp(80px, 10vh, 120px) 0",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <style>{ARSENAL_CSS}</style>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 32px", textAlign: "center" }}>
        {/* Section header */}
        <span
          className="font-text"
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#c8874a",
            display: "block",
            marginBottom: 20,
            opacity: inView ? 1 : 0,
            transition: "opacity 600ms ease",
          }}
        >
          FORGED IN THE NORTH
        </span>

        <h2
          className="font-display"
          style={{
            fontSize: "clamp(32px, 4.5vw, 56px)",
            fontWeight: 300,
            color: "#ffffff",
            lineHeight: 1.1,
            marginBottom: 16,
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(20px)",
            transition: "all 800ms ease 100ms",
          }}
        >
          They were more than raiders.
        </h2>

        <p
          className="font-text"
          style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.35)",
            marginBottom: 64,
            opacity: inView ? 1 : 0,
            transition: "opacity 600ms ease 250ms",
          }}
        >
          Every object tells a story. Every story ends here.
        </p>

        {/* Animation cards grid */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 32,
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          {items.map((item, i) => (
            <ArsenalCard
              key={`${item.label}-${keys[i]}`}
              label={item.label}
              descriptor={item.descriptor}
              delay={i * 200}
              triggered={inView}
              onReplay={() => replay(i)}
            >
              {item.render(inView)}
            </ArsenalCard>
          ))}
        </div>
      </div>
    </section>
  );
}

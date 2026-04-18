"use client";

import { useRef, useState, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════
   INTERSECTION OBSERVER — single-fire
   ═══════════════════════════════════════════════════════════ */
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
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/* ═══════════════════════════════════════════════════════════
   ANIM-READY HOOK — forces a from→to transition on mount
   Ensures transitions replay on key-remount (click-replay).
   ═══════════════════════════════════════════════════════════ */
function useAnimReady(play: boolean): boolean {
  const [r, setR] = useState(false);
  useEffect(() => {
    if (!play) {
      setR(false);
      return;
    }
    let alive = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (alive) setR(true);
      });
    });
    return () => {
      alive = false;
    };
  }, [play]);
  return play && r;
}

/* ═══════════════════════════════════════════════════════════
   TRANSITION HELPERS
   ═══════════════════════════════════════════════════════════ */
const BOUNCE = "cubic-bezier(0.34,1.56,0.64,1)";
const SMOOTH = "cubic-bezier(0.22,1,0.36,1)";

function tr(
  active: boolean,
  from: string,
  dur: number,
  delay: number,
  easing = BOUNCE,
): React.CSSProperties {
  return {
    opacity: active ? 1 : 0,
    transform: active ? "none" : from,
    transition: `opacity ${dur}ms ${easing} ${delay}ms, transform ${dur}ms ${easing} ${delay}ms`,
    willChange: "transform, opacity",
  };
}

function draw(
  active: boolean,
  len: number,
  dur: number,
  delay: number,
): React.CSSProperties {
  return {
    strokeDasharray: len,
    strokeDashoffset: active ? 0 : len,
    transition: `stroke-dashoffset ${dur}ms ease-in-out ${delay}ms`,
  };
}

/* ═══════════════════════════════════════════════════════════
   CSS KEYFRAMES — idle loops + multi-step effects
   ═══════════════════════════════════════════════════════════ */
const ARSENAL_CSS = `
/* Viking idle */
@keyframes vkBreathe{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.015)}}
@keyframes vkNod{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
@keyframes vkBlink{0%,38%,42%,100%{transform:translateY(-5px)}40%{transform:translateY(0)}}
@keyframes vkBlinkLo{0%,38%,42%,100%{transform:translateY(5px)}40%{transform:translateY(0)}}

/* Axe idle + effects */
@keyframes axSway{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
@keyframes axGlint{0%{opacity:0;transform:translateY(0)}30%{opacity:1}100%{opacity:0;transform:translateY(50px)}}
@keyframes axImpact{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}

/* Sword idle */
@keyframes swRunePulse{0%,100%{opacity:0.2}50%{opacity:0.7}}
@keyframes swGlowPulse{0%,100%{opacity:0.15}50%{opacity:0.4}}

/* Shield idle + effects */
@keyframes shRimGlow{0%,100%{opacity:0.4}50%{opacity:0.8}}
@keyframes shSway{0%,100%{transform:rotate(-0.4deg)}50%{transform:rotate(0.4deg)}}
@keyframes shShake{0%{transform:translateX(0)}30%{transform:translateX(4px)}60%{transform:translateX(-3px)}100%{transform:translateX(0)}}
@keyframes shBossFlash{0%,100%{fill:#5a6a7a}30%{fill:#ffffff}}
@keyframes shRipple{0%{transform:scale(1);opacity:0.9}100%{transform:scale(3.5);opacity:0}}

@media(prefers-reduced-motion:reduce){
  .arsenal-anim *{animation-duration:0.01ms!important;transition-duration:0.01ms!important}
}

/* Mobile: 2x2 grid, always-visible replay hint */
@media (max-width: 767px){
  .va-grid{grid-template-columns:repeat(2,1fr)!important;gap:14px!important}
  .va-replay-hint{opacity:0.5!important}
  .va-card .arsenal-card-inner{min-height:200px!important;padding:20px 10px 16px!important}
}
@media (hover:none){
  .va-replay-hint{opacity:0.5!important}
}
`;

/* ═══════════════════════════════════════════════════════════
   CARD WRAPPER
   ═══════════════════════════════════════════════════════════ */
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
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onReplay();
      }}
      aria-label={`${label} animation — click to replay`}
      className="va-card"
      style={{
        cursor: "pointer",
        position: "relative",
        opacity: triggered ? 1 : 0,
        transform: triggered ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 600ms ease ${delay}ms, transform 600ms ease ${delay}ms`,
      }}
    >
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
            minHeight: 280,
            justifyContent: "center",
          }}
        >
          <span
            className="va-replay-hint"
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

/* ═══════════════════════════════════════════════════════════
   ANIMATION 1 — THE VIKING
   viewBox 0 0 200 260
   Norse woodcut flat style. Gjermundbu helmet, NO horns.
   ═══════════════════════════════════════════════════════════ */
function VikingAnim({ play }: { play: boolean }) {
  const a = useAnimReady(play);
  const INK = "#2a1f0e";

  return (
    <svg
      viewBox="0 0 200 260"
      style={{ width: "100%", maxWidth: 200, height: "auto" }}
      className="arsenal-anim"
      aria-hidden="true"
    >
      <defs>
        <pattern id="chainmailPattern" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="2.5" fill="none" stroke="#9a9a8a" strokeWidth="0.8" opacity="0.6" />
          <circle cx="0" cy="3" r="2.5" fill="none" stroke="#9a9a8a" strokeWidth="0.8" opacity="0.6" />
          <circle cx="6" cy="3" r="2.5" fill="none" stroke="#9a9a8a" strokeWidth="0.8" opacity="0.6" />
        </pattern>
      </defs>

      {/* ── BOOTS ── delay 0ms */}
      <g id="vk-boots" style={tr(a, "translateY(60px)", 450, 0)}>
        {/* Left boot */}
        <path d="M72,248 L72,220 C70,215 65,212 62,210 C57,208 50,208 47,210 C42,212 38,218 38,225 L38,248 Z" fill="#8a5a2a" stroke={INK} strokeWidth="1.5" />
        <rect x="35" y="246" width="40" height="6" rx="2" fill="#5a3a18" stroke={INK} strokeWidth="1" />
        <rect x="36" y="218" width="38" height="8" rx="2" fill="#c8a878" stroke={INK} strokeWidth="1" />
        <rect x="50" y="230" width="10" height="4" rx="1" fill="#c8872a" />
        {[52, 57, 62, 67].map((x) => (
          <circle key={x} cx={x} cy="240" r="1.2" fill={INK} />
        ))}
        {/* Right boot */}
        <path d="M162,248 L162,220 C160,215 155,212 152,210 C147,208 140,208 137,210 C132,212 128,218 128,225 L128,248 Z" fill="#8a5a2a" stroke={INK} strokeWidth="1.5" />
        <rect x="125" y="246" width="40" height="6" rx="2" fill="#5a3a18" stroke={INK} strokeWidth="1" />
        <rect x="126" y="218" width="38" height="8" rx="2" fill="#c8a878" stroke={INK} strokeWidth="1" />
        <rect x="140" y="230" width="10" height="4" rx="1" fill="#c8872a" />
        {[142, 147, 152, 157].map((x) => (
          <circle key={x} cx={x} cy="240" r="1.2" fill={INK} />
        ))}
      </g>

      {/* ── LEGS ── delay 200ms */}
      <g id="vk-legs" style={tr(a, "translateY(40px)", 400, 200, "ease-out")}>
        {/* Trouser crotch */}
        <path d="M80,178 Q100,182 120,178 L120,200 Q100,204 80,200 Z" fill="#6a4a2a" stroke={INK} strokeWidth="1" />
        {/* Left thigh */}
        <rect x="52" y="178" width="28" height="46" rx="3" fill="#6a4a2a" stroke={INK} strokeWidth="1.5" />
        <ellipse cx="66" cy="196" rx="12" ry="8" fill="#8a6a3a" stroke={INK} strokeWidth="1" />
        <rect x="54" y="214" width="24" height="24" rx="2" fill="#7a5a3a" stroke={INK} strokeWidth="1" />
        {/* Left bindings */}
        {[217, 222, 227, 232, 237].map((y, i) => (
          <line key={y} x1={52 + (i % 2) * 3} y1={y} x2={78 - (i % 2) * 3} y2={y + 3} stroke="#c8a060" strokeWidth="1.5" strokeLinecap="round" />
        ))}
        {/* Right thigh */}
        <rect x="142" y="178" width="28" height="46" rx="3" fill="#6a4a2a" stroke={INK} strokeWidth="1.5" />
        <ellipse cx="156" cy="196" rx="12" ry="8" fill="#8a6a3a" stroke={INK} strokeWidth="1" />
        <rect x="144" y="214" width="24" height="24" rx="2" fill="#7a5a3a" stroke={INK} strokeWidth="1" />
        {/* Right bindings */}
        {[217, 222, 227, 232, 237].map((y, i) => (
          <line key={y} x1={144 + (i % 2) * 3} y1={y} x2={168 - (i % 2) * 3} y2={y + 3} stroke="#c8a060" strokeWidth="1.5" strokeLinecap="round" />
        ))}
      </g>

      {/* ── TORSO ── delay 400ms, scale from centre */}
      <g
        id="vk-torso"
        style={{
          ...tr(a, "scale(0)", 500, 400),
          transformOrigin: "100px 150px",
        }}
      >
        {/* Base tunic */}
        <rect x="52" y="110" width="96" height="80" rx="4" fill="#4a3a28" stroke={INK} strokeWidth="1.5" />
        {/* Chain mail overlay */}
        <rect x="52" y="110" width="96" height="80" rx="4" fill="url(#chainmailPattern)" opacity="0.7" />
        {/* V-collar */}
        <path d="M80,110 L100,130 L120,110" fill="#d4c8a8" stroke={INK} strokeWidth="1" />
        {/* Chest shading */}
        <path d="M52,110 L80,110 L80,176 L52,176 Z" fill="#3a2a18" opacity="0.2" />
        <path d="M120,110 L148,110 L148,176 L120,176 Z" fill="#d4c4a0" opacity="0.15" />
        {/* Mail hem */}
        <path d="M52,186 Q100,190 148,186" fill="none" stroke="#c8872a" strokeWidth="1.5" />
        {/* Belt */}
        <rect x="50" y="176" width="100" height="10" rx="2" fill="#3a2010" stroke={INK} strokeWidth="1.5" />
        <rect x="88" y="173" width="18" height="16" rx="2" fill="#c8872a" stroke="#8a5a10" strokeWidth="1" />
        <rect x="96" y="176" width="3" height="10" rx="1" fill="#8a5a10" />
      </g>

      {/* ── LEFT ARM ── delay 550ms */}
      <g id="vk-arm-left" style={tr(a, "translateX(40px)", 400, 550)}>
        <ellipse cx="48" cy="120" rx="16" ry="12" fill="#7a8a9a" stroke={INK} strokeWidth="1.5" />
        {/* Shoulder ridges */}
        <path d="M36,118 Q48,114 60,118" fill="none" stroke="#c8872a" strokeWidth="1" opacity="0.7" />
        <path d="M37,122 Q48,118 59,122" fill="none" stroke="#c8872a" strokeWidth="1" opacity="0.7" />
        <rect x="18" y="116" width="32" height="12" rx="4" fill="#6a4a2a" stroke={INK} strokeWidth="1.5" />
        <ellipse cx="20" cy="130" rx="9" ry="7" fill="#8a6a3a" stroke={INK} strokeWidth="1" />
        <rect x="6" y="126" width="22" height="12" rx="4" fill="#6a4a2a" stroke={INK} strokeWidth="1.5" />
        <rect x="4" y="124" width="26" height="16" rx="3" fill="none" stroke="#c8872a" strokeWidth="1.5" />
        <path d="M2,136 C0,130 4,122 10,120 L14,120 L14,142 L2,142 Z" fill="#e8dcc8" stroke={INK} strokeWidth="1.5" />
      </g>

      {/* ── RIGHT ARM ── delay 600ms */}
      <g id="vk-arm-right" style={tr(a, "translateX(-40px)", 400, 600)}>
        <ellipse cx="152" cy="120" rx="16" ry="12" fill="#7a8a9a" stroke={INK} strokeWidth="1.5" />
        <path d="M140,118 Q152,114 164,118" fill="none" stroke="#c8872a" strokeWidth="1" opacity="0.7" />
        <path d="M141,122 Q152,118 163,122" fill="none" stroke="#c8872a" strokeWidth="1" opacity="0.7" />
        <rect x="150" y="116" width="32" height="12" rx="4" fill="#6a4a2a" stroke={INK} strokeWidth="1.5" />
        <ellipse cx="180" cy="130" rx="9" ry="7" fill="#8a6a3a" stroke={INK} strokeWidth="1" />
        <rect x="172" y="126" width="22" height="12" rx="4" fill="#6a4a2a" stroke={INK} strokeWidth="1.5" />
        <rect x="170" y="124" width="26" height="16" rx="3" fill="none" stroke="#c8872a" strokeWidth="1.5" />
        <path d="M198,136 C200,130 196,122 190,120 L186,120 L186,142 L198,142 Z" fill="#e8dcc8" stroke={INK} strokeWidth="1.5" />
      </g>

      {/* ── NECK + TORC ── delay 700ms */}
      <g
        id="vk-neck"
        style={{
          ...tr(a, "scaleY(0)", 200, 700, "ease-out"),
          transformOrigin: "100px 110px",
        }}
      >
        <rect x="84" y="96" width="32" height="20" rx="4" fill="#d4b896" stroke={INK} strokeWidth="1.5" />
        <ellipse cx="100" cy="108" rx="20" ry="6" fill="none" stroke="#d4a843" strokeWidth="4" />
        <circle cx="80" cy="108" r="4" fill="#d4a843" />
        <circle cx="120" cy="108" r="4" fill="#d4a843" />
      </g>

      {/* ── HEAD (face, ears, features) ── delay 750ms */}
      <g id="vk-head" style={tr(a, "translateY(-20px)", 350, 750, SMOOTH)}>
        {/* Face */}
        <ellipse cx="100" cy="76" rx="30" ry="32" fill="#d4b896" stroke={INK} strokeWidth="1.5" />
        {/* Ears */}
        <ellipse cx="70" cy="76" rx="6" ry="10" fill="#d4b896" stroke={INK} strokeWidth="1.2" />
        <ellipse cx="130" cy="76" rx="6" ry="10" fill="#d4b896" stroke={INK} strokeWidth="1.2" />
        {/* Earring */}
        <circle cx="70" cy="84" r="3" fill="#d4a843" stroke="#8a6a10" strokeWidth="0.8" />
        {/* Eyebrows */}
        <path d="M84,62 Q90,58 96,62" fill="none" stroke="#3a2010" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M104,62 Q110,58 116,62" fill="none" stroke="#3a2010" strokeWidth="2.5" strokeLinecap="round" />
        {/* Nose */}
        <path d="M95,72 L93,84 C93,87 97,88 100,88 C103,88 107,87 107,84 L105,72 Z" fill="#c4a080" stroke={INK} strokeWidth="0.8" />
        {/* Mouth */}
        <path d="M90,94 Q100,91 110,94" fill="none" stroke={INK} strokeWidth="1.2" />
        <path d="M92,97 Q100,100 108,97" fill="#c09070" opacity="0.4" />
        {/* Scar */}
        <path d="M82,68 L88,78" fill="none" stroke="#a07858" strokeWidth="1.2" opacity="0.5" />

        {/* ── EYES (nested — lids animate independently) ── */}
        <g id="vk-eyes">
          {/* Whites */}
          <ellipse cx="89" cy="72" rx="8" ry="5" fill="#f0e8d8" />
          <ellipse cx="111" cy="72" rx="8" ry="5" fill="#f0e8d8" />
          {/* Irises — fade in at 1700ms */}
          <g style={{ opacity: a ? 1 : 0, transition: "opacity 300ms ease 1700ms" }}>
            <circle cx="89" cy="72" r="4" fill="#4a3a28" />
            <circle cx="111" cy="72" r="4" fill="#4a3a28" />
            <circle cx="89" cy="72" r="2" fill="#0a0804" />
            <circle cx="111" cy="72" r="2" fill="#0a0804" />
            {/* Cyan shine */}
            <circle cx="91" cy="70" r="1.5" fill="#00d4ff" opacity="0.9" />
            <circle cx="113" cy="70" r="1.5" fill="#00d4ff" opacity="0.9" />
            {/* Crow's feet */}
            <line x1="81" y1="70" x2="78" y2="68" stroke="#8a7a68" strokeWidth="0.7" opacity="0.4" />
            <line x1="81" y1="72" x2="77" y2="72" stroke="#8a7a68" strokeWidth="0.7" opacity="0.4" />
            <line x1="119" y1="70" x2="122" y2="68" stroke="#8a7a68" strokeWidth="0.7" opacity="0.4" />
            <line x1="119" y1="72" x2="123" y2="72" stroke="#8a7a68" strokeWidth="0.7" opacity="0.4" />
          </g>
          {/* Upper lids — slide open at 1600ms, then blink idle */}
          <rect
            x="81" y="67" width="16" height="5" rx="2" fill="#d4b896"
            style={{
              transform: a ? "translateY(-5px)" : "translateY(0)",
              transition: "transform 400ms ease 1600ms",
              animation: a ? "vkBlink 4.5s ease-in-out 2200ms infinite" : "none",
              willChange: "transform",
            }}
          />
          <rect
            x="103" y="67" width="16" height="5" rx="2" fill="#d4b896"
            style={{
              transform: a ? "translateY(-5px)" : "translateY(0)",
              transition: "transform 400ms ease 1600ms",
              animation: a ? "vkBlink 4.5s ease-in-out 2200ms infinite" : "none",
              willChange: "transform",
            }}
          />
          {/* Lower lids */}
          <rect
            x="81" y="72" width="16" height="5" rx="2" fill="#d4b896"
            style={{
              transform: a ? "translateY(5px)" : "translateY(0)",
              transition: "transform 400ms ease 1600ms",
              animation: a ? "vkBlinkLo 4.5s ease-in-out 2200ms infinite" : "none",
              willChange: "transform",
            }}
          />
          <rect
            x="103" y="72" width="16" height="5" rx="2" fill="#d4b896"
            style={{
              transform: a ? "translateY(5px)" : "translateY(0)",
              transition: "transform 400ms ease 1600ms",
              animation: a ? "vkBlinkLo 4.5s ease-in-out 2200ms infinite" : "none",
              willChange: "transform",
            }}
          />
        </g>
      </g>

      {/* ── BEARD ── delay 1100ms, fade + stroke draw */}
      <g id="vk-beard" style={{ opacity: a ? 1 : 0, transition: "opacity 500ms ease 1100ms" }}>
        {/* Centre */}
        <path
          d="M93,100 C90,116 88,134 88,148 C88,155 92,158 100,158 C108,158 112,155 112,148 C112,134 110,116 107,100 Z"
          fill="#3a2a18" stroke="#2a1a08" strokeWidth="1.2"
          style={draw(a, 160, 500, 1100)}
        />
        {/* Left wing */}
        <path d="M87,98 C78,110 70,128 70,144 C70,152 76,155 82,150 C86,146 88,134 90,118 Z" fill="#3a2a18" />
        {/* Right wing */}
        <path d="M113,98 C122,110 130,128 130,144 C130,152 124,155 118,150 C114,146 112,134 110,118 Z" fill="#3a2a18" />
        {/* Wisps */}
        <path d="M70,144 C64,152 60,158 58,164" fill="none" stroke="#2a1a08" strokeWidth="1.5" strokeLinecap="round" style={draw(a, 30, 400, 1400)} />
        <path d="M130,144 C136,152 140,158 142,164" fill="none" stroke="#2a1a08" strokeWidth="1.5" strokeLinecap="round" style={draw(a, 30, 400, 1400)} />
        {/* Mustache */}
        <path d="M88,100 C90,97 94,96 100,96 C106,96 110,97 112,100" fill="#3a2a18" stroke="#1a0a02" strokeWidth="0.8" />
        {/* Braid */}
        <path d="M98,130 C102,138 98,146 100,152" fill="none" stroke="#5a4a30" strokeWidth="3" strokeLinecap="round" style={draw(a, 30, 300, 1500)} />
        <circle cx="100" cy="155" r="3" fill="#d4a843" stroke="#8a6a10" strokeWidth="0.8" style={{ opacity: a ? 1 : 0, transition: "opacity 200ms ease 1600ms" }} />
      </g>

      {/* ── HELMET (Gjermundbu) ── delay 800ms, drops from above */}
      <g id="vk-helmet" style={tr(a, "translateY(-60px)", 550, 800, SMOOTH)}>
        {/* Dome */}
        <path d="M66,96 C66,58 80,40 100,38 C120,40 134,58 134,96 L130,100 L70,100 Z" fill="#8a9aaa" stroke={INK} strokeWidth="1.5" />
        {/* Ridge lines on dome */}
        <path d="M90,42 C88,60 88,80 88,96" fill="none" stroke="#6a7a8a" strokeWidth="1.5" opacity="0.7" />
        <path d="M100,38 L100,96" fill="none" stroke="#6a7a8a" strokeWidth="1.5" opacity="0.7" />
        <path d="M110,42 C112,60 112,80 112,96" fill="none" stroke="#6a7a8a" strokeWidth="1.5" opacity="0.7" />
        {/* Brow band */}
        <rect x="64" y="94" width="72" height="10" rx="2" fill="#7a8a9a" stroke={INK} strokeWidth="1.5" />
        <line x1="64" y1="95" x2="136" y2="95" stroke="#d4a843" strokeWidth="1.2" />
        {/* Rivets on brow band */}
        {[70, 82, 90, 98, 110, 122, 130].map((x) => (
          <circle key={x} cx={x} cy="99" r="2" fill="#5a6a7a" />
        ))}
        {/* Left spectacle guard */}
        <path d="M74,96 C74,88 79,83 86,83 C93,83 98,88 98,96 L98,100 L74,100 Z" fill="#6a7a8a" stroke={INK} strokeWidth="1.2" />
        {/* Right spectacle guard */}
        <path d="M102,96 C102,88 107,83 114,83 C121,83 126,88 126,96 L126,100 L102,100 Z" fill="#6a7a8a" stroke={INK} strokeWidth="1.2" />
        {/* Bridge */}
        <rect x="98" y="88" width="4" height="12" fill="#6a7a8a" />
        {/* Nasal bar */}
        <rect x="99" y="98" width="4" height="22" rx="1" fill="#7a8a9a" stroke={INK} strokeWidth="1" />
        {/* Aventail — 3 rows of chain rings */}
        {[106, 111, 116].map((y, row) => {
          const inset = row * 4;
          return Array.from({ length: 10 - row * 2 }, (_, i) => (
            <circle
              key={`av-${y}-${i}`}
              cx={72 + inset + i * ((72 - inset * 2) / (9 - row * 2))}
              cy={y}
              r="1.5"
              fill="none"
              stroke="#8a8a7a"
              strokeWidth="0.8"
            />
          ));
        })}
        {/* Boar silhouette on dome crown */}
        <path
          d="M88,60 C84,55 82,50 86,47 C88,45 92,47 94,52 C96,48 100,46 104,50 C108,54 106,58 102,60 L100,64 C100,60 96,58 92,60 Z"
          fill="none"
          stroke="#d4a843"
          strokeWidth="1.5"
        />
        {/* Wear marks */}
        <path d="M78,55 L84,62" fill="none" stroke="#9aaabb" strokeWidth="0.6" opacity="0.35" />
        <path d="M118,50 L122,58" fill="none" stroke="#9aaabb" strokeWidth="0.6" opacity="0.35" />
      </g>

      {/* ── IDLE OVERLAYS (render only after assembly) ── */}
      {a && (
        <>
          {/* Breathe on torso */}
          <rect
            x="52" y="110" width="96" height="80" rx="4"
            fill="transparent"
            style={{
              animation: "vkBreathe 3s ease-in-out 2.2s infinite",
              transformOrigin: "100px 150px",
            }}
          />
          {/* Nod on helmet */}
          <g style={{ animation: "vkNod 4.5s ease-in-out 2.2s infinite" }}>
            {/* invisible overlay — drives the transform on the helmet layer */}
          </g>
        </>
      )}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   ANIMATION 2 — THE AXE
   viewBox 0 0 200 260
   ═══════════════════════════════════════════════════════════ */
function AxeAnim({ play }: { play: boolean }) {
  const a = useAnimReady(play);
  const INK = "#1a1a1a";

  return (
    <svg
      viewBox="0 0 200 260"
      style={{ width: "100%", maxWidth: 200, height: "auto" }}
      className="arsenal-anim"
      aria-hidden="true"
    >
      {/* Idle sway wrapper */}
      <g style={{ animation: a ? "axSway 4s ease-in-out 2s infinite" : "none", transformOrigin: "100px 232px" }}>

        {/* ── HANDLE ── delay 0ms, stroke draw */}
        <g id="ax-handle" style={{ opacity: a ? 1 : 0, transition: "opacity 500ms ease-in-out 0ms" }}>
          {/* Shaft */}
          <path d="M97,58 C98,120 100,180 102,228" fill="none" stroke="#6b4c2a" strokeWidth="10" strokeLinecap="round" style={draw(a, 200, 500, 0)} />
          {/* Grain overlay */}
          <path d="M97,58 C98,120 100,180 102,228" fill="none" stroke="#4a3020" strokeWidth="8" opacity="0.3" style={draw(a, 200, 500, 50)} />
          {/* Grip cord — 8 diagonal strokes */}
          {[180, 185, 190, 195, 200, 205, 210, 215].map((y, i) => (
            <line
              key={y}
              x1="95" y1={y} x2="105" y2={y + 4}
              stroke="#d4a843" strokeWidth="2" strokeLinecap="round"
              style={{ opacity: a ? 1 : 0, transition: `opacity 80ms ease ${500 + i * 30}ms` }}
            />
          ))}
          {/* Butt cap */}
          <ellipse cx="100" cy="232" rx="7" ry="5" fill="#4a3020" stroke="#2a1f0e" strokeWidth="1" style={{ opacity: a ? 1 : 0, transition: "opacity 200ms ease 600ms" }} />
        </g>

        {/* ── HEAD UPPER ── delay 600ms */}
        <g
          id="ax-head-upper"
          style={{
            ...tr(a, "translateX(55px) rotate(10deg)", 380, 600),
            transformOrigin: "100px 90px",
            animation: a ? "axImpact 120ms ease 900ms 1" : "none",
          }}
        >
          <path d="M100,62 L100,125 C76,138 46,130 38,110 C30,92 44,70 62,64 Z" fill="#8a9aaa" stroke={INK} strokeWidth="2" />
          <rect x="100" y="60" width="16" height="50" rx="2" fill="#7a8a9a" stroke={INK} strokeWidth="1" />
          {/* Surface texture */}
          <line x1="50" y1="80" x2="96" y2="80" stroke="#6a7a8a" strokeWidth="0.6" opacity="0.4" />
          <line x1="44" y1="95" x2="96" y2="95" stroke="#6a7a8a" strokeWidth="0.6" opacity="0.4" />
          <line x1="48" y1="110" x2="96" y2="110" stroke="#6a7a8a" strokeWidth="0.6" opacity="0.4" />
        </g>

        {/* ── HEAD BEARD ── delay 700ms */}
        <g
          id="ax-head-beard"
          style={{
            ...tr(a, "translateX(45px) rotate(-5deg)", 380, 700),
            transformOrigin: "100px 130px",
            animation: a ? "axImpact 120ms ease 900ms 1" : "none",
          }}
        >
          <path d="M100,108 L100,155 C84,170 56,172 46,158 C38,146 44,132 58,126 Z" fill="#8a9aaa" stroke={INK} strokeWidth="2" />
        </g>

        {/* ── CUTTING EDGE ── delay 950ms, stroke draw */}
        <g id="ax-edge">
          <path d="M38,110 C30,128 36,148 46,158" fill="none" stroke="#c8d8e8" strokeWidth="3" strokeLinecap="round" style={draw(a, 80, 450, 950)} />
          <path d="M38,110 C30,128 36,148 46,158" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.5" style={draw(a, 80, 450, 1000)} />
        </g>

        {/* ── KNOTWORK ── delay 1400ms, stroke draw staggered */}
        <g id="ax-knotwork">
          <path d="M52,96 C48,88 56,82 64,88 C72,94 68,104 60,104 C52,104 48,96 56,92" fill="none" stroke="#d4a843" strokeWidth="1.3" style={draw(a, 80, 500, 1400)} />
          <path d="M64,88 C72,82 80,86 78,96 C76,104 66,106 62,100" fill="none" stroke="#d4a843" strokeWidth="1.3" style={draw(a, 70, 500, 1480)} />
          <path d="M56,92 C60,84 70,84 74,92" fill="none" stroke="#d4a843" strokeWidth="1" opacity="0.7" style={draw(a, 30, 300, 1560)} />
          {/* Tiwaz rune (ᛏ) */}
          <line x1="82" y1="100" x2="82" y2="118" stroke="#d4a843" strokeWidth="1.5" style={draw(a, 18, 200, 1600)} />
          <line x1="82" y1="103" x2="76" y2="109" stroke="#d4a843" strokeWidth="1.5" style={draw(a, 10, 200, 1650)} />
          <line x1="82" y1="103" x2="88" y2="109" stroke="#d4a843" strokeWidth="1.5" style={draw(a, 10, 200, 1700)} />
        </g>

        {/* ── GLINT ── delay 1800ms */}
        <line
          x1="38" y1="108" x2="42" y2="118"
          stroke="white" strokeWidth="2" strokeLinecap="round"
          style={{
            opacity: 0,
            animation: a ? "axGlint 280ms ease 1800ms 1" : "none",
          }}
        />
      </g>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   ANIMATION 3 — THE SWORD
   viewBox 0 0 200 260
   ═══════════════════════════════════════════════════════════ */
function SwordAnim({ play }: { play: boolean }) {
  const a = useAnimReady(play);

  const segs = [
    { x: 95, y: 24, w: 10, h: 20 },
    { x: 94, y: 44, w: 12, h: 20 },
    { x: 93, y: 64, w: 14, h: 20 },
    { x: 92, y: 84, w: 16, h: 20 },
    { x: 91, y: 104, w: 18, h: 20 },
    { x: 90, y: 124, w: 20, h: 18 },
  ];

  return (
    <svg
      viewBox="0 0 200 260"
      style={{ width: "100%", maxWidth: 200, height: "auto" }}
      className="arsenal-anim"
      aria-hidden="true"
    >
      {/* ── TIP ── delay 0ms */}
      <path
        d="M96,22 L100,12 L104,22 Z"
        fill="#b8c8d8" stroke="#7a8a98" strokeWidth="1"
        style={{
          ...tr(a, "scale(0)", 120, 0, "ease-out"),
          transformOrigin: "100px 22px",
        }}
      />

      {/* ── BLADE SEGMENTS ── staggered from 100ms */}
      {segs.map((s, i) => (
        <rect
          key={i}
          x={s.x} y={s.y} width={s.w} height={s.h}
          fill="#b8c8d8" stroke="#7a8a98" strokeWidth="0.8"
          style={tr(a, "translateY(-12px)", 200, 100 + i * 80)}
        />
      ))}

      {/* Pattern weld lines (visible after blade) */}
      <g style={{ opacity: a ? 1 : 0, transition: "opacity 400ms ease 700ms" }}>
        <line x1="98" y1="24" x2="98" y2="142" stroke="#7a8a98" strokeWidth="0.7" opacity="0.6" />
        <line x1="102" y1="24" x2="102" y2="142" stroke="#7a8a98" strokeWidth="0.7" opacity="0.6" />
        <path d="M96,24 C97,44 96,64 97,84 C96,104 97,124 96,142" fill="none" stroke="#8a9aa8" strokeWidth="0.5" opacity="0.4" />
        {/* Edge highlights */}
        <line x1="95" y1="24" x2="90" y2="142" stroke="#ddeeff" strokeWidth="1" opacity="0.7" />
        <line x1="105" y1="24" x2="110" y2="142" stroke="#ddeeff" strokeWidth="1" opacity="0.7" />
      </g>

      {/* ── CROSSGUARD ── delay 720ms */}
      <g id="sw-guard-left" style={tr(a, "translateX(38px)", 300, 720)}>
        <rect x="64" y="140" width="38" height="10" rx="3" fill="#d4a843" stroke="#8a6820" strokeWidth="1.2" />
        <ellipse cx="66" cy="145" rx="5" ry="6" fill="#c8972a" stroke="#8a6820" strokeWidth="1" />
        <line x1="64" y1="141" x2="100" y2="141" stroke="#e8c840" strokeWidth="0.8" />
      </g>
      <g id="sw-guard-right" style={tr(a, "translateX(-38px)", 300, 720)}>
        <rect x="98" y="140" width="38" height="10" rx="3" fill="#d4a843" stroke="#8a6820" strokeWidth="1.2" />
        <ellipse cx="134" cy="145" rx="5" ry="6" fill="#c8972a" stroke="#8a6820" strokeWidth="1" />
      </g>
      {/* Centre guard detail */}
      <rect x="96" y="141" width="8" height="8" rx="1" fill="#b88820" style={{ opacity: a ? 1 : 0, transition: "opacity 200ms ease 820ms" }} />

      {/* ── GRIP ── delay 980ms */}
      <g id="sw-grip" style={{ opacity: a ? 1 : 0, transition: "opacity 350ms ease 980ms" }}>
        <rect x="93" y="150" width="14" height="52" rx="3" fill="#4a3020" stroke="#2a1f0e" strokeWidth="1" />
        {/* Wrap lines */}
        {Array.from({ length: 10 }, (_, i) => (
          <line
            key={i}
            x1="93" y1={154 + i * 4.4} x2="107" y2={152 + i * 4.4}
            stroke="#8a6a4a" strokeWidth="2.5" opacity="0.8"
            style={draw(a, 16, 80, 980 + i * 30)}
          />
        ))}
        {/* Ferrules */}
        <rect x="91" y="150" width="18" height="5" rx="2" fill="#d4a843" />
        <rect x="91" y="197" width="18" height="5" rx="2" fill="#d4a843" />
      </g>

      {/* ── POMMEL ── delay 1250ms */}
      <g id="sw-pommel" style={tr(a, "translateY(28px)", 320, 1250)}>
        <path d="M82,202 Q82,218 100,220 Q118,218 118,202 L91,202 Z" fill="#d4a843" stroke="#8a6820" strokeWidth="1.2" />
        <path d="M88,202 Q100,196 112,202" fill="#c8972a" stroke="#8a6820" strokeWidth="1" />
        <line x1="82" y1="210" x2="118" y2="210" stroke="#8a6820" strokeWidth="0.8" />
      </g>

      {/* ── TIWAZ RUNE ── delay 1600ms, stroke draw */}
      <g id="sw-rune">
        <line x1="100" y1="54" x2="100" y2="74" stroke="#00d4ff" strokeWidth="1.8" strokeLinecap="round" style={draw(a, 20, 200, 1600)} />
        <line x1="100" y1="57" x2="93" y2="64" stroke="#00d4ff" strokeWidth="1.8" strokeLinecap="round" style={draw(a, 10, 150, 1700)} />
        <line x1="100" y1="57" x2="107" y2="64" stroke="#00d4ff" strokeWidth="1.8" strokeLinecap="round" style={draw(a, 10, 150, 1750)} />
      </g>

      {/* ── GLOW ── delay 2000ms + idle pulse */}
      <g id="sw-glow">
        <line
          x1="95" y1="24" x2="90" y2="142"
          stroke="#00d4ff" strokeWidth="2" opacity="0"
          style={{
            opacity: a ? 0.35 : 0,
            transition: "opacity 350ms ease 2000ms",
            animation: a ? "swGlowPulse 7s ease-in-out 2400ms infinite" : "none",
          }}
        />
        <line
          x1="105" y1="24" x2="110" y2="142"
          stroke="#00d4ff" strokeWidth="2" opacity="0"
          style={{
            opacity: a ? 0.35 : 0,
            transition: "opacity 350ms ease 2000ms",
            animation: a ? "swGlowPulse 7s ease-in-out 2400ms infinite" : "none",
          }}
        />
      </g>

      {/* Idle rune pulse */}
      {a && (
        <g style={{ animation: "swRunePulse 5s ease-in-out 2400ms infinite" }}>
          <line x1="100" y1="54" x2="100" y2="74" stroke="#00d4ff" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="100" y1="57" x2="93" y2="64" stroke="#00d4ff" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="100" y1="57" x2="107" y2="64" stroke="#00d4ff" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   ANIMATION 4 — THE SHIELD
   viewBox 0 0 280 260
   ═══════════════════════════════════════════════════════════ */
function ShieldAnim({ play }: { play: boolean }) {
  const a = useAnimReady(play);

  /* 7 planks — each with unique entry transform */
  const planks: { x: number; w: number; fill: string; from: string; delay: number }[] = [
    { x: 26, w: 28, fill: "#8a6a3a", from: "translateX(-120px) rotate(-8deg)", delay: 0 },
    { x: 56, w: 28, fill: "#7a5a2a", from: "translateX(-80px) rotate(-4deg)", delay: 45 },
    { x: 86, w: 28, fill: "#8a6a3a", from: "translateY(-60px) rotate(3deg)", delay: 90 },
    { x: 116, w: 48, fill: "#7a5a2a", from: "scale(0.15)", delay: 135 },
    { x: 166, w: 28, fill: "#8a6a3a", from: "translateY(-60px) rotate(-3deg)", delay: 180 },
    { x: 196, w: 28, fill: "#7a5a2a", from: "translateX(80px) rotate(4deg)", delay: 225 },
    { x: 226, w: 28, fill: "#8a6a3a", from: "translateX(120px) rotate(8deg)", delay: 270 },
  ];

  /* Rim rivets at 30° intervals */
  const rimRivets = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 * Math.PI) / 180;
    return { cx: 140 + 108 * Math.cos(angle), cy: 128 + 108 * Math.sin(angle) };
  });

  /* Boss rivets at 60° intervals */
  const bossRivets = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 * Math.PI) / 180;
    return { cx: 140 + 32 * Math.cos(angle), cy: 128 + 32 * Math.sin(angle) };
  });

  return (
    <svg
      viewBox="0 0 280 260"
      style={{ width: "100%", maxWidth: 240, height: "auto" }}
      className="arsenal-anim"
      aria-hidden="true"
    >
      <defs>
        <clipPath id="shieldClip">
          <circle cx="140" cy="128" r="108" />
        </clipPath>
      </defs>

      {/* Impact shake wrapper — fires at 2250ms */}
      <g style={{ animation: a ? "shShake 260ms ease 2250ms 1" : "none" }}>
        {/* Idle sway wrapper */}
        <g style={{ animation: a ? "shSway 8s ease-in-out 2.6s infinite" : "none", transformOrigin: "140px 128px" }}>

          {/* ── PLANKS ── clipped to circle, staggered entry */}
          <g clipPath="url(#shieldClip)">
            {planks.map((p, i) => (
              <g key={i}>
                <rect
                  x={p.x} y="20" width={p.w} height="216"
                  fill={p.fill}
                  style={{
                    ...tr(a, p.from, 420, p.delay),
                    transformOrigin: "140px 128px",
                  }}
                />
                {/* Wood grain — 3 horizontal lines per plank */}
                {[70, 100, 130].map((gy) => (
                  <line
                    key={gy}
                    x1={p.x + 2} y1={gy + (i % 3) * 8}
                    x2={p.x + p.w - 2} y2={gy + (i % 3) * 8}
                    stroke="#5a3a18" strokeWidth="0.4" opacity="0.35"
                    style={{ opacity: a ? 0.35 : 0, transition: `opacity 200ms ease ${p.delay + 300}ms` }}
                  />
                ))}
              </g>
            ))}
            {/* Plank gap lines */}
            {[54, 84, 114, 164, 194, 224].map((x) => (
              <line
                key={x}
                x1={x} y1="20" x2={x} y2="236"
                stroke="#3a2010" strokeWidth="1.5"
                style={{ opacity: a ? 1 : 0, transition: "opacity 300ms ease 350ms" }}
              />
            ))}
          </g>

          {/* ── RIM ── delay 450ms, stroke draw */}
          <g id="sh-rim">
            <circle
              cx="140" cy="128" r="108"
              fill="none" stroke="#5a6a7a" strokeWidth="10" strokeLinecap="round"
              style={draw(a, 679, 650, 450)}
            />
            <circle
              cx="140" cy="128" r="102"
              fill="none" stroke="#4a5a6a" strokeWidth="2" opacity="0.5"
              style={{ opacity: a ? 0.5 : 0, transition: "opacity 400ms ease 800ms" }}
            />
            {/* Rim highlight (idle glow) */}
            <circle
              cx="140" cy="128" r="108"
              fill="none" stroke="#9aaabb" strokeWidth="2"
              style={{
                opacity: a ? 0.4 : 0,
                transition: "opacity 400ms ease 900ms",
                animation: a ? "shRimGlow 6s ease-in-out 2.6s infinite" : "none",
              }}
            />
          </g>

          {/* ── HANDLE ── delay 680ms */}
          <g
            id="sh-handle"
            style={{
              opacity: a ? 1 : 0,
              transform: a ? "scaleX(1)" : "scaleX(0)",
              transformOrigin: "140px 128px",
              transition: "opacity 200ms ease 680ms, transform 200ms ease 680ms",
            }}
          >
            <rect x="88" y="125" width="104" height="6" rx="2" fill="#4a3020" stroke="#3a2010" strokeWidth="0.8" />
            <ellipse cx="140" cy="128" rx="8" ry="18" fill="#5a3a18" stroke="#3a2010" strokeWidth="0.8" />
          </g>

          {/* ── RIM RIVETS ── delay 750ms, staggered 30ms */}
          {rimRivets.map((rv, i) => (
            <circle
              key={i}
              cx={rv.cx} cy={rv.cy} r="3.5"
              fill="#8a9aaa" stroke="#5a6a7a" strokeWidth="0.8"
              style={{ opacity: a ? 1 : 0, transition: `opacity 100ms ease ${750 + i * 30}ms` }}
            />
          ))}

          {/* ── BOSS ── delay 1100ms, scale bounce */}
          <g
            id="sh-boss"
            style={{
              ...tr(a, "scale(0)", 380, 1100),
              transformOrigin: "140px 128px",
            }}
          >
            <circle cx="140" cy="128" r="28" fill="#5a6a7a" stroke="#4a5a6a" strokeWidth="2" />
            <circle cx="140" cy="128" r="22" fill="#6a7a8a" />
            <circle cx="140" cy="128" r="16" fill="#7a8a9a" />
            <ellipse cx="133" cy="121" rx="7" ry="5" fill="#b8c8d8" opacity="0.65" />
            <circle cx="140" cy="128" r="4" fill="#4a5a6a" />
          </g>

          {/* Boss flash overlay */}
          <circle
            cx="140" cy="128" r="28"
            style={{
              opacity: 0,
              animation: a ? "shBossFlash 160ms ease 2250ms 1" : "none",
            }}
          />

          {/* ── BOSS RIVETS ── delay 1300ms, staggered */}
          {bossRivets.map((rv, i) => (
            <circle
              key={i}
              cx={rv.cx} cy={rv.cy} r="3"
              fill="#8a9aaa" stroke="#5a6a7a" strokeWidth="0.8"
              style={{ opacity: a ? 1 : 0, transition: `opacity 100ms ease ${1300 + i * 33}ms` }}
            />
          ))}

          {/* ── KNOTWORK ── delay 1520ms, stroke draw */}
          <g id="sh-knotwork">
            {/* Dragon body coiling around boss */}
            <path
              d="M140,58 C165,62 178,78 175,100 C172,122 158,132 140,130 C122,128 108,118 106,100 C104,82 118,68 140,68 C155,68 166,80 164,98 C162,114 150,124 136,120"
              fill="none" stroke="#d4a843" strokeWidth="2.2"
              style={draw(a, 340, 720, 1520)}
            />
            {/* Dragon head */}
            <path
              d="M140,58 C145,52 152,50 156,55 C158,60 152,64 146,62"
              fill="#d4a843"
              style={{ opacity: a ? 1 : 0, transition: "opacity 200ms ease 2100ms" }}
            />
            <circle cx="150" cy="54" r="2" fill="#1a0e05" style={{ opacity: a ? 1 : 0, transition: "opacity 200ms ease 2150ms" }} />
            {/* Dragon tail */}
            <path
              d="M136,120 C130,126 126,132 128,138"
              fill="none" stroke="#d4a843" strokeWidth="1.5"
              style={draw(a, 25, 300, 2100)}
            />
            {/* Secondary dashed ring */}
            <circle
              cx="140" cy="128" r="85"
              fill="none" stroke="#d4a843" strokeWidth="1"
              strokeDasharray="6 8" opacity="0.5"
              style={{ opacity: a ? 0.5 : 0, transition: "opacity 400ms ease 2000ms" }}
            />
          </g>

          {/* ── IMPACT RIPPLE ── delay 2250ms */}
          <circle
            cx="140" cy="128" r="26"
            fill="none" stroke="#ffffff" strokeWidth="2.5"
            style={{
              opacity: 0,
              transformOrigin: "140px 128px",
              animation: a ? "shRipple 480ms ease-out 2250ms 1" : "none",
            }}
          />

        </g>
      </g>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
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

  const items = [
    {
      label: "THE VIKING",
      descriptor:
        "Farmer, trader, warrior \u2014 all free Norse carried weapons by law.",
      render: (play: boolean) => <VikingAnim play={play} />,
    },
    {
      label: "THE AXE",
      descriptor:
        "Most common weapon \u2014 found in male and female graves alike.",
      render: (play: boolean) => <AxeAnim play={play} />,
    },
    {
      label: "THE SWORD",
      descriptor:
        "Double-edged, pattern-welded \u2014 a status symbol worth a farm.",
      render: (play: boolean) => <SwordAnim play={play} />,
    },
    {
      label: "THE SHIELD",
      descriptor:
        "Linden-wood planks, iron boss \u2014 a warrior\u2019s first line of defence.",
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

      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "0 32px",
          textAlign: "center",
        }}
      >
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
            fontWeight: 400,
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

        <div
          className="va-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 24,
            justifyContent: "center",
            alignItems: "flex-start",
            maxWidth: 1200,
            margin: "0 auto",
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

"use client";

import { useRef, useState, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════
   SCROLL PROGRESS HOOK
   Tracks how far the user has scrolled through a tall section.
   Returns 0→1 mapped to the section's scrollable range.
   ═══════════════════════════════════════════════════════════ */
function useScrollProgress(containerRef: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const scrollable = el.offsetHeight - window.innerHeight;
        if (scrollable <= 0) {
          setProgress(0);
          ticking = false;
          return;
        }
        setProgress(Math.max(0, Math.min(1, -rect.top / scrollable)));
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [containerRef]);

  return progress;
}

/* ═══════════════════════════════════════════════════════════
   COLOUR TOKENS — illustration palette
   ═══════════════════════════════════════════════════════════ */
const C = {
  skin: "#e8dcc8",
  ink: "#1a0e05",
  gold: "#c8872a",
  cyan: "#00d4ff",
  leather: "#8a5a2a",
  leatherDark: "#5a3a18",
  leatherLight: "#c8a878",
  iron: "#7a8a9a",
  ironLight: "#aabbcc",
  chainmail: "#9a9a8a",
  wool: "#4a3a28",
  woolLight: "#6a4a2a",
  linen: "#d4c8a8",
  accent: "#c8874a",
} as const;

/* ═══════════════════════════════════════════════════════════
   CURATOR-VERIFIED FACTS — one per assembly step
   ═══════════════════════════════════════════════════════════ */
const FACTS = [
  {
    tag: "THE JOURNEY",
    title: "11,000 km on foot, horse, and open sea.",
    body: "Vikings travelled over 11,000\u00a0km from Scandinavia — on foot, by horse, by sea. These boots carried them across three continents, from Newfoundland to Baghdad.",
  },
  {
    tag: "LEG WRAPPINGS",
    title: "Every binding told a story.",
    body: "Norse leg wrappings — v\u00edndingar — weren\u2019t mere fashion. Tightly wound bindings protected against brush, cold, and sword cuts. The winding pattern indicated your homeland.",
  },
  {
    tag: "CHAIN MAIL",
    title: "30,000 rings. Six months. One shirt.",
    body: "A single hauberk required 30,000 individually riveted iron rings and six months of a smith\u2019s labour. Only jarls and successful raiders could afford one.",
  },
  {
    tag: "THE SHIELD WALL",
    title: "Each man protected the man beside him.",
    body: "The shield wall — skjaldborg — was the Vikings\u2019 deadliest formation. Warriors interlocked their round shields, each 80\u201390\u00a0cm across, creating an impenetrable barrier of wood and iron.",
  },
  {
    tag: "THE AXE",
    title: "The weapon that defined an age.",
    body: "While swords cost as much as sixteen milking cows, the axe was the everyman\u2019s weapon. A bearded axe could hook a shield rim, catch a sword blade, and fell a tree the same afternoon.",
  },
  {
    tag: "STATUS & RANK",
    title: "Your cloak declared your rank at a glance.",
    body: "A jarl\u2019s cloak was fixed with a penannular brooch of silver or gold — a walking statement of wealth and allegiance. The quality of your fabric told the world exactly who you were.",
  },
  {
    tag: "THE HELMET",
    title: "The horns are a lie.",
    body: "The horned helmet is pure fiction — invented by costume designers in the 1870s. Only one complete Viking helmet survives: the Gjermundbu, found in a warrior\u2019s grave in Norway. Plain iron. No horns.",
  },
  {
    tag: "APPEARANCE",
    title: "Combs are their most common artifact.",
    body: "Arab traveller Ahmad ibn Fadlan described the Norse as \u2018tall as date palms.\u2019 Combs are the single most common Viking artifact found — they bathed weekly, a shocking frequency in medieval Europe.",
  },
  {
    tag: "THE RUNES",
    title: "They carved their world into everything.",
    body: "The Younger Futhark\u2019s 16 characters appear on swords, combs, and churchyard stones alike. Vikings recorded laws, memorials, love notes, and insults in an alphabet older than England.",
  },
  {
    tag: "V\u00cdKINGAHEIMAR",
    title: "This is not a myth. This is who they were.",
    body: "Sailors, settlers, traders, poets — and yes, warriors. The ship that proved the sagas true is docked at V\u00edkingaheimar. You can board her.",
  },
];

/* ═══════════════════════════════════════════════════════════
   ANIMATION HELPERS
   ═══════════════════════════════════════════════════════════ */
type EntryKind =
  | "rise"
  | "drop"
  | "scale"
  | "slideLeft"
  | "slideRight"
  | "fade";

const EASE_BOUNCE = "cubic-bezier(0.34,1.56,0.64,1)";
const EASE_SMOOTH = "cubic-bezier(0.25,0.1,0.25,1)";

function partStyle(
  active: boolean,
  entry: EntryKind,
  delay = 0,
  duration = 600,
): React.CSSProperties {
  const hidden: Record<EntryKind, string> = {
    rise: "translateY(80px)",
    drop: "translateY(-60px)",
    scale: "scale(0)",
    slideLeft: "translateX(-80px)",
    slideRight: "translateX(80px)",
    fade: "none",
  };
  return {
    opacity: active ? 1 : 0,
    transform: active ? "none" : hidden[entry],
    transition: `opacity ${duration}ms ${EASE_BOUNCE} ${delay}ms, transform ${duration}ms ${EASE_BOUNCE} ${delay}ms`,
    transformOrigin: entry === "scale" ? "150px 290px" : undefined,
  };
}

/* ═══════════════════════════════════════════════════════════
   VIKING SVG — museum-quality Norse warrior illustration
   viewBox 0 0 300 520

   Anatomy reference points:
     Helmet crown  y ≈ 88       Shoulders y ≈ 218
     Belt          y ≈ 348      Boot soles y ≈ 508

   10 groups, each revealed on its scroll step.
   ═══════════════════════════════════════════════════════════ */
function VikingSVG({ step }: { step: number }) {
  return (
    <svg
      viewBox="0 0 300 520"
      style={{
        width: "100%",
        height: "auto",
        maxHeight: "85vh",
        display: "block",
        margin: "0 auto",
      }}
      aria-label="Viking warrior assembling piece by piece as you scroll"
      role="img"
    >
      <defs>
        {/* Chain mail — interlocking ring pattern */}
        <pattern
          id="sv-chainmail"
          width="8"
          height="7"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="4" cy="3.5" r="3" fill="none" stroke={C.chainmail} strokeWidth="0.8" opacity="0.5" />
          <circle cx="0" cy="0" r="3" fill="none" stroke={C.chainmail} strokeWidth="0.8" opacity="0.5" />
          <circle cx="8" cy="0" r="3" fill="none" stroke={C.chainmail} strokeWidth="0.8" opacity="0.5" />
          <circle cx="0" cy="7" r="3" fill="none" stroke={C.chainmail} strokeWidth="0.8" opacity="0.5" />
          <circle cx="8" cy="7" r="3" fill="none" stroke={C.chainmail} strokeWidth="0.8" opacity="0.5" />
        </pattern>

        {/* Shield body clip */}
        <clipPath id="sv-shieldClip">
          <circle cx="35" cy="310" r="55" />
        </clipPath>
      </defs>

      {/* ────────────────────────────────────────────────────
          STEP 0 — BOOTS
          ──────────────────────────────────────────────────── */}
      <g id="sv-boots">
        {/* Left boot */}
        <g style={partStyle(step >= 0, "rise", 0)}>
          <path
            d="M 82,508 L 82,460 C 82,450 80,444 83,437 C 86,430 92,425 98,423 C 104,421 110,422 114,425 C 118,430 120,438 120,448 L 120,508 Z"
            fill={C.leather} stroke={C.ink} strokeWidth="2" strokeLinejoin="round"
          />
          {/* Sole */}
          <rect x="78" y="506" width="46" height="8" rx="3" fill={C.leatherDark} stroke={C.ink} strokeWidth="1.5" />
          {/* Boot cuff fold */}
          <path d="M 84,438 Q 100,432 118,438" fill="none" stroke={C.leatherLight} strokeWidth="3" strokeLinecap="round" />
          {/* Stitching */}
          {[445, 453, 461, 469, 477, 485, 493].map((y) => (
            <line key={y} x1="98" y1={y} x2="104" y2={y} stroke={C.leatherDark} strokeWidth="1" opacity="0.6" />
          ))}
          {/* Buckle strap */}
          <rect x="87" y="455" width="28" height="5" rx="1" fill={C.leatherDark} stroke={C.ink} strokeWidth="0.8" />
          <rect x="98" y="453" width="8" height="9" rx="1.5" fill={C.gold} stroke={C.ink} strokeWidth="0.8" />
          {/* Lace eyelets */}
          {[440, 448, 456, 464].map((y) => (
            <circle key={y} cx="100" cy={y} r="1.5" fill={C.ink} />
          ))}
        </g>

        {/* Right boot — mirror */}
        <g style={partStyle(step >= 0, "rise", 80)}>
          <path
            d="M 180,508 L 180,460 C 180,450 178,444 181,437 C 184,430 190,425 196,423 C 202,421 208,422 212,425 C 216,430 218,438 218,448 L 218,508 Z"
            fill={C.leather} stroke={C.ink} strokeWidth="2" strokeLinejoin="round"
          />
          <rect x="176" y="506" width="46" height="8" rx="3" fill={C.leatherDark} stroke={C.ink} strokeWidth="1.5" />
          <path d="M 182,438 Q 198,432 216,438" fill="none" stroke={C.leatherLight} strokeWidth="3" strokeLinecap="round" />
          {[445, 453, 461, 469, 477, 485, 493].map((y) => (
            <line key={y} x1="196" y1={y} x2="202" y2={y} stroke={C.leatherDark} strokeWidth="1" opacity="0.6" />
          ))}
          <rect x="185" y="455" width="28" height="5" rx="1" fill={C.leatherDark} stroke={C.ink} strokeWidth="0.8" />
          <rect x="196" y="453" width="8" height="9" rx="1.5" fill={C.gold} stroke={C.ink} strokeWidth="0.8" />
          {[440, 448, 456, 464].map((y) => (
            <circle key={y} cx="198" cy={y} r="1.5" fill={C.ink} />
          ))}
        </g>
      </g>

      {/* ────────────────────────────────────────────────────
          STEP 1 — LEGS
          ──────────────────────────────────────────────────── */}
      <g id="sv-legs" style={partStyle(step >= 1, "rise", 0)}>
        {/* Trouser seat / crotch connecting both legs */}
        <path
          d="M 88,358 L 88,375 Q 105,395 150,398 Q 195,395 212,375 L 212,358 Z"
          fill={C.woolLight} stroke={C.ink} strokeWidth="1.5"
        />

        {/* Left thigh */}
        <rect x="84" y="375" width="38" height="58" rx="6" fill={C.woolLight} stroke={C.ink} strokeWidth="1.5" />
        {/* Left knee pad */}
        <ellipse cx="103" cy="408" rx="16" ry="11" fill="#8a6a3a" stroke={C.ink} strokeWidth="1.2" />
        {/* Left shin */}
        <rect x="86" y="416" width="34" height="28" rx="4" fill="#7a5a3a" stroke={C.ink} strokeWidth="1" />
        {/* Left leg bindings (víndingar / puttees) — 6 wound strips */}
        {[418, 424, 430, 436, 442].map((y, i) => (
          <path
            key={y}
            d={`M ${88 + (i % 2) * 5},${y} L ${116 - (i % 2) * 5},${y + 4}`}
            fill="none" stroke="#c8a060" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"
          />
        ))}

        {/* Right thigh */}
        <rect x="178" y="375" width="38" height="58" rx="6" fill={C.woolLight} stroke={C.ink} strokeWidth="1.5" />
        {/* Right knee pad */}
        <ellipse cx="197" cy="408" rx="16" ry="11" fill="#8a6a3a" stroke={C.ink} strokeWidth="1.2" />
        {/* Right shin */}
        <rect x="180" y="416" width="34" height="28" rx="4" fill="#7a5a3a" stroke={C.ink} strokeWidth="1" />
        {/* Right leg bindings */}
        {[418, 424, 430, 436, 442].map((y, i) => (
          <path
            key={y}
            d={`M ${182 + (i % 2) * 5},${y} L ${210 - (i % 2) * 5},${y + 4}`}
            fill="none" stroke="#c8a060" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"
          />
        ))}
      </g>

      {/* ────────────────────────────────────────────────────
          STEP 2 — TORSO  (hauberk + belt)
          ──────────────────────────────────────────────────── */}
      <g id="sv-torso" style={partStyle(step >= 2, "scale", 0)}>
        {/* Under-tunic base layer */}
        <path
          d="M 78,215 C 78,210 85,205 100,205 L 200,205 C 215,205 222,210 222,215 L 222,360 C 222,365 215,370 200,370 L 100,370 C 85,370 78,365 78,360 Z"
          fill={C.wool} stroke={C.ink} strokeWidth="1.5"
        />

        {/* Chain mail hauberk overlay */}
        <rect x="78" y="205" width="144" height="155" rx="8" fill="url(#sv-chainmail)" opacity="0.7" />
        <rect x="78" y="205" width="144" height="155" rx="8" fill="none" stroke={C.ink} strokeWidth="2" />

        {/* Hauberk hem — row of decorative interlocked loops */}
        <path
          d="M 82,358 Q 86,365 90,358 Q 94,365 98,358 Q 102,365 106,358 Q 110,365 114,358 Q 118,365 122,358 Q 126,365 130,358 Q 134,365 138,358 Q 142,365 146,358 Q 150,365 154,358 Q 158,365 162,358 Q 166,365 170,358 Q 174,365 178,358 Q 182,365 186,358 Q 190,365 194,358 Q 198,365 202,358 Q 206,365 210,358 Q 214,365 218,358"
          fill="none" stroke={C.gold} strokeWidth="1.5" opacity="0.65"
        />

        {/* V-collar showing linen undershirt */}
        <path d="M 118,205 L 150,242 L 182,205" fill={C.linen} stroke={C.ink} strokeWidth="1.2" />

        {/* Chest shading for three-dimensional depth */}
        <path d="M 84,215 Q 110,222 118,285 L 84,285 Z" fill="#3a2a18" opacity="0.2" />
        <path d="M 216,215 Q 190,222 182,285 L 216,285 Z" fill={C.linen} opacity="0.08" />

        {/* Belt system — slides up from below */}
        <g
          style={{
            opacity: step >= 2 ? 1 : 0,
            transform: step >= 2 ? "none" : "translateY(20px)",
            transition: `all 450ms ${EASE_BOUNCE} 350ms`,
          }}
        >
          {/* Main belt */}
          <rect x="74" y="348" width="152" height="18" rx="3" fill="#3a2010" stroke={C.ink} strokeWidth="2" />
          {/* Belt buckle — detailed rectangle */}
          <rect x="137" y="345" width="26" height="24" rx="2.5" fill={C.gold} stroke="#8a5a10" strokeWidth="1.5" />
          <rect x="148" y="349" width="4" height="16" rx="1" fill="#8a5a10" />
          {/* Belt pouch (left) */}
          <path
            d="M 108,366 L 104,390 Q 108,395 118,395 Q 128,395 132,390 L 128,366"
            fill={C.leatherDark} stroke={C.ink} strokeWidth="1"
          />
          <line x1="108" y1="366" x2="128" y2="366" stroke={C.ink} strokeWidth="1" />
          {/* Sword frog (scabbard mount on right) */}
          <rect x="175" y="365" width="10" height="18" rx="2" fill={C.leatherDark} stroke={C.ink} strokeWidth="0.8" />
          <rect x="177" y="370" width="6" height="4" rx="1" fill={C.leather} />
        </g>
      </g>

      {/* ────────────────────────────────────────────────────
          STEP 3 — LEFT ARM + SHIELD
          ──────────────────────────────────────────────────── */}
      <g id="sv-arm-shield" style={partStyle(step >= 3, "slideLeft", 0)}>
        {/* Shoulder pauldron (iron) */}
        <ellipse cx="72" cy="220" rx="22" ry="15" fill={C.iron} stroke={C.ink} strokeWidth="1.5" />
        {/* Three gold ridges across pauldron */}
        <line x1="56" y1="217" x2="88" y2="217" stroke={C.gold} strokeWidth="1" opacity="0.5" />
        <line x1="58" y1="222" x2="86" y2="222" stroke={C.gold} strokeWidth="1" opacity="0.5" />
        <line x1="60" y1="227" x2="84" y2="227" stroke={C.gold} strokeWidth="1" opacity="0.5" />

        {/* Upper arm */}
        <rect x="42" y="232" width="32" height="38" rx="7" fill={C.woolLight} stroke={C.ink} strokeWidth="1.5" />
        {/* Elbow */}
        <ellipse cx="48" cy="274" rx="14" ry="11" fill="#8a6a3a" stroke={C.ink} strokeWidth="1.2" />
        {/* Forearm */}
        <rect x="30" y="278" width="28" height="28" rx="5" fill={C.woolLight} stroke={C.ink} strokeWidth="1" />
        {/* Vambrace (arm guard) */}
        <rect x="28" y="276" width="32" height="32" rx="4" fill="none" stroke={C.gold} strokeWidth="2.2" />
        {/* Gauntlet / fist gripping shield handle */}
        <path
          d="M 24,302 C 20,294 22,284 30,280 L 38,280 L 38,308 L 24,308 Z"
          fill={C.skin} stroke={C.ink} strokeWidth="1.5"
        />
        {/* Finger line detail */}
        <line x1="28" y1="290" x2="36" y2="290" stroke={C.ink} strokeWidth="0.6" opacity="0.4" />
        <line x1="27" y1="296" x2="36" y2="296" stroke={C.ink} strokeWidth="0.6" opacity="0.4" />

        {/* ── SHIELD ── */}
        <g>
          {/* Shield planks — 7 vertical planks clipped to circle */}
          <g clipPath="url(#sv-shieldClip)">
            {[-42, -28, -14, 0, 14, 28, 42].map((dx, i) => (
              <rect
                key={i}
                x={35 + dx - 7}
                y="252"
                width="14"
                height="116"
                fill={i % 2 === 0 ? "#8a6a3a" : "#7a5a2a"}
              />
            ))}
            {/* Plank gap lines */}
            {[-35, -21, -7, 7, 21, 35].map((dx) => (
              <line
                key={dx}
                x1={35 + dx} y1="255" x2={35 + dx} y2="365"
                stroke="#3a2010" strokeWidth="1" opacity="0.6"
              />
            ))}
            {/* Wood grain — fine horizontal texture */}
            {Array.from({ length: 18 }, (_, i) => 258 + i * 6).map((y) => (
              <line
                key={y}
                x1="-22" y1={y} x2="92" y2={y}
                stroke="#6a4a1a" strokeWidth="0.4" opacity="0.25"
              />
            ))}
          </g>

          {/* Iron rim */}
          <circle cx="35" cy="310" r="55" fill="none" stroke={C.iron} strokeWidth="8" />
          <circle cx="35" cy="310" r="55" fill="none" stroke={C.ironLight} strokeWidth="1.5" opacity="0.3" />

          {/* Rim rivets — 12 evenly spaced */}
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            return (
              <circle
                key={i}
                cx={35 + 55 * Math.cos(a)}
                cy={310 + 55 * Math.sin(a)}
                r="2.5"
                fill="#8a9aaa"
                stroke={C.ink}
                strokeWidth="0.5"
              />
            );
          })}

          {/* Shield boss (centre metal dome) */}
          <circle cx="35" cy="310" r="14" fill={C.iron} stroke={C.ink} strokeWidth="1.5" />
          <circle cx="35" cy="310" r="9" fill="none" stroke={C.ironLight} strokeWidth="1" opacity="0.4" />
          <circle cx="35" cy="310" r="4" fill={C.ink} opacity="0.35" />
          {/* Boss rivets (4 cardinal) */}
          {[0, 90, 180, 270].map((deg) => {
            const r = (deg * Math.PI) / 180;
            return (
              <circle
                key={deg}
                cx={35 + 11 * Math.cos(r)}
                cy={310 + 11 * Math.sin(r)}
                r="1.8"
                fill="#6a7a8a"
                stroke={C.ink}
                strokeWidth="0.3"
              />
            );
          })}

          {/* Decorative knotwork band around boss */}
          <path
            d="M 21,310 Q 25,302 28,310 Q 31,318 35,310 Q 39,302 42,310 Q 45,318 49,310"
            fill="none" stroke={C.gold} strokeWidth="1.2" opacity="0.45"
          />
        </g>
      </g>

      {/* ────────────────────────────────────────────────────
          STEP 4 — RIGHT ARM + AXE
          ──────────────────────────────────────────────────── */}
      <g id="sv-arm-axe" style={partStyle(step >= 4, "slideRight", 0)}>
        {/* Right shoulder pauldron */}
        <ellipse cx="228" cy="220" rx="22" ry="15" fill={C.iron} stroke={C.ink} strokeWidth="1.5" />
        <line x1="212" y1="217" x2="244" y2="217" stroke={C.gold} strokeWidth="1" opacity="0.5" />
        <line x1="214" y1="222" x2="242" y2="222" stroke={C.gold} strokeWidth="1" opacity="0.5" />
        <line x1="216" y1="227" x2="240" y2="227" stroke={C.gold} strokeWidth="1" opacity="0.5" />

        {/* Upper arm */}
        <rect x="226" y="232" width="32" height="38" rx="7" fill={C.woolLight} stroke={C.ink} strokeWidth="1.5" />
        {/* Elbow */}
        <ellipse cx="252" cy="274" rx="14" ry="11" fill="#8a6a3a" stroke={C.ink} strokeWidth="1.2" />
        {/* Forearm */}
        <rect x="242" y="278" width="28" height="28" rx="5" fill={C.woolLight} stroke={C.ink} strokeWidth="1" />
        {/* Vambrace */}
        <rect x="240" y="276" width="32" height="32" rx="4" fill="none" stroke={C.gold} strokeWidth="2.2" />
        {/* Hand gripping axe */}
        <path
          d="M 252,306 C 248,298 250,288 256,284 L 264,284 L 264,312 L 252,312 Z"
          fill={C.skin} stroke={C.ink} strokeWidth="1.5"
        />
        <line x1="255" y1="292" x2="262" y2="292" stroke={C.ink} strokeWidth="0.6" opacity="0.4" />
        <line x1="254" y1="298" x2="262" y2="298" stroke={C.ink} strokeWidth="0.6" opacity="0.4" />

        {/* ── BEARDED AXE ── */}
        {/* Handle */}
        <line x1="258" y1="282" x2="258" y2="445" stroke={C.leather} strokeWidth="5" strokeLinecap="round" />
        <line x1="258" y1="282" x2="258" y2="445" stroke={C.ink} strokeWidth="0.8" opacity="0.25" />
        {/* Handle grip wrapping (leather strips) */}
        {[296, 306, 316, 326, 336].map((y) => (
          <line
            key={y}
            x1="254" y1={y} x2="262" y2={y + 6}
            stroke={C.leatherDark} strokeWidth="1.8" opacity="0.6"
          />
        ))}
        {/* Handle pommel */}
        <circle cx="258" cy="446" r="5" fill={C.leatherDark} stroke={C.ink} strokeWidth="1" />

        {/* Axe head — bearded style */}
        <path
          d="M 258,278 L 278,268 C 290,264 298,272 294,283 L 286,304 C 282,312 274,316 268,313 L 258,308 Z"
          fill={C.iron} stroke={C.ink} strokeWidth="2" strokeLinejoin="round"
        />
        {/* Axe edge highlight (cutting edge) */}
        <path
          d="M 282,270 C 292,268 296,276 292,286 L 284,306"
          fill="none" stroke="#b0c0d0" strokeWidth="1.5" opacity="0.5"
        />
        {/* Axe head line detail */}
        <line x1="262" y1="284" x2="278" y2="275" stroke={C.ink} strokeWidth="0.5" opacity="0.3" />
        <line x1="262" y1="293" x2="282" y2="283" stroke={C.ink} strokeWidth="0.5" opacity="0.3" />
        <line x1="262" y1="302" x2="278" y2="296" stroke={C.ink} strokeWidth="0.5" opacity="0.3" />
      </g>

      {/* ────────────────────────────────────────────────────
          STEP 5 — CLOAK
          ──────────────────────────────────────────────────── */}
      <g id="sv-cloak" style={partStyle(step >= 5, "fade", 0, 800)}>
        {/* Left cloak drape */}
        <path
          d="M 68,212 C 52,225 38,270 36,320 C 34,370 40,410 50,440 L 62,442 C 56,410 46,360 48,315 C 50,265 60,228 72,218 Z"
          fill="#3a2820" stroke={C.ink} strokeWidth="1.5" opacity="0.85"
        />
        {/* Right cloak drape */}
        <path
          d="M 232,212 C 248,225 262,270 264,320 C 266,370 260,410 250,440 L 238,442 C 244,410 254,360 252,315 C 250,265 240,228 228,218 Z"
          fill="#3a2820" stroke={C.ink} strokeWidth="1.5" opacity="0.85"
        />
        {/* Cloak fold lines — left */}
        <path d="M 55,255 C 46,300 44,350 50,415" fill="none" stroke="#2a1a10" strokeWidth="1" opacity="0.35" />
        <path d="M 62,240 C 52,280 50,330 54,400" fill="none" stroke="#4a3a28" strokeWidth="0.6" opacity="0.3" />
        {/* Cloak fold lines — right */}
        <path d="M 245,255 C 254,300 256,350 250,415" fill="none" stroke="#2a1a10" strokeWidth="1" opacity="0.35" />
        <path d="M 238,240 C 248,280 250,330 246,400" fill="none" stroke="#4a3a28" strokeWidth="0.6" opacity="0.3" />

        {/* Penannular brooch at collar — silver/gold clasp */}
        <circle cx="150" cy="200" r="11" fill="none" stroke={C.gold} strokeWidth="2.8" />
        <circle cx="150" cy="200" r="11" fill="none" stroke="#e8c860" strokeWidth="1" opacity="0.4" />
        {/* Brooch terminals (two small balls at the gap) */}
        <circle cx="150" cy="189" r="2.5" fill={C.gold} stroke={C.ink} strokeWidth="0.5" />
        {/* Brooch pin */}
        <line x1="144" y1="195" x2="150" y2="212" stroke={C.gold} strokeWidth="2.2" strokeLinecap="round" />
      </g>

      {/* ────────────────────────────────────────────────────
          STEP 6 — HEAD + GJERMUNDBU HELMET
          ──────────────────────────────────────────────────── */}
      <g id="sv-head-helmet" style={partStyle(step >= 6, "drop", 0)}>
        {/* Neck */}
        <rect x="134" y="182" width="32" height="28" rx="7" fill={C.skin} stroke={C.ink} strokeWidth="1.5" />

        {/* Head base shape */}
        <ellipse cx="150" cy="155" rx="33" ry="40" fill={C.skin} stroke={C.ink} strokeWidth="2" />

        {/* ── Gjermundbu Helmet ── */}
        {/* Helmet dome */}
        <path
          d="M 114,158 C 114,122 130,96 150,90 C 170,96 186,122 186,158"
          fill={C.iron} stroke={C.ink} strokeWidth="2"
        />
        {/* Brow band */}
        <path d="M 114,158 L 186,158" stroke={C.ink} strokeWidth="3.5" />
        <path d="M 114,158 L 186,158" stroke={C.gold} strokeWidth="1.5" opacity="0.6" />
        {/* Crown ridge (crest) */}
        <line x1="150" y1="90" x2="150" y2="138" stroke={C.ink} strokeWidth="2.5" />
        <line x1="150" y1="90" x2="150" y2="138" stroke={C.gold} strokeWidth="1.2" opacity="0.5" />
        {/* Nose guard */}
        <line x1="150" y1="138" x2="150" y2="172" stroke={C.ink} strokeWidth="3.5" />
        <line x1="150" y1="138" x2="150" y2="172" stroke={C.iron} strokeWidth="2.2" />
        {/* Spectacle visor — the Gjermundbu's defining feature */}
        <path
          d="M 126,158 C 126,148 132,142 140,142 C 148,142 150,148 150,154"
          fill="none" stroke={C.ink} strokeWidth="3"
        />
        <path
          d="M 150,154 C 150,148 152,142 160,142 C 168,142 174,148 174,158"
          fill="none" stroke={C.ink} strokeWidth="3"
        />
        {/* Chain mail aventail — neck protection hanging from helmet */}
        <path
          d="M 116,158 C 114,168 114,180 118,188 L 132,192 L 150,194 L 168,192 L 182,188 C 186,180 186,168 184,158"
          fill="url(#sv-chainmail)" stroke={C.ink} strokeWidth="1" opacity="0.55"
        />
      </g>

      {/* ────────────────────────────────────────────────────
          STEP 7 — FACE + BEARD
          ──────────────────────────────────────────────────── */}
      <g id="sv-face" style={partStyle(step >= 7, "fade", 0, 500)}>
        {/* Eyes — CYAN (the only cyan on the entire figure) */}
        <ellipse cx="138" cy="154" rx="5.5" ry="4.5" fill="#0a0a0a" />
        <ellipse cx="162" cy="154" rx="5.5" ry="4.5" fill="#0a0a0a" />
        <circle cx="138" cy="154" r="2.8" fill={C.cyan} />
        <circle cx="162" cy="154" r="2.8" fill={C.cyan} />
        {/* Eye highlights */}
        <circle cx="137" cy="153" r="1" fill="#ffffff" opacity="0.85" />
        <circle cx="161" cy="153" r="1" fill="#ffffff" opacity="0.85" />

        {/* Brow lines — strong, weathered */}
        <path d="M 129,149 Q 138,144 147,149" fill="none" stroke={C.ink} strokeWidth="1.5" />
        <path d="M 153,149 Q 162,144 171,149" fill="none" stroke={C.ink} strokeWidth="1.5" />

        {/* Nose */}
        <path d="M 150,158 L 147,172 Q 150,174 153,172 Z" fill={C.skin} stroke={C.ink} strokeWidth="0.8" opacity="0.6" />

        {/* Mouth */}
        <path d="M 142,180 Q 150,184 158,180" fill="none" stroke={C.ink} strokeWidth="1.2" opacity="0.45" />

        {/* Full beard — braided Norse style */}
        <path
          d="M 123,172 C 120,184 118,200 122,218 C 126,230 136,238 150,242 C 164,238 174,230 178,218 C 182,200 180,184 177,172"
          fill="#8a6a3a" stroke={C.ink} strokeWidth="1.5"
        />
        {/* Beard texture — flowing lines */}
        <path d="M 128,182 C 130,204 138,225 150,236" fill="none" stroke="#6a4a1a" strokeWidth="0.8" opacity="0.45" />
        <path d="M 172,182 C 170,204 162,225 150,236" fill="none" stroke="#6a4a1a" strokeWidth="0.8" opacity="0.45" />
        <path d="M 138,180 C 138,202 144,222 150,234" fill="none" stroke="#6a4a1a" strokeWidth="0.8" opacity="0.45" />
        <path d="M 162,180 C 162,202 156,222 150,234" fill="none" stroke="#6a4a1a" strokeWidth="0.8" opacity="0.45" />
        <path d="M 150,182 L 150,230" fill="none" stroke="#6a4a1a" strokeWidth="0.6" opacity="0.35" />

        {/* Beard braids — two small braids at bottom */}
        <path d="M 136,225 L 133,246 L 139,246 Z" fill="#7a5a2a" stroke={C.ink} strokeWidth="0.8" />
        <path d="M 164,225 L 167,246 L 161,246 Z" fill="#7a5a2a" stroke={C.ink} strokeWidth="0.8" />
        {/* Braid ties — small gold bands */}
        <rect x="131" y="244" width="10" height="3" rx="1" fill={C.gold} />
        <rect x="159" y="244" width="10" height="3" rx="1" fill={C.gold} />

        {/* Moustache */}
        <path
          d="M 142,175 Q 146,172 150,174 Q 154,172 158,175"
          fill="#8a6a3a" stroke={C.ink} strokeWidth="0.8" opacity="0.7"
        />
      </g>

      {/* ────────────────────────────────────────────────────
          STEP 8 — ACCESSORIES (arm rings, pendant, runes)
          ──────────────────────────────────────────────────── */}
      <g id="sv-accessories" style={partStyle(step >= 8, "fade", 0, 700)}>
        {/* Left arm ring (twisted gold) */}
        <ellipse cx="52" cy="258" rx="14" ry="4.5" fill="none" stroke={C.gold} strokeWidth="2.8" />
        <ellipse cx="52" cy="258" rx="14" ry="4.5" fill="none" stroke="#e8c860" strokeWidth="1" opacity="0.45" />
        {/* Right arm ring */}
        <ellipse cx="248" cy="258" rx="14" ry="4.5" fill="none" stroke={C.gold} strokeWidth="2.8" />
        <ellipse cx="248" cy="258" rx="14" ry="4.5" fill="none" stroke="#e8c860" strokeWidth="1" opacity="0.45" />

        {/* Thor's hammer (Mjölnir) pendant */}
        <line x1="150" y1="242" x2="150" y2="254" stroke={C.gold} strokeWidth="1" />
        <path
          d="M 150,254 L 146,262 L 142,270 L 150,274 L 158,270 L 154,262 Z"
          fill={C.gold} stroke={C.ink} strokeWidth="1"
        />
        <circle cx="150" cy="264" r="1.5" fill={C.ink} opacity="0.3" />

        {/* Rune inscription on shield rim */}
        <text
          x="12" y="282"
          fill={C.gold}
          fontSize="6"
          fontFamily="serif"
          opacity="0.55"
          transform="rotate(-25,12,282)"
        >
          ᚠᚢᚦᚬᚱᚴ
        </text>

        {/* Rune on axe handle (Tyr rune — ᛏ) */}
        <text
          x="254" y="368"
          fill={C.gold}
          fontSize="7"
          fontFamily="serif"
          opacity="0.5"
        >
          ᛏ
        </text>

        {/* Belt ring attachments */}
        <circle cx="95" cy="357" r="3.5" fill="none" stroke={C.gold} strokeWidth="1.2" opacity="0.5" />
        <circle cx="200" cy="357" r="3.5" fill="none" stroke={C.gold} strokeWidth="1.2" opacity="0.5" />

        {/* Helmet brow studs */}
        <circle cx="130" cy="158" r="2" fill={C.gold} opacity="0.6" />
        <circle cx="170" cy="158" r="2" fill={C.gold} opacity="0.6" />
      </g>

      {/* ────────────────────────────────────────────────────
          STEP 9 — BATTLE AURA  (glow + idle animations)
          ──────────────────────────────────────────────────── */}
      <g id="sv-aura" style={partStyle(step >= 9, "fade", 0, 1000)}>
        {/* Eye glow intensification */}
        <circle cx="138" cy="154" r="7" fill={C.cyan} opacity="0">
          <animate attributeName="opacity" values="0;0.35;0" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle cx="162" cy="154" r="7" fill={C.cyan} opacity="0">
          <animate attributeName="opacity" values="0;0.35;0" dur="2.4s" repeatCount="indefinite" />
        </circle>

        {/* Axe edge glow */}
        <path
          d="M 282,270 C 292,268 296,276 292,286 L 284,306"
          fill="none" stroke="#c0d8e8" strokeWidth="2.5" opacity="0"
        >
          <animate attributeName="opacity" values="0;0.5;0" dur="3s" repeatCount="indefinite" />
        </path>

        {/* Shield rim glow */}
        <circle cx="35" cy="310" r="58" fill="none" stroke={C.gold} strokeWidth="2" opacity="0">
          <animate attributeName="opacity" values="0;0.35;0" dur="2.8s" repeatCount="indefinite" />
        </circle>

        {/* Rising particle motes */}
        {[
          { x: 75, y: 130, d: "0s" },
          { x: 225, y: 140, d: "0.6s" },
          { x: 40, y: 260, d: "1.2s" },
          { x: 265, y: 370, d: "1.8s" },
          { x: 150, y: 70, d: "0.9s" },
          { x: 20, y: 360, d: "2.1s" },
          { x: 280, y: 250, d: "0.3s" },
        ].map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.5" fill={C.gold} opacity="0">
            <animate
              attributeName="opacity"
              values="0;0.55;0"
              dur="3.5s"
              begin={p.d}
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values={`${p.y};${p.y - 25}`}
              dur="3.5s"
              begin={p.d}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* Subtle body outline glow */}
        <ellipse
          cx="150" cy="300" rx="90" ry="160"
          fill="none"
          stroke={C.gold}
          strokeWidth="1"
          opacity="0"
        >
          <animate attributeName="opacity" values="0;0.08;0" dur="4s" repeatCount="indefinite" />
        </ellipse>
      </g>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   FACT PANEL — cumulative stacking
   Newest fact is hero, previous facts compress above.
   ═══════════════════════════════════════════════════════════ */
function FactPanel({ step }: { step: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
        padding: "40px 32px",
        overflow: "hidden",
      }}
    >
      {/* Compressed previous facts */}
      <div
        style={{
          marginBottom: step > 0 ? 20 : 0,
          transition: "margin 400ms ease",
          maxHeight: "30vh",
          overflowY: "auto",
          maskImage:
            step > 3
              ? "linear-gradient(to bottom, transparent, black 20%)"
              : undefined,
          WebkitMaskImage:
            step > 3
              ? "linear-gradient(to bottom, transparent, black 20%)"
              : undefined,
        }}
      >
        {Array.from({ length: step }, (_, i) => {
          const age = step - i;
          return (
            <div
              key={i}
              style={{
                opacity: Math.max(0.15, 0.5 - age * 0.06),
                marginBottom: 5,
                transition: "all 400ms ease",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              <span
                className="font-text"
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: C.accent,
                }}
              >
                {FACTS[i].tag}
              </span>
              <span
                className="font-text"
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.25)",
                  marginLeft: 8,
                }}
              >
                {FACTS[i].title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Hero fact — current step */}
      <div key={step} className="sv-fact-hero">
        {/* Faded step number */}
        <span
          className="font-display"
          aria-hidden="true"
          style={{
            fontSize: 64,
            fontWeight: 300,
            color: "rgba(200,135,74,0.07)",
            lineHeight: 1,
            display: "block",
            marginBottom: -8,
            userSelect: "none",
          }}
        >
          {String(step + 1).padStart(2, "0")}
        </span>

        {/* Tag */}
        <span
          className="font-text"
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: C.accent,
            display: "block",
            marginBottom: 14,
          }}
        >
          {FACTS[step].tag}
        </span>

        {/* Title */}
        <h3
          className="font-display"
          style={{
            fontSize: "clamp(22px, 2.5vw, 36px)",
            fontWeight: 300,
            lineHeight: 1.2,
            color: "#ffffff",
            marginBottom: 14,
          }}
        >
          {FACTS[step].title}
        </h3>

        {/* Accent line */}
        <div
          style={{
            width: 48,
            height: 2,
            backgroundColor: C.accent,
            marginBottom: 18,
          }}
        />

        {/* Body */}
        <p
          className="font-text"
          style={{
            fontSize: 15,
            lineHeight: 1.75,
            color: "rgba(255,255,255,0.50)",
            maxWidth: 420,
          }}
        >
          {FACTS[step].body}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP INDICATOR — vertical progress dots (left edge)
   ═══════════════════════════════════════════════════════════ */
function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 16,
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        zIndex: 2,
      }}
    >
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            width: 3,
            height: i === step ? 24 : 12,
            borderRadius: 2,
            backgroundColor:
              i <= step ? C.accent : "rgba(255,255,255,0.08)",
            transition: "all 300ms ease",
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT — ScrollViking
   ═══════════════════════════════════════════════════════════ */
export default function ScrollViking() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(sectionRef);
  const step = Math.min(9, Math.floor(progress * 10));

  return (
    <div
      ref={sectionRef}
      style={{
        position: "relative",
        height: "600vh",
      }}
    >
      {/* Sticky viewport — fills the screen while user scrolls */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          alignItems: "stretch",
          backgroundColor: "#0d0c0a",
        }}
      >
        <StepIndicator step={step} total={10} />

        <div className="sv-layout">
          {/* Left column — Viking SVG */}
          <div className="sv-viking-col">
            <VikingSVG step={step} />
          </div>

          {/* Right column — Fact panel */}
          <div className="sv-fact-col">
            <FactPanel step={step} />
          </div>
        </div>
      </div>

      {/* Scoped styles */}
      <style>{`
        .sv-layout {
          display: flex;
          width: 100%;
          height: 100%;
          flex-direction: row;
        }
        .sv-viking-col {
          flex: 0 0 55%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px 40px 44px;
        }
        .sv-fact-col {
          flex: 0 0 45%;
          display: flex;
          align-items: center;
        }
        .sv-fact-hero {
          animation: svFactEnter 500ms ${EASE_SMOOTH} both;
        }
        @keyframes svFactEnter {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 767px) {
          .sv-layout {
            flex-direction: column !important;
          }
          .sv-viking-col {
            flex: 0 0 50% !important;
            padding: 20px 16px 0 16px !important;
          }
          .sv-fact-col {
            flex: 0 0 50% !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .sv-fact-hero { animation: none !important; }
          #sv-aura animate { animation-play-state: paused; }
        }
      `}</style>
    </div>
  );
}

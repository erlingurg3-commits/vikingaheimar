"use client";

import { useState, useCallback } from "react";

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
    body: "Norse leg wrappings — víndingar — weren\u2019t mere fashion. Tightly wound bindings protected against brush, cold, and sword cuts. The winding pattern indicated your homeland.",
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
    tag: "VÍKINGAHEIMAR",
    title: "This is not a myth. This is who they were.",
    body: "Sailors, settlers, traders, poets — and yes, warriors. The ship that proved the sagas true is docked at Víkingaheimar. You can board her.",
  },
];

/* step labels for the clickable inventory */
const STEP_LABELS = [
  "Boots",
  "Legs",
  "Torso",
  "Shield",
  "Axe",
  "Cloak",
  "Helmet",
  "Face",
  "Runes",
  "Aura",
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

   10 groups, each revealed on its step.
   ═══════════════════════════════════════════════════════════ */
function VikingSVG({ step }: { step: number }) {
  return (
    <svg
      viewBox="0 0 300 520"
      style={{
        width: "100%",
        height: "auto",
        maxHeight: "75vh",
        display: "block",
        margin: "0 auto",
      }}
      aria-label="Viking warrior assembling piece by piece"
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

      {/* ── STEP 0 — BOOTS ── */}
      <g id="sv-boots">
        {/* Left boot */}
        <g style={partStyle(step >= 0, "rise", 0)}>
          <path
            d="M 82,508 L 82,460 C 82,450 80,444 83,437 C 86,430 92,425 98,423 C 104,421 110,422 114,425 C 118,430 120,438 120,448 L 120,508 Z"
            fill={C.leather} stroke={C.ink} strokeWidth="2" strokeLinejoin="round"
          />
          <rect x="78" y="506" width="46" height="8" rx="3" fill={C.leatherDark} stroke={C.ink} strokeWidth="1.5" />
          <path d="M 84,438 Q 100,432 118,438" fill="none" stroke={C.leatherLight} strokeWidth="3" strokeLinecap="round" />
          {[445, 453, 461, 469, 477, 485, 493].map((y) => (
            <line key={y} x1="98" y1={y} x2="104" y2={y} stroke={C.leatherDark} strokeWidth="1" opacity="0.6" />
          ))}
          <rect x="87" y="455" width="28" height="5" rx="1" fill={C.leatherDark} stroke={C.ink} strokeWidth="0.8" />
          <rect x="98" y="453" width="8" height="9" rx="1.5" fill={C.gold} stroke={C.ink} strokeWidth="0.8" />
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

      {/* ── STEP 1 — LEGS ── */}
      <g id="sv-legs" style={partStyle(step >= 1, "rise", 0)}>
        <path
          d="M 88,358 L 88,375 Q 105,395 150,398 Q 195,395 212,375 L 212,358 Z"
          fill={C.woolLight} stroke={C.ink} strokeWidth="1.5"
        />
        <rect x="84" y="375" width="38" height="58" rx="6" fill={C.woolLight} stroke={C.ink} strokeWidth="1.5" />
        <ellipse cx="103" cy="408" rx="16" ry="11" fill="#8a6a3a" stroke={C.ink} strokeWidth="1.2" />
        <rect x="86" y="416" width="34" height="28" rx="4" fill="#7a5a3a" stroke={C.ink} strokeWidth="1" />
        {[418, 424, 430, 436, 442].map((y, i) => (
          <path
            key={y}
            d={`M ${88 + (i % 2) * 5},${y} L ${116 - (i % 2) * 5},${y + 4}`}
            fill="none" stroke="#c8a060" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"
          />
        ))}
        <rect x="178" y="375" width="38" height="58" rx="6" fill={C.woolLight} stroke={C.ink} strokeWidth="1.5" />
        <ellipse cx="197" cy="408" rx="16" ry="11" fill="#8a6a3a" stroke={C.ink} strokeWidth="1.2" />
        <rect x="180" y="416" width="34" height="28" rx="4" fill="#7a5a3a" stroke={C.ink} strokeWidth="1" />
        {[418, 424, 430, 436, 442].map((y, i) => (
          <path
            key={y}
            d={`M ${182 + (i % 2) * 5},${y} L ${210 - (i % 2) * 5},${y + 4}`}
            fill="none" stroke="#c8a060" strokeWidth="2.5" strokeLinecap="round" opacity="0.8"
          />
        ))}
      </g>

      {/* ── STEP 2 — TORSO (hauberk + belt) ── */}
      <g id="sv-torso" style={partStyle(step >= 2, "scale", 0)}>
        <path
          d="M 78,215 C 78,210 85,205 100,205 L 200,205 C 215,205 222,210 222,215 L 222,360 C 222,365 215,370 200,370 L 100,370 C 85,370 78,365 78,360 Z"
          fill={C.wool} stroke={C.ink} strokeWidth="1.5"
        />
        <rect x="78" y="205" width="144" height="155" rx="8" fill="url(#sv-chainmail)" opacity="0.7" />
        <rect x="78" y="205" width="144" height="155" rx="8" fill="none" stroke={C.ink} strokeWidth="2" />
        <path
          d="M 82,358 Q 86,365 90,358 Q 94,365 98,358 Q 102,365 106,358 Q 110,365 114,358 Q 118,365 122,358 Q 126,365 130,358 Q 134,365 138,358 Q 142,365 146,358 Q 150,365 154,358 Q 158,365 162,358 Q 166,365 170,358 Q 174,365 178,358 Q 182,365 186,358 Q 190,365 194,358 Q 198,365 202,358 Q 206,365 210,358 Q 214,365 218,358"
          fill="none" stroke={C.gold} strokeWidth="1.5" opacity="0.65"
        />
        <path d="M 118,205 L 150,242 L 182,205" fill={C.linen} stroke={C.ink} strokeWidth="1.2" />
        <path d="M 84,215 Q 110,222 118,285 L 84,285 Z" fill="#3a2a18" opacity="0.2" />
        <path d="M 216,215 Q 190,222 182,285 L 216,285 Z" fill={C.linen} opacity="0.08" />
        <g
          style={{
            opacity: step >= 2 ? 1 : 0,
            transform: step >= 2 ? "none" : "translateY(20px)",
            transition: `all 450ms ${EASE_BOUNCE} 350ms`,
          }}
        >
          <rect x="74" y="348" width="152" height="18" rx="3" fill="#3a2010" stroke={C.ink} strokeWidth="2" />
          <rect x="137" y="345" width="26" height="24" rx="2.5" fill={C.gold} stroke="#8a5a10" strokeWidth="1.5" />
          <rect x="148" y="349" width="4" height="16" rx="1" fill="#8a5a10" />
          <path
            d="M 108,366 L 104,390 Q 108,395 118,395 Q 128,395 132,390 L 128,366"
            fill={C.leatherDark} stroke={C.ink} strokeWidth="1"
          />
          <line x1="108" y1="366" x2="128" y2="366" stroke={C.ink} strokeWidth="1" />
          <rect x="175" y="365" width="10" height="18" rx="2" fill={C.leatherDark} stroke={C.ink} strokeWidth="0.8" />
          <rect x="177" y="370" width="6" height="4" rx="1" fill={C.leather} />
        </g>
      </g>

      {/* ── STEP 3 — LEFT ARM + SHIELD ── */}
      <g id="sv-arm-shield" style={partStyle(step >= 3, "slideLeft", 0)}>
        <ellipse cx="72" cy="220" rx="22" ry="15" fill={C.iron} stroke={C.ink} strokeWidth="1.5" />
        <line x1="56" y1="217" x2="88" y2="217" stroke={C.gold} strokeWidth="1" opacity="0.5" />
        <line x1="58" y1="222" x2="86" y2="222" stroke={C.gold} strokeWidth="1" opacity="0.5" />
        <line x1="60" y1="227" x2="84" y2="227" stroke={C.gold} strokeWidth="1" opacity="0.5" />
        <rect x="42" y="232" width="32" height="38" rx="7" fill={C.woolLight} stroke={C.ink} strokeWidth="1.5" />
        <ellipse cx="48" cy="274" rx="14" ry="11" fill="#8a6a3a" stroke={C.ink} strokeWidth="1.2" />
        <rect x="30" y="278" width="28" height="28" rx="5" fill={C.woolLight} stroke={C.ink} strokeWidth="1" />
        <rect x="28" y="276" width="32" height="32" rx="4" fill="none" stroke={C.gold} strokeWidth="2.2" />
        <path
          d="M 24,302 C 20,294 22,284 30,280 L 38,280 L 38,308 L 24,308 Z"
          fill={C.skin} stroke={C.ink} strokeWidth="1.5"
        />
        <line x1="28" y1="290" x2="36" y2="290" stroke={C.ink} strokeWidth="0.6" opacity="0.4" />
        <line x1="27" y1="296" x2="36" y2="296" stroke={C.ink} strokeWidth="0.6" opacity="0.4" />

        {/* Shield */}
        <g>
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
            {[-35, -21, -7, 7, 21, 35].map((dx) => (
              <line
                key={dx}
                x1={35 + dx} y1="255" x2={35 + dx} y2="365"
                stroke="#3a2010" strokeWidth="1" opacity="0.6"
              />
            ))}
            {Array.from({ length: 18 }, (_, i) => 258 + i * 6).map((y) => (
              <line
                key={y}
                x1="-22" y1={y} x2="92" y2={y}
                stroke="#6a4a1a" strokeWidth="0.4" opacity="0.25"
              />
            ))}
          </g>
          <circle cx="35" cy="310" r="55" fill="none" stroke={C.iron} strokeWidth="8" />
          <circle cx="35" cy="310" r="55" fill="none" stroke={C.ironLight} strokeWidth="1.5" opacity="0.3" />
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
          <circle cx="35" cy="310" r="14" fill={C.iron} stroke={C.ink} strokeWidth="1.5" />
          <circle cx="35" cy="310" r="9" fill="none" stroke={C.ironLight} strokeWidth="1" opacity="0.4" />
          <circle cx="35" cy="310" r="4" fill={C.ink} opacity="0.35" />
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
          <path
            d="M 21,310 Q 25,302 28,310 Q 31,318 35,310 Q 39,302 42,310 Q 45,318 49,310"
            fill="none" stroke={C.gold} strokeWidth="1.2" opacity="0.45"
          />
        </g>
      </g>

      {/* ── STEP 4 — RIGHT ARM + AXE ── */}
      <g id="sv-arm-axe" style={partStyle(step >= 4, "slideRight", 0)}>
        <ellipse cx="228" cy="220" rx="22" ry="15" fill={C.iron} stroke={C.ink} strokeWidth="1.5" />
        <line x1="212" y1="217" x2="244" y2="217" stroke={C.gold} strokeWidth="1" opacity="0.5" />
        <line x1="214" y1="222" x2="242" y2="222" stroke={C.gold} strokeWidth="1" opacity="0.5" />
        <line x1="216" y1="227" x2="240" y2="227" stroke={C.gold} strokeWidth="1" opacity="0.5" />
        <rect x="226" y="232" width="32" height="38" rx="7" fill={C.woolLight} stroke={C.ink} strokeWidth="1.5" />
        <ellipse cx="252" cy="274" rx="14" ry="11" fill="#8a6a3a" stroke={C.ink} strokeWidth="1.2" />
        <rect x="242" y="278" width="28" height="28" rx="5" fill={C.woolLight} stroke={C.ink} strokeWidth="1" />
        <rect x="240" y="276" width="32" height="32" rx="4" fill="none" stroke={C.gold} strokeWidth="2.2" />
        <path
          d="M 252,306 C 248,298 250,288 256,284 L 264,284 L 264,312 L 252,312 Z"
          fill={C.skin} stroke={C.ink} strokeWidth="1.5"
        />
        <line x1="255" y1="292" x2="262" y2="292" stroke={C.ink} strokeWidth="0.6" opacity="0.4" />
        <line x1="254" y1="298" x2="262" y2="298" stroke={C.ink} strokeWidth="0.6" opacity="0.4" />
        <line x1="258" y1="282" x2="258" y2="445" stroke={C.leather} strokeWidth="5" strokeLinecap="round" />
        <line x1="258" y1="282" x2="258" y2="445" stroke={C.ink} strokeWidth="0.8" opacity="0.25" />
        {[296, 306, 316, 326, 336].map((y) => (
          <line
            key={y}
            x1="254" y1={y} x2="262" y2={y + 6}
            stroke={C.leatherDark} strokeWidth="1.8" opacity="0.6"
          />
        ))}
        <circle cx="258" cy="446" r="5" fill={C.leatherDark} stroke={C.ink} strokeWidth="1" />
        <path
          d="M 258,278 L 278,268 C 290,264 298,272 294,283 L 286,304 C 282,312 274,316 268,313 L 258,308 Z"
          fill={C.iron} stroke={C.ink} strokeWidth="2" strokeLinejoin="round"
        />
        <path
          d="M 282,270 C 292,268 296,276 292,286 L 284,306"
          fill="none" stroke="#b0c0d0" strokeWidth="1.5" opacity="0.5"
        />
        <line x1="262" y1="284" x2="278" y2="275" stroke={C.ink} strokeWidth="0.5" opacity="0.3" />
        <line x1="262" y1="293" x2="282" y2="283" stroke={C.ink} strokeWidth="0.5" opacity="0.3" />
        <line x1="262" y1="302" x2="278" y2="296" stroke={C.ink} strokeWidth="0.5" opacity="0.3" />
      </g>

      {/* ── STEP 5 — CLOAK ── */}
      <g id="sv-cloak" style={partStyle(step >= 5, "fade", 0, 800)}>
        <path
          d="M 68,212 C 52,225 38,270 36,320 C 34,370 40,410 50,440 L 62,442 C 56,410 46,360 48,315 C 50,265 60,228 72,218 Z"
          fill="#3a2820" stroke={C.ink} strokeWidth="1.5" opacity="0.85"
        />
        <path
          d="M 232,212 C 248,225 262,270 264,320 C 266,370 260,410 250,440 L 238,442 C 244,410 254,360 252,315 C 250,265 240,228 228,218 Z"
          fill="#3a2820" stroke={C.ink} strokeWidth="1.5" opacity="0.85"
        />
        <path d="M 55,255 C 46,300 44,350 50,415" fill="none" stroke="#2a1a10" strokeWidth="1" opacity="0.35" />
        <path d="M 62,240 C 52,280 50,330 54,400" fill="none" stroke="#4a3a28" strokeWidth="0.6" opacity="0.3" />
        <path d="M 245,255 C 254,300 256,350 250,415" fill="none" stroke="#2a1a10" strokeWidth="1" opacity="0.35" />
        <path d="M 238,240 C 248,280 250,330 246,400" fill="none" stroke="#4a3a28" strokeWidth="0.6" opacity="0.3" />
        <circle cx="150" cy="200" r="11" fill="none" stroke={C.gold} strokeWidth="2.8" />
        <circle cx="150" cy="200" r="11" fill="none" stroke="#e8c860" strokeWidth="1" opacity="0.4" />
        <circle cx="150" cy="189" r="2.5" fill={C.gold} stroke={C.ink} strokeWidth="0.5" />
        <line x1="144" y1="195" x2="150" y2="212" stroke={C.gold} strokeWidth="2.2" strokeLinecap="round" />
      </g>

      {/* ── STEP 6 — HEAD + GJERMUNDBU HELMET ── */}
      <g id="sv-head-helmet" style={partStyle(step >= 6, "drop", 0)}>
        <rect x="134" y="182" width="32" height="28" rx="7" fill={C.skin} stroke={C.ink} strokeWidth="1.5" />
        <ellipse cx="150" cy="155" rx="33" ry="40" fill={C.skin} stroke={C.ink} strokeWidth="2" />
        <path
          d="M 114,158 C 114,122 130,96 150,90 C 170,96 186,122 186,158"
          fill={C.iron} stroke={C.ink} strokeWidth="2"
        />
        <path d="M 114,158 L 186,158" stroke={C.ink} strokeWidth="3.5" />
        <path d="M 114,158 L 186,158" stroke={C.gold} strokeWidth="1.5" opacity="0.6" />
        <line x1="150" y1="90" x2="150" y2="138" stroke={C.ink} strokeWidth="2.5" />
        <line x1="150" y1="90" x2="150" y2="138" stroke={C.gold} strokeWidth="1.2" opacity="0.5" />
        <line x1="150" y1="138" x2="150" y2="172" stroke={C.ink} strokeWidth="3.5" />
        <line x1="150" y1="138" x2="150" y2="172" stroke={C.iron} strokeWidth="2.2" />
        <path
          d="M 126,158 C 126,148 132,142 140,142 C 148,142 150,148 150,154"
          fill="none" stroke={C.ink} strokeWidth="3"
        />
        <path
          d="M 150,154 C 150,148 152,142 160,142 C 168,142 174,148 174,158"
          fill="none" stroke={C.ink} strokeWidth="3"
        />
        <path
          d="M 116,158 C 114,168 114,180 118,188 L 132,192 L 150,194 L 168,192 L 182,188 C 186,180 186,168 184,158"
          fill="url(#sv-chainmail)" stroke={C.ink} strokeWidth="1" opacity="0.55"
        />
      </g>

      {/* ── STEP 7 — FACE + BEARD ── */}
      <g id="sv-face" style={partStyle(step >= 7, "fade", 0, 500)}>
        <ellipse cx="138" cy="154" rx="5.5" ry="4.5" fill="#0a0a0a" />
        <ellipse cx="162" cy="154" rx="5.5" ry="4.5" fill="#0a0a0a" />
        <circle cx="138" cy="154" r="2.8" fill={C.cyan} />
        <circle cx="162" cy="154" r="2.8" fill={C.cyan} />
        <circle cx="137" cy="153" r="1" fill="#ffffff" opacity="0.85" />
        <circle cx="161" cy="153" r="1" fill="#ffffff" opacity="0.85" />
        <path d="M 129,149 Q 138,144 147,149" fill="none" stroke={C.ink} strokeWidth="1.5" />
        <path d="M 153,149 Q 162,144 171,149" fill="none" stroke={C.ink} strokeWidth="1.5" />
        <path d="M 150,158 L 147,172 Q 150,174 153,172 Z" fill={C.skin} stroke={C.ink} strokeWidth="0.8" opacity="0.6" />
        <path d="M 142,180 Q 150,184 158,180" fill="none" stroke={C.ink} strokeWidth="1.2" opacity="0.45" />
        <path
          d="M 123,172 C 120,184 118,200 122,218 C 126,230 136,238 150,242 C 164,238 174,230 178,218 C 182,200 180,184 177,172"
          fill="#8a6a3a" stroke={C.ink} strokeWidth="1.5"
        />
        <path d="M 128,182 C 130,204 138,225 150,236" fill="none" stroke="#6a4a1a" strokeWidth="0.8" opacity="0.45" />
        <path d="M 172,182 C 170,204 162,225 150,236" fill="none" stroke="#6a4a1a" strokeWidth="0.8" opacity="0.45" />
        <path d="M 138,180 C 138,202 144,222 150,234" fill="none" stroke="#6a4a1a" strokeWidth="0.8" opacity="0.45" />
        <path d="M 162,180 C 162,202 156,222 150,234" fill="none" stroke="#6a4a1a" strokeWidth="0.8" opacity="0.45" />
        <path d="M 150,182 L 150,230" fill="none" stroke="#6a4a1a" strokeWidth="0.6" opacity="0.35" />
        <path d="M 136,225 L 133,246 L 139,246 Z" fill="#7a5a2a" stroke={C.ink} strokeWidth="0.8" />
        <path d="M 164,225 L 167,246 L 161,246 Z" fill="#7a5a2a" stroke={C.ink} strokeWidth="0.8" />
        <rect x="131" y="244" width="10" height="3" rx="1" fill={C.gold} />
        <rect x="159" y="244" width="10" height="3" rx="1" fill={C.gold} />
        <path
          d="M 142,175 Q 146,172 150,174 Q 154,172 158,175"
          fill="#8a6a3a" stroke={C.ink} strokeWidth="0.8" opacity="0.7"
        />
      </g>

      {/* ── STEP 8 — ACCESSORIES ── */}
      <g id="sv-accessories" style={partStyle(step >= 8, "fade", 0, 700)}>
        <ellipse cx="52" cy="258" rx="14" ry="4.5" fill="none" stroke={C.gold} strokeWidth="2.8" />
        <ellipse cx="52" cy="258" rx="14" ry="4.5" fill="none" stroke="#e8c860" strokeWidth="1" opacity="0.45" />
        <ellipse cx="248" cy="258" rx="14" ry="4.5" fill="none" stroke={C.gold} strokeWidth="2.8" />
        <ellipse cx="248" cy="258" rx="14" ry="4.5" fill="none" stroke="#e8c860" strokeWidth="1" opacity="0.45" />
        <line x1="150" y1="242" x2="150" y2="254" stroke={C.gold} strokeWidth="1" />
        <path
          d="M 150,254 L 146,262 L 142,270 L 150,274 L 158,270 L 154,262 Z"
          fill={C.gold} stroke={C.ink} strokeWidth="1"
        />
        <circle cx="150" cy="264" r="1.5" fill={C.ink} opacity="0.3" />
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
        <text
          x="254" y="368"
          fill={C.gold}
          fontSize="7"
          fontFamily="serif"
          opacity="0.5"
        >
          ᛏ
        </text>
        <circle cx="95" cy="357" r="3.5" fill="none" stroke={C.gold} strokeWidth="1.2" opacity="0.5" />
        <circle cx="200" cy="357" r="3.5" fill="none" stroke={C.gold} strokeWidth="1.2" opacity="0.5" />
        <circle cx="130" cy="158" r="2" fill={C.gold} opacity="0.6" />
        <circle cx="170" cy="158" r="2" fill={C.gold} opacity="0.6" />
      </g>

      {/* ── STEP 9 — BATTLE AURA ── */}
      <g id="sv-aura" style={partStyle(step >= 9, "fade", 0, 1000)}>
        <circle cx="138" cy="154" r="7" fill={C.cyan} opacity="0">
          <animate attributeName="opacity" values="0;0.35;0" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <circle cx="162" cy="154" r="7" fill={C.cyan} opacity="0">
          <animate attributeName="opacity" values="0;0.35;0" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <path
          d="M 282,270 C 292,268 296,276 292,286 L 284,306"
          fill="none" stroke="#c0d8e8" strokeWidth="2.5" opacity="0"
        >
          <animate attributeName="opacity" values="0;0.5;0" dur="3s" repeatCount="indefinite" />
        </path>
        <circle cx="35" cy="310" r="58" fill="none" stroke={C.gold} strokeWidth="2" opacity="0">
          <animate attributeName="opacity" values="0;0.35;0" dur="2.8s" repeatCount="indefinite" />
        </circle>
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
   FACT PANEL — shows the active step's fact
   ═══════════════════════════════════════════════════════════ */
function FactPanel({
  step,
  onSelect,
  onForge,
  onReset,
}: {
  step: number;
  onSelect: (i: number) => void;
  onForge: () => void;
  onReset: () => void;
}) {
  const complete = step >= 9;

  return (
    <div className="sv-fact-panel">
      {/* ── Top: scrollable fact content ── */}
      <div className="sv-fact-content">
        {/* Compressed previous facts */}
        <div
          style={{
            marginBottom: step > 0 ? 12 : 0,
            transition: "margin 400ms ease",
            overflow: "hidden",
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
                  marginBottom: 4,
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
          <span
            className="font-display"
            aria-hidden="true"
            style={{
              fontSize: "clamp(40px, 5vw, 64px)",
              fontWeight: 400,
              color: "rgba(200,135,74,0.07)",
              lineHeight: 1,
              display: "block",
              marginBottom: -6,
              userSelect: "none",
            }}
          >
            {String(step + 1).padStart(2, "0")}
          </span>

          <span
            className="font-text"
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: C.accent,
              display: "block",
              marginBottom: 10,
            }}
          >
            {FACTS[step].tag}
          </span>

          <h3
            className="font-display"
            style={{
              fontSize: "clamp(18px, 2.2vw, 32px)",
              fontWeight: 400,
              lineHeight: 1.2,
              color: "#ffffff",
              marginBottom: 10,
            }}
          >
            {FACTS[step].title}
          </h3>

          <div
            style={{
              width: 48,
              height: 2,
              backgroundColor: C.accent,
              marginBottom: 12,
            }}
          />

          <p className="sv-fact-body font-text">
            {FACTS[step].body}
          </p>
        </div>
      </div>

      {/* ── Bottom: pinned controls (never pushed off-screen) ── */}
      <div className="sv-controls">
        <StepDots step={step} total={10} onSelect={onSelect} />
        {complete ? (
          <a
            href="/saga"
            className="sv-next-btn font-display"
            aria-label="Board the Íslendingur"
            style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            BOARD THE ÍSLENDINGUR &rarr;
          </a>
        ) : (
          <button
            className="sv-next-btn font-display"
            onClick={onForge}
            aria-label={`Next: ${STEP_LABELS[Math.min(step + 1, 9)]}`}
          >
            CONTINUE &rarr;
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP DOTS — clickable progress indicator
   ═══════════════════════════════════════════════════════════ */
function StepDots({
  step,
  total,
  onSelect,
}: {
  step: number;
  total: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div
      className="sv-dots"
      role="tablist"
      aria-label="Viking assembly steps"
    >
      {Array.from({ length: total }, (_, i) => {
        const visited = i <= step;
        const active = i === step;
        return (
          <button
            key={i}
            role="tab"
            aria-selected={active}
            aria-label={`Step ${i + 1}: ${STEP_LABELS[i]}`}
            onClick={() => onSelect(i)}
            style={{
              width: active ? 28 : 10,
              height: 10,
              borderRadius: 5,
              border: "none",
              cursor: "pointer",
              backgroundColor: visited
                ? C.accent
                : "rgba(255,255,255,0.12)",
              opacity: active ? 1 : visited ? 0.6 : 0.35,
              transition: "all 300ms ease",
              padding: 0,
            }}
          />
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT — ScrollViking (click-to-assemble)
   ═══════════════════════════════════════════════════════════ */
export default function ScrollViking() {
  const [step, setStep] = useState(-1);
  const started = step >= 0;

  const forgeNext = useCallback(() => {
    setStep((s) => Math.min(9, s + 1));
  }, []);

  const selectStep = useCallback((i: number) => {
    setStep(i);
  }, []);

  const reset = useCallback(() => {
    setStep(-1);
  }, []);

  return (
    <section
      aria-label="Forge a Viking warrior"
      className="sv-section"
    >
      {/* Start state — invitation to begin */}
      {!started && (
        <div className="sv-start" onClick={forgeNext}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Víkingaheimar"
            className="sv-start-logo"
            style={{
              width: "160px",
              height: "auto",
              objectFit: "contain",
              opacity: 0.9,
            }}
          />
          <span className="sv-start-label font-display">Forge a Viking</span>
          <span className="sv-start-sub font-text">
            Tap to begin
          </span>
        </div>
      )}

      {/* Main assembly area */}
      {started && (
        <>
          <div className="sv-layout">
            {/* Left column — Viking SVG */}
            <div className="sv-viking-col">
              <VikingSVG step={step} />
            </div>

            {/* Right column — Fact panel + controls */}
            <div className="sv-fact-col">
              <FactPanel
                step={step}
                onSelect={selectStep}
                onForge={forgeNext}
                onReset={reset}
              />
            </div>
          </div>

          {/* Step counter */}
          <div
            className="font-text"
            style={{
              position: "absolute",
              top: 20,
              right: 24,
              fontSize: 12,
              color: "rgba(255,255,255,0.2)",
              letterSpacing: "0.1em",
            }}
          >
            {step + 1} / 10
          </div>

          {/* Battle ready flourish */}
          {step >= 9 && (
            <div className="sv-flourish" aria-hidden="true">
              <div className="sv-flourish-ring" />
              <div className="sv-flourish-ring sv-flourish-ring--delay" />
            </div>
          )}
        </>
      )}

      {/* Scoped styles */}
      <style>{`
        /* ── Section — strict 100dvh minus navbar ── */
        .sv-section {
          --sv-nav-h: 72px;
          position: relative;
          height: calc(100dvh - var(--sv-nav-h));
          min-height: calc(100dvh - var(--sv-nav-h));
          background-color: #0d0c0a;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding-top: env(safe-area-inset-top, 0px);
          padding-bottom: env(safe-area-inset-bottom, 8px);
        }

        /* ── Start screen ── */
        .sv-start {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          padding: 60px;
          user-select: none;
        }
        .sv-start-logo {
          animation: svStartPulse 2.5s ease-in-out infinite;
        }
        .sv-start-label {
          font-size: clamp(28px, 4vw, 48px);
          font-weight: 300;
          color: #fff;
          letter-spacing: 0.04em;
        }
        .sv-start-sub {
          font-size: 14px;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }
        @keyframes svStartPulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50%       { transform: scale(1.08); opacity: 1; }
        }

        /* ── Layout — fills section ── */
        .sv-layout {
          display: flex;
          flex-direction: row;
          width: 100%;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        /* ── Viking SVG column ── */
        .sv-viking-col {
          flex: 0 0 55%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px 20px 16px 44px;
          overflow: hidden;
        }
        .sv-viking-col svg {
          max-height: 100%;
          width: auto;
        }

        /* ── Fact column — stretches, pins controls to bottom ── */
        .sv-fact-col {
          flex: 0 0 45%;
          display: flex;
          min-height: 0;
          overflow: hidden;
        }
        .sv-fact-panel {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          width: 100%;
          height: 100%;
          padding: 24px 32px 16px;
          overflow: hidden;
        }

        /* ── Fact content (top, flexible, clips if needed) ── */
        .sv-fact-content {
          flex: 1;
          min-height: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        /* ── Fact body — clamped to 5 lines on desktop ── */
        .sv-fact-body {
          font-size: 14px;
          line-height: 1.7;
          color: rgba(255,255,255,0.50);
          max-width: 420px;
          display: -webkit-box;
          -webkit-line-clamp: 5;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        /* Limit compressed facts on desktop to last 3 */
        .sv-fact-content > div:first-child > div:nth-last-child(n+4) {
          display: none;
        }

        /* ── Fact entry animation ── */
        .sv-fact-hero {
          animation: svFactEnter 500ms ${EASE_SMOOTH} both;
        }
        @keyframes svFactEnter {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Controls — pinned to bottom, never pushed off ── */
        .sv-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
          padding-top: 12px;
        }
        .sv-dots {
          display: flex;
          gap: 8px;
          align-items: center;
          justify-content: center;
          padding: 8px 0;
          flex-shrink: 0;
        }

        /* ── Next button — cyan, full-width, always visible ── */
        .sv-next-btn {
          width: 100%;
          height: 52px;
          background: transparent;
          border: 1px solid ${C.cyan};
          border-radius: 4px;
          color: ${C.cyan};
          font-size: 0.8rem;
          letter-spacing: 0.2em;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 200ms ease;
        }
        .sv-next-btn:hover {
          background: rgba(0,212,255,0.08);
          border-color: ${C.cyan};
        }
        .sv-next-btn:active {
          transform: scale(0.98);
        }

        /* ── Battle ready flourish ── */
        .sv-flourish {
          position: absolute;
          inset: 0;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sv-flourish-ring {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          border: 2px solid ${C.gold};
          animation: svFlourish 2s ease-out forwards;
        }
        .sv-flourish-ring--delay {
          animation-delay: 0.3s;
        }
        @keyframes svFlourish {
          0%   { transform: scale(0.3); opacity: 0.7; }
          100% { transform: scale(4); opacity: 0; }
        }

        /* ── Mobile ── */
        @media (max-width: 767px) {
          .sv-section {
            --sv-nav-h: 64px;
          }
          .sv-layout {
            flex-direction: column !important;
          }
          .sv-viking-col {
            flex: 0 0 auto !important;
            max-height: 35dvh !important;
            padding: 4px 12px 0 12px !important;
          }
          .sv-viking-col svg {
            max-height: 100% !important;
            width: auto !important;
            object-fit: contain;
          }
          .sv-fact-col {
            flex: 1 !important;
            min-height: 0;
          }
          .sv-fact-panel {
            padding: 8px 16px 8px !important;
          }
          .sv-fact-body {
            font-size: 12px !important;
            line-height: 1.55 !important;
            -webkit-line-clamp: 3 !important;
          }
          /* Hide all compressed prior facts on mobile */
          .sv-fact-content > div:first-child {
            display: none !important;
          }
          .sv-controls {
            gap: 8px !important;
            padding-top: 6px !important;
          }
          .sv-dots {
            gap: 6px !important;
            padding: 4px 0 !important;
          }
          .sv-next-btn {
            height: 44px !important;
            font-size: 0.7rem !important;
          }
          .sv-start {
            padding: 32px !important;
            gap: 12px !important;
          }
          .sv-start-logo {
            width: 120px !important;
          }
        }

        /* ── Small phones (≤ 380px wide or ≤ 700px tall) ── */
        @media (max-width: 380px), (max-height: 700px) {
          .sv-viking-col {
            max-height: 30dvh !important;
            padding: 2px 8px 0 8px !important;
          }
          .sv-fact-panel {
            padding: 6px 12px 6px !important;
          }
          .sv-fact-body {
            font-size: 11px !important;
            -webkit-line-clamp: 2 !important;
          }
          .sv-next-btn {
            height: 40px !important;
          }
        }

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .sv-fact-hero { animation: none !important; }
          .sv-start-logo { animation: none !important; }
          .sv-next-btn { animation: none !important; }
          .sv-flourish-ring { animation: none !important; }
          #sv-aura animate { animation-play-state: paused; }
        }

        /* ── Keyboard focus ── */
        .sv-next-btn:focus-visible,
        .sv-dots button:focus-visible {
          outline: 2px solid ${C.cyan};
          outline-offset: 2px;
        }
      `}</style>
    </section>
  );
}

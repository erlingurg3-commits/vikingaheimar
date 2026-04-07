"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useScrollReveal } from "@/app/components/hooks/useScrollReveal";

/* ═══════════════════════════════════════════════════════════
   COLOUR TOKENS
   ═══════════════════════════════════════════════════════════ */
const INK = (a: number) => `rgba(28,20,12,${a})`;
const AMBER = (a: number) => `rgba(200,135,74,${a})`;

/* ═══════════════════════════════════════════════════════════
   WAVE DELAYS (ms) — overlapping for organic reveal
   ═══════════════════════════════════════════════════════════ */
const W1 = 0;      // hull + keel
const W2 = 600;    // planking + ribs
const W3 = 1200;   // benches + mast step
const W4 = 1800;   // oar locks + oars
const W5 = 2400;   // shields
const W6 = 2800;   // mast + sail + rigging
const W7 = 3400;   // dragon prow + bow + rudder

const EASE = "cubic-bezier(.4,0,.15,1)";

/* ═══════════════════════════════════════════════════════════
   SHIP GEOMETRY
   ═══════════════════════════════════════════════════════════ */
const CX = 400;
const CY = 110;

// Hull paths — sharp at bow (right) and stern (left)
const OUTER_HULL =
  "M 20,110 C 20,40 150,5 400,5 C 650,5 780,40 780,110 C 780,180 650,215 400,215 C 150,215 20,180 20,110 Z";
const INNER_HULL =
  "M 55,110 C 55,52 165,22 400,22 C 635,22 745,52 745,110 C 745,168 635,198 400,198 C 165,198 55,168 55,110 Z";

const OUTER_LEN = 2100;
const INNER_LEN = 1850;

// Hull boundary helper — elliptical approximation
const hullY = (x: number, side: "top" | "bot"): number => {
  const rx = 380, ry = 105;
  const t = (x - CX) / rx;
  if (Math.abs(t) > 1) return CY;
  const off = ry * Math.sqrt(1 - t * t);
  return side === "top" ? CY - off : CY + off;
};

// Oar/shield X positions — 10 per side
const LOCK_XS = [120, 170, 220, 270, 320, 470, 520, 570, 620, 670];
// Shield positions — 9 per side (skip one near mast)
const SHIELD_XS = [120, 170, 220, 270, 320, 470, 520, 570, 620];

/* ═══════════════════════════════════════════════════════════
   DRAW-ON STYLE HELPER
   ═══════════════════════════════════════════════════════════ */
function drawStyle(
  pathLen: number,
  drawn: boolean,
  delay: number,
  duration = 2800
): React.CSSProperties {
  return {
    strokeDasharray: pathLen,
    strokeDashoffset: drawn ? 0 : pathLen,
    transition: `stroke-dashoffset ${duration}ms ${EASE} ${delay}ms`,
  };
}

function fadeStyle(
  drawn: boolean,
  delay: number,
  duration = 1200
): React.CSSProperties {
  return {
    opacity: drawn ? 1 : 0,
    transition: `opacity ${duration}ms ${EASE} ${delay}ms`,
  };
}

/* ═══════════════════════════════════════════════════════════
   COUNT-UP HOOK
   ═══════════════════════════════════════════════════════════ */
function useCountUp(
  target: number,
  decimals: number,
  duration: number,
  startAt: number,
  active: boolean
) {
  const [value, setValue] = useState(0);
  const raf = useRef(0);
  const easeOut = useCallback((t: number) => 1 - Math.pow(1 - t, 3), []);

  useEffect(() => {
    if (!active) return;
    const timeout = setTimeout(() => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - t0) / duration, 1);
        setValue(easeOut(p) * target);
        if (p < 1) raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    }, startAt);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf.current);
    };
  }, [active, target, duration, startAt, easeOut]);

  return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
}

/* ═══════════════════════════════════════════════════════════
   SHIP SVG
   ═══════════════════════════════════════════════════════════ */
function ShipSVG({ drawn }: { drawn: boolean }) {
  return (
    <svg
      viewBox="-30 -90 860 380"
      style={{ width: "100%", maxWidth: 860, height: "auto", display: "block", margin: "0 auto" }}
      aria-hidden="true"
    >
      {/* ── WAVE 1: Hull + Keel ── */}
      <path
        d={OUTER_HULL}
        fill="none"
        stroke={INK(0.26)}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={drawStyle(OUTER_LEN, drawn, W1, 3000)}
      />
      <path
        d={INNER_HULL}
        fill="none"
        stroke={INK(0.15)}
        strokeWidth={1.2}
        style={drawStyle(INNER_LEN, drawn, W1 + 200, 2800)}
      />
      <line
        x1={35} y1={CY} x2={765} y2={CY}
        stroke={AMBER(0.38)}
        strokeWidth={1.2}
        strokeDasharray="10 7"
        style={fadeStyle(drawn, W1 + 400, 1600)}
      />

      {/* ── WAVE 2: Planking strakes + Ribs ── */}
      {/* 6 strakes each side (12 total) */}
      {[-42, -28, -14, 14, 28, 42].map((dy, i) => {
        const shrink = Math.abs(dy) * 2.5;
        return (
          <path
            key={`strake-${i}`}
            d={`M ${75 + shrink} ${CY + dy} Q ${CX} ${CY + dy - dy * 0.15}, ${725 - shrink} ${CY + dy}`}
            fill="none"
            stroke={INK(0.09)}
            strokeWidth={0.7}
            style={drawStyle(750, drawn, W2 + i * 60, 2200)}
          />
        );
      })}
      {/* 11 internal ribs */}
      {[110, 160, 210, 260, 310, 360, 440, 490, 540, 590, 640].map((x, i) => (
        <line
          key={`rib-${i}`}
          x1={x} y1={hullY(x, "top") + 10}
          x2={x} y2={hullY(x, "bot") - 10}
          stroke={INK(0.09)}
          strokeWidth={0.5}
          style={fadeStyle(drawn, W2 + 200 + i * 40, 1000)}
        />
      ))}

      {/* ── WAVE 3: Benches + Mast step ── */}
      {/* 10 rowing benches (thwarts) */}
      {[130, 180, 230, 280, 330, 460, 510, 560, 610, 660].map((x, i) => (
        <line
          key={`bench-${i}`}
          x1={x} y1={hullY(x, "top") + 18}
          x2={x} y2={hullY(x, "bot") - 18}
          stroke={INK(0.22)}
          strokeWidth={1.4}
          strokeLinecap="round"
          style={fadeStyle(drawn, W3 + i * 50, 1000)}
        />
      ))}
      {/* Mast step */}
      <circle cx={392} cy={CY} r={14} fill="none" stroke={AMBER(0.65)} strokeWidth={1.8}
        style={fadeStyle(drawn, W3 + 300, 800)} />
      <circle cx={392} cy={CY} r={5} fill="none" stroke={AMBER(0.65)} strokeWidth={1}
        style={fadeStyle(drawn, W3 + 500, 800)} />
      <line x1={378} y1={CY} x2={406} y2={CY} stroke={AMBER(0.65)} strokeWidth={0.9}
        style={fadeStyle(drawn, W3 + 600, 600)} />
      <line x1={392} y1={CY - 14} x2={392} y2={CY + 14} stroke={AMBER(0.65)} strokeWidth={0.9}
        style={fadeStyle(drawn, W3 + 600, 600)} />

      {/* ── WAVE 4: Oar locks + Oars ── */}
      {LOCK_XS.map((x, i) => {
        const yT = hullY(x, "top") + 2;
        const yB = hullY(x, "bot") - 2;
        const d = W4 + i * 55;
        return (
          <g key={`oar-${i}`}>
            {/* Oar lock — small U shapes */}
            <path d={`M ${x - 3} ${yT + 2} L ${x - 3} ${yT - 3} L ${x + 3} ${yT - 3} L ${x + 3} ${yT + 2}`}
              fill="none" stroke={INK(0.18)} strokeWidth={0.9} strokeLinecap="round"
              style={fadeStyle(drawn, d, 800)} />
            <path d={`M ${x - 3} ${yB - 2} L ${x - 3} ${yB + 3} L ${x + 3} ${yB + 3} L ${x + 3} ${yB - 2}`}
              fill="none" stroke={INK(0.18)} strokeWidth={0.9} strokeLinecap="round"
              style={fadeStyle(drawn, d, 800)} />
            {/* Oars — angled outward */}
            <line x1={x} y1={yT} x2={x - 6} y2={yT - 52}
              stroke={INK(0.20)} strokeWidth={1} strokeLinecap="round"
              style={fadeStyle(drawn, d + 150, 1000)} />
            <line x1={x} y1={yB} x2={x - 6} y2={yB + 52}
              stroke={INK(0.20)} strokeWidth={1} strokeLinecap="round"
              style={fadeStyle(drawn, d + 150, 1000)} />
          </g>
        );
      })}

      {/* ── WAVE 5: Shields ── */}
      {SHIELD_XS.map((x, i) => {
        const yT = hullY(x, "top") - 1;
        const yB = hullY(x, "bot") + 1;
        const d = W5 + i * 50;
        return (
          <g key={`shield-${i}`}>
            <circle cx={x} cy={yT} r={10} fill={AMBER(0.05)} stroke={INK(0.22)} strokeWidth={1.2}
              style={fadeStyle(drawn, d, 900)} />
            <circle cx={x} cy={yB} r={10} fill={AMBER(0.05)} stroke={INK(0.22)} strokeWidth={1.2}
              style={fadeStyle(drawn, d, 900)} />
          </g>
        );
      })}

      {/* ── WAVE 6: Mast + Sail + Rigging ── */}
      {/* Mast pole */}
      <line x1={392} y1={CY} x2={392} y2={-60}
        stroke={INK(0.20)} strokeWidth={2}
        style={fadeStyle(drawn, W6, 1400)} />
      {/* Yard arm */}
      <line x1={330} y1={-50} x2={454} y2={-50}
        stroke={INK(0.20)} strokeWidth={2.5} strokeLinecap="round"
        style={fadeStyle(drawn, W6 + 300, 1000)} />
      {/* Sail — trapezoid */}
      <path
        d="M 345 -46 L 340 40 L 444 40 L 439 -46 Z"
        fill={AMBER(0.06)}
        stroke={AMBER(0.32)}
        strokeWidth={1}
        strokeLinejoin="round"
        style={fadeStyle(drawn, W6 + 500, 1200)}
      />
      {/* 5 sail stripes */}
      {[0, 1, 2, 3, 4].map((j) => {
        const x = 358 + j * 18;
        return (
          <line key={`stripe-${j}`}
            x1={x} y1={-42} x2={x - 1} y2={36}
            stroke={AMBER(0.22)} strokeWidth={0.7}
            style={fadeStyle(drawn, W6 + 700 + j * 60, 800)}
          />
        );
      })}
      {/* 4 rigging lines */}
      <line x1={392} y1={-55} x2={60} y2={CY - 20}
        stroke={INK(0.12)} strokeWidth={0.5}
        style={fadeStyle(drawn, W6 + 600, 1200)} />
      <line x1={392} y1={-55} x2={60} y2={CY + 20}
        stroke={INK(0.12)} strokeWidth={0.5}
        style={fadeStyle(drawn, W6 + 650, 1200)} />
      <line x1={392} y1={-55} x2={740} y2={CY - 20}
        stroke={INK(0.12)} strokeWidth={0.5}
        style={fadeStyle(drawn, W6 + 700, 1200)} />
      <line x1={392} y1={-55} x2={740} y2={CY + 20}
        stroke={INK(0.12)} strokeWidth={0.5}
        style={fadeStyle(drawn, W6 + 750, 1200)} />

      {/* ── WAVE 7: Dragon prow (right) + bow (left) + rudder ── */}
      {/* Dragon prow — stern/right */}
      <path
        d="M 780 110 C 790 98,800 78,805 58 C 810 38,812 22,808 12 C 805 5,798 4,795 10 C 792 16,798 24,805 28"
        fill="none"
        stroke={AMBER(0.85)}
        strokeWidth={2.5}
        strokeLinecap="round"
        style={drawStyle(200, drawn, W7, 2000)}
      />
      {/* Dragon bow — bow/left */}
      <path
        d="M 20 110 C 10 98,0 78,-5 58 C -10 38,-12 22,-8 12 C -5 5,2 4,5 10 C 8 16,2 24,-5 28"
        fill="none"
        stroke={AMBER(0.85)}
        strokeWidth={2.5}
        strokeLinecap="round"
        style={drawStyle(200, drawn, W7 + 200, 2000)}
      />
      {/* Steering oar / rudder */}
      <line x1={50} y1={CY + 30} x2={15} y2={CY + 100}
        stroke={INK(0.28)} strokeWidth={2} strokeLinecap="round"
        style={fadeStyle(drawn, W7 + 400, 1200)} />
      <ellipse cx={10} cy={CY + 110} rx={5} ry={14}
        fill="none" stroke={INK(0.28)} strokeWidth={1.2}
        transform={`rotate(-12 10 ${CY + 110})`}
        style={fadeStyle(drawn, W7 + 600, 1000)} />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function IslendingurBlueprint() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.12 });
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (isVisible) setDrawn(true);
  }, [isVisible]);

  // Stats — begin counting as hull draws, finish when ship completes (~5400ms)
  const lengthVal = useCountUp(23.5, 1, 5000, 400, drawn);
  const weightVal = useCountUp(25, 0, 4700, 700, drawn);
  const nailsVal  = useCountUp(5000, 0, 4400, 1000, drawn);
  const crewVal   = useCountUp(9, 0, 4100, 1300, drawn);

  const nailsFmt = parseInt(nailsVal) >= 1000
    ? parseInt(nailsVal).toLocaleString()
    : nailsVal;

  return (
    <section
      ref={ref}
      style={{
        backgroundColor: "#f5f3ee",
        padding: "56px 16px 48px",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto", textAlign: "center" }}>
        {/* Section label */}
        <p
          className="font-text"
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.22em",
            color: AMBER(0.70),
            textTransform: "uppercase",
            marginBottom: 6,
            opacity: drawn ? 1 : 0,
            transform: drawn ? "translateY(0)" : "translateY(14px)",
            transition: `opacity 900ms ${EASE}, transform 900ms ${EASE}`,
          }}
        >
          ÍSLENDINGUR · THE ICELANDIC LONGSHIP
        </p>
        <p
          className="font-text"
          style={{
            fontSize: 10,
            color: INK(0.35),
            letterSpacing: "0.08em",
            marginBottom: 48,
            opacity: drawn ? 1 : 0,
            transition: `opacity 900ms ${EASE} 200ms`,
          }}
        >
          Top-down structural overview · Built 2000 AD
        </p>

        {/* Ship */}
        <ShipSVG drawn={drawn} />

        {/* Stats */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "clamp(20px, 5vw, 72px)",
            marginTop: 52,
            flexWrap: "wrap",
          }}
        >
          {[
            { value: `${lengthVal}m`, label: "Length", delay: 400 },
            { value: `${weightVal}t`, label: "Oak & Pine", delay: 700 },
            { value: nailsFmt, label: "Iron Nails", delay: 1000 },
            { value: crewVal, label: "Crew", delay: 1300 },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                opacity: drawn ? 1 : 0,
                transform: drawn ? "translateY(0)" : "translateY(12px)",
                transition: `opacity 800ms ${EASE} ${stat.delay}ms, transform 800ms ${EASE} ${stat.delay}ms`,
                minWidth: 72,
              }}
            >
              <p
                className="font-display"
                style={{
                  fontSize: "clamp(30px, 5vw, 50px)",
                  fontWeight: 300,
                  color: "#1a1a1a",
                  lineHeight: 1.1,
                  marginBottom: 8,
                }}
              >
                {stat.value}
              </p>
              <p
                className="font-text"
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: INK(0.35),
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Quote */}
        <p
          className="font-display"
          style={{
            fontSize: "clamp(15px, 1.6vw, 18px)",
            fontStyle: "italic",
            fontWeight: 300,
            lineHeight: 1.8,
            color: INK(0.40),
            maxWidth: 520,
            margin: "44px auto 0",
            opacity: drawn ? 1 : 0,
            transform: drawn ? "translateY(0)" : "translateY(10px)",
            transition: `opacity 1200ms ${EASE} 2000ms, transform 1200ms ${EASE} 2000ms`,
          }}
        >
          Built to echo the Viking Age — traditional craftsmanship, ancient
          materials, and the spirit of the open North Atlantic.
          <br />
          Sailed from Iceland to New York in the year 2000.
        </p>
      </div>
    </section>
  );
}

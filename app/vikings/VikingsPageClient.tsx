"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import type React from "react";
import { useScrollReveal } from "@/app/components/hooks/useScrollReveal";
import VikingArsenal from "@/app/components/VikingArsenal";

/* ── Scroll-reveal helper (same pattern as Saga page) ── */
function reveal(visible: boolean, delay = 0): React.CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(28px)",
    transition: `opacity 900ms cubic-bezier(0.25,0.1,0.25,1) ${delay}ms, transform 900ms cubic-bezier(0.25,0.1,0.25,1) ${delay}ms`,
  };
}

/* ── Curator-verified fact data ── */
const FACTS: {
  tag: string;
  hook: string;
  detail: string;
  connection: string;
}[] = [
  {
    tag: "NORTH AMERICA",
    hook: "Vikings reached North America 500 years before Columbus.",
    detail:
      "Around 1000\u00a0AD, Leif Eriksson was blown off course sailing to Greenland and became probably the first European to set foot on American soil. He named his discovery V\u00ednland \u2014 \u2018Wineland\u2019 \u2014 for the vines and grapes he found there. The settlement he built, Leifsb\u00fa\u00f0ir, is believed to be L\u2019Anse aux Meadows in Newfoundland, now a UNESCO World Heritage Site.",
    connection:
      "In 2000, the \u00cdslendingur \u2014 the replica Viking ship now docked at V\u00edkingaheimar \u2014 retraced Leif Eriksson\u2019s route from Iceland to New York. No GPS, no engine. Just wool sails and navigation by the stars.",
  },
  {
    tag: "EAST TO CONSTANTINOPLE",
    hook: "While some Vikings sailed west, others reached Constantinople and became the Emperor\u2019s personal bodyguard.",
    detail:
      "Swedish Vikings pushed east along the Baltic, founded Novgorod in the 9th century, captured Kiev, and travelled the river Dnieper all the way to Constantinople \u2014 which they called Miklagarður. In 839\u00a0AD, the Emperor founded the Varangian Guard, an elite force composed solely of Viking warriors.",
    connection:
      "The Varangian Guard endured for almost four centuries, finally dissolving after the Fourth Crusade in 1204 \u2014 proof that the Viking reach stretched far beyond Scandinavia.",
  },
  {
    tag: "THE SHIPS",
    hook: "Viking ships could sail shallow rivers as easily as open oceans \u2014 and be dragged overland between waterways.",
    detail:
      "Clinker-built with flexible hulls, their boards fastened with bindings and wooden nails so the hull could move with the sea. Powered by sail at speeds of 6 to 17\u00a0mph, they could aquaplane in strong wind, navigate shallow rivers for inland raids, and be drawn across land between rivers.",
    connection:
      "The \u00cdslendingur at V\u00edkingaheimar is a direct replica of the Gokstad ship \u2014 23.5 metres long, 18 tonnes, held together by 5,000 hand-forged iron nails. She is docked here. You can board her.",
  },
  {
    tag: "THE WOMEN",
    hook: "Viking women made every sail that crossed the Atlantic \u2014 and then sailed under them to the New World.",
    detail:
      "Norse women cooked, spun, wove, sewed, and brewed \u2014 and crucially, they made the sails that powered every expedition. Gudrid Thorbjornsdottir travelled to Vinland with her husband Thorfinn Karlsefni. Her descendants included several Icelandic bishops.",
    connection:
      "Axes have been found in female Viking grave sites \u2014 a reminder that women in Norse society were far more than the stereotypes suggest.",
  },
  {
    tag: "ICELAND",
    hook: "Iceland has no prehistory \u2014 it was a blank page until the Vikings chose to write on it.",
    detail:
      "In 874\u00a0AD, Ing\u00f3lfur Arnarson became Iceland\u2019s first permanent Nordic settler, naming his homestead Reykjav\u00edk. Over 400 settlers followed, mostly from Norway. By 930\u00a0AD they had founded the Althing at Thingvellir \u2014 a parliament with legislative and judicial power.",
    connection:
      "Right here on the Reykjanes peninsula, the Vogur settlement near Hafnir preserves an 18-metre Viking longhouse. At nearby Hafurbjarnasta\u00f0ir, a chieftain was buried with his sword, axe, dog and horse.",
  },
  {
    tag: "THE SAGAS",
    hook: "The Vikings didn\u2019t just conquer \u2014 they wrote it all down, and Europe had no idea for 600 years.",
    detail:
      "Between the 12th and 14th centuries, Iceland produced a unique outpouring of literary creativity: Nj\u00e1l\u2019s Saga, Snorri Sturluson\u2019s Heimskringla, the heroic poems of the Edda, and Erik the Red\u2019s Saga. While European manuscripts were in Latin, Icelandic sagas preserved tales of everyday people in their own language.",
    connection:
      "These sagas remained completely unknown in Europe until the 17th century \u2014 centuries of extraordinary storytelling hidden in plain sight on a remote island in the North Atlantic.",
  },
];

/* ── Map destinations ── */
const MAP_DESTINATIONS: {
  id: string;
  label: string;
  fact: string;
  cx: number;
  cy: number;
}[] = [
  { id: "iceland", label: "Iceland", fact: "Settled 874 AD \u2014 a blank page in the Atlantic", cx: 355, cy: 138 },
  { id: "greenland", label: "Greenland", fact: "Settled 980 AD by Erik the Red", cx: 290, cy: 115 },
  { id: "vinland", label: "L\u2019Anse aux Meadows", fact: "Leif Eriksson\u2019s Vinland \u2014 UNESCO World Heritage Site", cx: 215, cy: 175 },
  { id: "scandinavia", label: "Scandinavia", fact: "Origin of all Viking expeditions", cx: 410, cy: 125 },
  { id: "dublin", label: "Dublin", fact: "Founded by Vikings in the 830s", cx: 375, cy: 160 },
  { id: "york", label: "York", fact: "Founded by Vikings in 876", cx: 390, cy: 155 },
  { id: "normandy", label: "Normandy", fact: "Given to Viking leader Rollo by the French King", cx: 395, cy: 175 },
  { id: "novgorod", label: "Novgorod", fact: "Founded by Swedish Vikings in the 9th century", cx: 470, cy: 130 },
  { id: "kiev", label: "Kiev", fact: "Captured by Vikings \u2014 879 AD", cx: 475, cy: 155 },
  { id: "constantinople", label: "Constantinople", fact: "Miklagarður \u2014 home of the Varangian Guard", cx: 480, cy: 185 },
  { id: "baghdad", label: "Baghdad", fact: "Eastern terminus of Viking trade routes", cx: 520, cy: 200 },
  { id: "sicily", label: "Sicily", fact: "Norman-Viking expansion into the Mediterranean", cx: 430, cy: 195 },
];

const ROUTE_PATHS = [
  // West: Scandinavia → Iceland → Greenland → Vinland
  "M410,125 C390,128 370,132 355,138 C330,130 310,120 290,115 C260,130 230,160 215,175",
  // East: Scandinavia → Novgorod → Kiev → Constantinople → Baghdad
  "M410,125 C430,125 450,128 470,130 C472,140 474,148 475,155 C478,168 479,178 480,185 C495,190 508,195 520,200",
  // South: Scandinavia → Dublin → York → Normandy → Sicily
  "M410,125 C400,135 390,148 375,160 C382,155 386,153 390,155 C392,162 393,168 395,175 C408,182 420,190 430,195",
];

/* ── Fact section component ── */
function FactSection({
  fact,
  index,
}: {
  fact: (typeof FACTS)[number];
  index: number;
}) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.12 });
  const isReversed = index % 2 === 1;

  return (
    <section
      ref={ref}
      style={{
        padding: "clamp(80px, 12vh, 140px) 0",
        borderTop: index > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "0 32px",
          display: "flex",
          flexDirection: isReversed ? "row-reverse" : "row",
          flexWrap: "wrap",
          gap: "clamp(32px, 5vw, 80px)",
          alignItems: "center",
        }}
      >
        {/* Text column */}
        <div style={{ flex: "1 1 480px", minWidth: 280 }}>
          {/* Tag */}
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
              ...reveal(isVisible, 0),
            }}
          >
            {fact.tag}
          </span>

          {/* Hook */}
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(28px, 3.5vw, 48px)",
              fontWeight: 300,
              lineHeight: 1.15,
              color: "#ffffff",
              marginBottom: 20,
              ...reveal(isVisible, 80),
            }}
          >
            {fact.hook}
          </h2>

          {/* Accent line */}
          <div
            aria-hidden="true"
            style={{
              width: isVisible ? 56 : 0,
              height: 2,
              backgroundColor: "#c8874a",
              marginBottom: 28,
              transition: "width 600ms cubic-bezier(0.25,0.1,0.25,1) 200ms",
            }}
          />

          {/* Detail */}
          <p
            className="font-text"
            style={{
              fontSize: 16,
              lineHeight: 1.8,
              color: "rgba(255,255,255,0.55)",
              maxWidth: 560,
              marginBottom: 20,
              ...reveal(isVisible, 200),
            }}
          >
            {fact.detail}
          </p>

          {/* Connection */}
          <p
            className="font-text"
            style={{
              fontSize: 15,
              lineHeight: 1.8,
              color: "rgba(255,255,255,0.40)",
              fontStyle: "italic",
              maxWidth: 560,
              ...reveal(isVisible, 300),
            }}
          >
            {fact.connection}
          </p>
        </div>

        {/* Visual accent column — large faded number */}
        <div
          style={{
            flex: "0 0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 120,
            ...reveal(isVisible, 150),
          }}
        >
          <span
            className="font-display"
            aria-hidden="true"
            style={{
              fontSize: "clamp(100px, 14vw, 200px)",
              fontWeight: 300,
              color: "rgba(200,135,74,0.06)",
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}

/* ── World map section component ── */
function WorldReachMap() {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.15 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section
      ref={ref}
      style={{
        padding: "clamp(80px, 12vh, 140px) 0",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 32px" }}>
        {/* Title */}
        <h2
          className="font-display"
          style={{
            fontSize: "clamp(36px, 5vw, 64px)",
            fontWeight: 300,
            color: "#ffffff",
            textAlign: "center",
            marginBottom: 16,
            ...reveal(isVisible, 0),
          }}
        >
          From Newfoundland to Baghdad.
        </h2>
        <p
          className="font-text"
          style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.40)",
            textAlign: "center",
            marginBottom: 64,
            ...reveal(isVisible, 100),
          }}
        >
          Three centuries of expansion. Every line a voyage. Every dot a settlement.
        </p>

        {/* SVG Map */}
        <div style={{ position: "relative", ...reveal(isVisible, 200) }}>
          <svg
            viewBox="0 0 700 320"
            style={{ width: "100%", height: "auto" }}
            aria-label="Map of Viking expansion routes from Scandinavia"
            role="img"
          >
            {/* Simplified landmass outlines */}
            <defs>
              <style>{`
                .route-line {
                  stroke: #c8874a;
                  stroke-width: 1.5;
                  fill: none;
                  opacity: 0.5;
                  stroke-dasharray: 1000;
                  stroke-dashoffset: ${isVisible ? 0 : 1000};
                  transition: stroke-dashoffset 3s cubic-bezier(0.25,0.1,0.25,1);
                }
                .land {
                  fill: rgba(255,255,255,0.03);
                  stroke: rgba(255,255,255,0.06);
                  stroke-width: 0.5;
                }
                @keyframes dotPulse {
                  0%, 100% { r: 3; opacity: 0.7; }
                  50% { r: 5; opacity: 1; }
                }
                .dot-pulse {
                  animation: dotPulse 2.5s ease-in-out infinite;
                }
              `}</style>
            </defs>

            {/* Simplified continents */}
            {/* Europe */}
            <path className="land" d="M370,120 L420,110 L450,115 L460,130 L470,145 L450,170 L440,190 L430,200 L420,195 L400,190 L390,180 L375,170 L365,165 L360,155 L365,140 Z" />
            {/* Scandinavia */}
            <path className="land" d="M395,90 L410,85 L425,90 L430,105 L425,120 L415,125 L405,120 L395,110 Z" />
            {/* British Isles */}
            <path className="land" d="M365,140 L375,135 L380,145 L378,155 L370,158 L365,150 Z" />
            {/* Iceland */}
            <path className="land" d="M345,130 L360,128 L363,135 L355,140 L345,138 Z" />
            {/* Greenland */}
            <path className="land" d="M270,80 L300,75 L310,90 L305,110 L290,120 L275,115 L265,100 Z" />
            {/* North America */}
            <path className="land" d="M140,130 L180,120 L220,125 L240,140 L250,165 L240,190 L220,200 L190,205 L160,195 L140,180 L130,160 Z" />
            {/* Russia / Eastern Europe */}
            <path className="land" d="M460,100 L510,95 L540,105 L550,130 L540,155 L520,165 L490,160 L470,145 L460,130 Z" />
            {/* Middle East */}
            <path className="land" d="M490,180 L530,175 L550,190 L540,210 L520,215 L500,210 L490,195 Z" />
            {/* North Africa / Mediterranean */}
            <path className="land" d="M370,200 L420,198 L450,205 L480,200 L490,210 L470,220 L440,225 L400,222 L375,215 Z" />

            {/* Route lines */}
            {ROUTE_PATHS.map((d, i) => (
              <path key={i} className="route-line" d={d} style={{ transitionDelay: `${i * 400}ms` }} />
            ))}

            {/* Destination dots */}
            {MAP_DESTINATIONS.map((dest) => (
              <g key={dest.id}>
                <circle
                  className={isVisible ? "dot-pulse" : ""}
                  cx={dest.cx}
                  cy={dest.cy}
                  r={3}
                  fill="#c8874a"
                  style={{
                    animationDelay: `${Math.random() * 2}s`,
                    cursor: "pointer",
                    transition: "r 200ms",
                  }}
                  onMouseEnter={() => setHoveredId(dest.id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
                {/* Label on hover */}
                {hoveredId === dest.id && (
                  <g>
                    <rect
                      x={dest.cx - 90}
                      y={dest.cy - 42}
                      width={180}
                      height={36}
                      rx={4}
                      fill="rgba(10,10,10,0.92)"
                      stroke="rgba(200,135,74,0.3)"
                      strokeWidth={0.5}
                    />
                    <text
                      x={dest.cx}
                      y={dest.cy - 28}
                      textAnchor="middle"
                      fill="#c8874a"
                      fontSize="8"
                      fontWeight="600"
                      letterSpacing="0.1em"
                      fontFamily="var(--font-text)"
                    >
                      {dest.label.toUpperCase()}
                    </text>
                    <text
                      x={dest.cx}
                      y={dest.cy - 16}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.6)"
                      fontSize="6.5"
                      fontFamily="var(--font-text)"
                    >
                      {dest.fact}
                    </text>
                  </g>
                )}
              </g>
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}

/* ── Hero word-by-word animation ── */
function HeroHeadline() {
  const words = ["You", "had", "no", "idea", "how", "far", "they", "went."];
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <h1
      className="font-display"
      style={{
        fontSize: "clamp(40px, 6vw, 80px)",
        fontWeight: 300,
        lineHeight: 1.1,
        letterSpacing: "-0.02em",
        color: "#ffffff",
        maxWidth: 800,
        margin: "0 auto",
      }}
    >
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            marginRight: "0.3em",
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(20px)",
            transition: `opacity 500ms ease ${400 + i * 120}ms, transform 500ms ease ${400 + i * 120}ms`,
          }}
        >
          {word}
        </span>
      ))}
    </h1>
  );
}

/* ── Main page component ── */
export default function VikingsPageClient() {
  const { ref: bridgeRef, isVisible: bridgeVisible } =
    useScrollReveal<HTMLDivElement>();
  const { ref: ctaRef, isVisible: ctaVisible } =
    useScrollReveal<HTMLDivElement>();
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ backgroundColor: "#0d0c0a" }}>
      {/* ═══════════════════════════════════════════════════════════════
          1. HERO
          ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "120px 32px 80px",
          overflow: "hidden",
        }}
      >
        {/* Faint world map background */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: heroReady ? 0.04 : 0,
            transition: "opacity 2s ease 600ms",
            pointerEvents: "none",
          }}
        >
          <svg viewBox="0 0 700 320" style={{ width: "90%", maxWidth: 1200, height: "auto" }}>
            <path
              d="M370,120 L420,110 L450,115 L460,130 L470,145 L450,170 L440,190 L430,200 L420,195 L400,190 L390,180 L375,170 L365,165 L360,155 L365,140 Z"
              fill="none"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="0.5"
            />
            <path
              d="M395,90 L410,85 L425,90 L430,105 L425,120 L415,125 L405,120 L395,110 Z"
              fill="none"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="0.5"
            />
            <path
              d="M365,140 L375,135 L380,145 L378,155 L370,158 L365,150 Z"
              fill="none"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="0.5"
            />
            <path
              d="M345,130 L360,128 L363,135 L355,140 L345,138 Z"
              fill="none"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="0.5"
            />
            <path
              d="M270,80 L300,75 L310,90 L305,110 L290,120 L275,115 L265,100 Z"
              fill="none"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="0.5"
            />
            <path
              d="M140,130 L180,120 L220,125 L240,140 L250,165 L240,190 L220,200 L190,205 L160,195 L140,180 L130,160 Z"
              fill="none"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="0.5"
            />
            <path
              d="M460,100 L510,95 L540,105 L550,130 L540,155 L520,165 L490,160 L470,145 L460,130 Z"
              fill="none"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="0.5"
            />
            <path
              d="M490,180 L530,175 L550,190 L540,210 L520,215 L500,210 L490,195 Z"
              fill="none"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="0.5"
            />
          </svg>
        </div>

        {/* Overline */}
        <span
          className="font-text"
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#c8874a",
            marginBottom: 32,
            opacity: heroReady ? 1 : 0,
            transition: "opacity 800ms ease 200ms",
          }}
        >
          THE VIKINGS
        </span>

        {/* Headline — word by word */}
        <HeroHeadline />

        {/* Subtext */}
        <p
          className="font-text"
          style={{
            marginTop: 32,
            fontSize: "clamp(16px, 1.6vw, 20px)",
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.45)",
            maxWidth: 600,
            opacity: heroReady ? 1 : 0,
            transform: heroReady ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 900ms ease 1800ms, transform 900ms ease 1800ms",
          }}
        >
          Not raiders. Not myths. The most far-ranging civilization the medieval world ever produced.
        </p>

        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: "50%",
            transform: "translateX(-50%)",
            opacity: heroReady ? 1 : 0,
            transition: "opacity 600ms ease 2400ms",
            animation: "vikingScrollPulse 2.4s ease-in-out infinite",
          }}
        >
          <svg width="20" height="32" viewBox="0 0 20 32" fill="none" aria-hidden="true">
            <path
              d="M10 0 L10 28 M2 20 L10 28 L18 20"
              stroke="rgba(200,135,74,0.4)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          1b. VIKING ARSENAL — animated weapon showcase
          ═══════════════════════════════════════════════════════════════ */}
      <VikingArsenal />

      {/* ═══════════════════════════════════════════════════════════════
          2. FACT SECTIONS
          ═══════════════════════════════════════════════════════════════ */}
      {FACTS.map((fact, i) => (
        <FactSection key={fact.tag} fact={fact} index={i} />
      ))}

      {/* ═══════════════════════════════════════════════════════════════
          3. WORLD REACH MAP
          ═══════════════════════════════════════════════════════════════ */}
      <WorldReachMap />

      {/* ═══════════════════════════════════════════════════════════════
          4. THE ÍSLENDINGUR BRIDGE
          ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "clamp(100px, 14vh, 180px) 0",
          borderTop: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div
          ref={bridgeRef}
          style={{
            maxWidth: 720,
            margin: "0 auto",
            textAlign: "center",
            padding: "0 32px",
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
              marginBottom: 24,
              ...reveal(bridgeVisible, 0),
            }}
          >
            THE \u00cdSLENDINGUR
          </span>

          <h2
            className="font-display"
            style={{
              fontSize: "clamp(36px, 5vw, 72px)",
              fontWeight: 300,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              marginBottom: 32,
              ...reveal(bridgeVisible, 100),
            }}
          >
            The ship that proved them right.
          </h2>

          <p
            className="font-text"
            style={{
              fontSize: 17,
              lineHeight: 1.8,
              color: "rgba(255,255,255,0.45)",
              maxWidth: 560,
              margin: "0 auto 48px",
              ...reveal(bridgeVisible, 200),
            }}
          >
            A full-scale replica of the Gokstad ship. Built in Njar\u00f0v\u00edk.
            Sailed to New York in 2000 \u2014 no GPS, no engine, just wool sails
            and the stars. She is here. You can board her.
          </p>

          <div style={reveal(bridgeVisible, 350)}>
            <Link
              href="/saga"
              className="font-text"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "16px 40px",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#c8874a",
                border: "1px solid rgba(200,135,74,0.35)",
                borderRadius: 2,
                textDecoration: "none",
                background: "transparent",
                transition: "all 300ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(200,135,74,0.08)";
                e.currentTarget.style.borderColor = "#c8874a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(200,135,74,0.35)";
              }}
            >
              Meet the \u00cdslendingur
              <span style={{ marginLeft: 10, fontSize: 14 }}>&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          5. CTA FOOTER
          ═══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "clamp(100px, 14vh, 180px) 0",
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
              fontSize: "clamp(42px, 6vw, 80px)",
              fontWeight: 300,
              lineHeight: 0.95,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              ...reveal(ctaVisible, 0),
            }}
          >
            See it for yourself.
          </h2>

          <p
            className="font-text"
            style={{
              marginTop: 24,
              fontSize: "clamp(16px, 1.8vw, 20px)",
              fontWeight: 400,
              color: "rgba(255,255,255,0.40)",
              lineHeight: 1.6,
              ...reveal(ctaVisible, 100),
            }}
          >
            V\u00edkingaheimar. Njar\u00f0v\u00edk, Iceland. Open year-round.
          </p>

          <div
            style={{
              marginTop: 48,
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              justifyContent: "center",
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
                color: "#0d0c0a",
                padding: "18px 44px",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                borderRadius: 2,
                border: "none",
                textDecoration: "none",
                transition: "background 250ms, transform 250ms",
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
              Book Your Raid
            </Link>

          </div>
        </div>
      </section>

      {/* Scroll pulse keyframe */}
      <style>{`
        @keyframes vikingScrollPulse {
          0%, 100% { opacity: 0.4; transform: translateX(-50%) translateY(0); }
          50% { opacity: 1; transform: translateX(-50%) translateY(8px); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="vikingScrollPulse"] { animation: none !important; opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

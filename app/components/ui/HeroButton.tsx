"use client";

import Link from "next/link";
import { useRef, useCallback, useId } from "react";

type HeroButtonVariant = "amber" | "frost";

interface HeroButtonProps {
  href: string;
  label: string;
  onClick?: () => void;
  variant?: HeroButtonVariant;
}

const HEX_POINTS = "18,0 302,0 320,34 302,68 18,68 0,34";
const SVG_W = 320;
const SVG_H = 68;

const PALETTES = {
  amber: {
    fill: "#c8922a",
    fillHover: "#e0a832",
    stroke: "#f0c060",
    glow: "#c8922a",
    glowHover: "#f0c060",
    text: "#1a0f02",
    runeIdle: "rgba(26,15,2,0.5)",
    runeHover: "rgba(26,15,2,0.9)",
    accent: "rgba(26,15,2,0.12)",
    embers: ["#f0c060", "#e87020"],
    focus: "#f0c060",
  },
  frost: {
    fill: "rgba(78,168,222,0.15)",
    fillHover: "rgba(78,168,222,0.28)",
    stroke: "#4ea8de",
    glow: "#4ea8de",
    glowHover: "#67c8f0",
    text: "rgba(255,255,255,0.85)",
    runeIdle: "rgba(78,168,222,0.45)",
    runeHover: "rgba(78,168,222,0.9)",
    accent: "rgba(78,168,222,0.18)",
    embers: ["#67c8f0", "#4ea8de"],
    focus: "#4ea8de",
  },
} as const;

function spawnEmbers(svg: SVGSVGElement, colors: readonly string[]) {
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      const cx = 30 + Math.random() * 260;
      const cy = 20 + Math.random() * 30;
      const r = 1.5 + Math.random() * 2;
      const color = colors[i % 2];
      const drift = (Math.random() - 0.5) * 0.8;

      circle.setAttribute("cx", String(cx));
      circle.setAttribute("cy", String(cy));
      circle.setAttribute("r", String(r));
      circle.setAttribute("fill", color);
      circle.style.pointerEvents = "none";

      svg.appendChild(circle);

      let opacity = 1;
      let currentCy = cy;

      function animate() {
        opacity -= 0.035;
        currentCy -= 0.6;
        const currentCx = parseFloat(circle.getAttribute("cx")!) + drift;

        if (opacity <= 0) {
          circle.remove();
          return;
        }

        circle.setAttribute("cy", String(currentCy));
        circle.setAttribute("cx", String(currentCx));
        circle.setAttribute("opacity", String(opacity));
        requestAnimationFrame(animate);
      }

      requestAnimationFrame(animate);
    }, i * 60);
  }
}

export default function HeroButton({ href, label, onClick, variant = "amber" }: HeroButtonProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const uid = useId().replace(/:/g, "");
  const p = PALETTES[variant];
  const cls = `hex-${uid}`;
  const filterId = `hex-glow-${uid}`;

  const handleMouseEnter = useCallback(() => {
    if (svgRef.current) spawnEmbers(svgRef.current, p.embers);
  }, [p.embers]);

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={`${label} — Vikingaheimar`}
      className={cls}
      onMouseEnter={handleMouseEnter}
    >
      <svg
        ref={svgRef}
        className={`${cls}-svg`}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <polygon className={`${cls}-glow`} points={HEX_POINTS} filter={`url(#${filterId})`} />
        <polygon className={`${cls}-fill`} points={HEX_POINTS} />
        <polygon className={`${cls}-stroke`} points={HEX_POINTS} />

        <line x1="18" y1="2" x2="36" y2="2" className={`${cls}-accent`} />
        <line x1="284" y1="2" x2="302" y2="2" className={`${cls}-accent`} />
        <line x1="18" y1="66" x2="36" y2="66" className={`${cls}-accent`} />
        <line x1="284" y1="66" x2="302" y2="66" className={`${cls}-accent`} />
      </svg>

      <span className={`${cls}-rune ${cls}-rune-l`}>&#5798;</span>
      <span className={`${cls}-label`}>{label}</span>
      <span className={`${cls}-rune ${cls}-rune-r`}>&#5798;</span>

      <style>{`
        .${cls} {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 68px;
          padding: 0 52px;
          text-decoration: none;
          cursor: pointer;
          isolation: isolate;
        }

        .${cls}-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          overflow: visible;
        }

        .${cls}-glow {
          fill: ${p.glow};
          opacity: 0.35;
          transition: opacity 0.4s ease, fill 0.4s ease;
        }
        .${cls}:hover .${cls}-glow {
          fill: ${p.glowHover};
          opacity: 0.55;
        }

        .${cls}-fill {
          fill: ${p.fill};
          transition: fill 0.3s ease;
        }
        .${cls}:hover .${cls}-fill {
          fill: ${p.fillHover};
        }

        .${cls}-stroke {
          fill: none;
          stroke: ${p.stroke};
          stroke-width: 1.5;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .${cls}:hover .${cls}-stroke {
          opacity: 1;
        }

        .${cls}-accent {
          stroke: ${p.accent};
          stroke-width: 1;
        }

        .${cls}-label {
          position: relative;
          z-index: 2;
          font-family: var(--font-display), 'Norse', serif;
          font-size: 15px;
          font-weight: 400;
          letter-spacing: 0.22em;
          color: ${p.text};
          text-transform: uppercase;
          line-height: 1;
        }

        .${cls}-rune {
          position: relative;
          z-index: 2;
          font-size: 16px;
          color: ${p.runeIdle};
          transition: color 0.4s ease, transform 0.4s ease;
          line-height: 1;
        }
        .${cls}-rune-l { margin-right: 10px; }
        .${cls}-rune-r { margin-left: 10px; }

        .${cls}:hover .${cls}-rune {
          color: ${p.runeHover};
        }
        .${cls}:hover .${cls}-rune-l {
          transform: scale(1.15) translateX(-3px);
        }
        .${cls}:hover .${cls}-rune-r {
          transform: scale(1.15) translateX(3px);
        }

        .${cls}:focus-visible {
          outline: 2px solid ${p.focus};
          outline-offset: 4px;
          border-radius: 2px;
        }

        @media (hover: none) {
          .${cls}-fill { fill: ${p.fillHover}; }
          .${cls}-stroke { opacity: 1; }
          .${cls}-rune { color: ${p.runeHover}; }
          .${cls}-rune-l { transform: scale(1.15) translateX(-3px); }
          .${cls}-rune-r { transform: scale(1.15) translateX(3px); }
          .${cls}-glow { fill: ${p.glowHover}; opacity: 0.55; }
        }
      `}</style>
    </Link>
  );
}

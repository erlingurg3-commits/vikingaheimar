"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

type Phase = "hidden" | "walk" | "idle";

export default function GunnbjornWalkOn() {
  const [phase, setPhase] = useState<Phase>("hidden");

  useEffect(() => {
    // sessionStorage, not localStorage — changed 2026-09-01.
    //
    // localStorage meant "once per browser, forever": a visitor saw the
    // walk-on exactly once and every later visit got the standing pose. The
    // walk is the point of the character, so it should greet each new visit.
    // sessionStorage replays it per tab session while still not repeating on
    // in-tab navigation back to the homepage.
    let seen = false;
    try {
      seen = sessionStorage.getItem("vh_gunnbjorn_seen") === "1";
    } catch {}
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (seen || reduce) {
      setPhase("idle");
    } else {
      setPhase("walk");
      try {
        sessionStorage.setItem("vh_gunnbjorn_seen", "1");
      } catch {}
    }
  }, []);

  if (phase === "hidden") return null;

  return (
    <Link
      href="/vikings#gunnbjorn"
      aria-label="Meet Gunnbjörn — open the Vikings page"
      onClick={() => trackEvent("gunnbjorn_walkon_click", { source: "homepage" })}
      className={`gwo-root ${phase === "walk" ? "gwo-run" : "gwo-idle"}`}
    >
      <span className="gwo-shadow" aria-hidden="true" />
      <svg className="gwo-svg" viewBox="0 0 150 300" role="img" aria-label="Gunnbjörn the Viking">
        <defs>
          <pattern id="gwo-mail" width="8" height="7" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="3.5" r="3" fill="none" stroke="#b9c2cf" strokeWidth="0.8" opacity="0.45" />
            <circle cx="0" cy="0" r="3" fill="none" stroke="#b9c2cf" strokeWidth="0.8" opacity="0.45" />
            <circle cx="8" cy="0" r="3" fill="none" stroke="#b9c2cf" strokeWidth="0.8" opacity="0.45" />
            <circle cx="0" cy="7" r="3" fill="none" stroke="#b9c2cf" strokeWidth="0.8" opacity="0.45" />
            <circle cx="8" cy="7" r="3" fill="none" stroke="#b9c2cf" strokeWidth="0.8" opacity="0.45" />
          </pattern>
          <clipPath id="gwo-scl"><circle cx="34" cy="168" r="27" /></clipPath>
        </defs>

        <g className="gwo-figure">
          <path d="M52 116 C40 130 36 200 44 260 L58 262 C52 210 54 150 62 126 Z" fill="#3a2820" stroke="#1a0e05" strokeWidth="1.5" opacity="0.85" />
          <path d="M98 116 C110 130 114 200 106 260 L92 262 C98 210 96 150 88 126 Z" fill="#3a2820" stroke="#1a0e05" strokeWidth="1.5" opacity="0.85" />

          <g className="gwo-leg gwo-legBack">
            <rect x="60" y="196" width="20" height="80" rx="6" fill="#5a4530" stroke="#1a0e05" strokeWidth="1.5" />
            <rect x="56" y="272" width="28" height="13" rx="3" fill="#5a3a18" stroke="#1a0e05" strokeWidth="1.5" />
          </g>

          <g className="gwo-arm gwo-armShield">
            <rect x="30" y="120" width="20" height="40" rx="8" fill="#6a4a2a" stroke="#1a0e05" strokeWidth="1.5" />
          </g>

          <g className="gwo-torso">
            <rect x="47" y="112" width="56" height="92" rx="9" fill="#4a3a28" stroke="#1a0e05" strokeWidth="1.6" />
            <rect x="47" y="112" width="56" height="92" rx="9" fill="url(#gwo-mail)" />
            <rect x="45" y="192" width="60" height="15" rx="3" fill="#3a2010" stroke="#1a0e05" strokeWidth="1.6" />
            <rect x="66" y="189" width="18" height="21" rx="2.5" fill="#d4a843" stroke="#8a5a10" strokeWidth="1.4" />
          </g>

          <g className="gwo-leg gwo-legFront">
            <rect x="72" y="196" width="20" height="80" rx="6" fill="#6a4a2a" stroke="#1a0e05" strokeWidth="1.5" />
            <rect x="68" y="272" width="28" height="13" rx="3" fill="#5a3a18" stroke="#1a0e05" strokeWidth="1.5" />
          </g>

          <g className="gwo-arm gwo-armAxe">
            <rect x="100" y="120" width="20" height="40" rx="8" fill="#6a4a2a" stroke="#1a0e05" strokeWidth="1.5" />
            <line x1="114" y1="128" x2="114" y2="214" stroke="#8a5a2a" strokeWidth="5" strokeLinecap="round" />
            <path d="M114 126 L132 118 C142 115 149 122 145 131 L138 149 C135 156 127 159 121 156 L114 152 Z" fill="#7a8a9a" stroke="#1a0e05" strokeWidth="1.8" />
          </g>

          <g className="gwo-head">
            <rect x="66" y="96" width="18" height="18" rx="5" fill="#e8dcc8" stroke="#1a0e05" strokeWidth="1.4" />
            <ellipse cx="75" cy="74" rx="21" ry="25" fill="#e8dcc8" stroke="#1a0e05" strokeWidth="1.8" />
            <path d="M53 78 C53 50 62 34 75 30 C88 34 97 50 97 78" fill="#7a8a9a" stroke="#1a0e05" strokeWidth="1.8" />
            <path d="M53 78 L97 78" stroke="#1a0e05" strokeWidth="3" />
            <line x1="75" y1="30" x2="75" y2="88" stroke="#1a0e05" strokeWidth="2.4" />
            <g className="gwo-eyes">
              <circle cx="67" cy="76" r="3" fill="#00d4ff" />
              <circle cx="83" cy="76" r="3" fill="#00d4ff" />
            </g>
            <path d="M58 92 C55 108 55 122 62 132 C68 138 75 140 75 140 C75 140 82 138 88 132 C95 122 95 108 92 92" fill="#8a6a3a" stroke="#1a0e05" strokeWidth="1.5" />
            <circle cx="75" cy="120" r="6" fill="none" stroke="#d4a843" strokeWidth="2" />
          </g>

          <g className="gwo-shield">
            <g clipPath="url(#gwo-scl)">
              <rect x="7" y="141" width="54" height="54" fill="#8a6a3a" />
              <rect x="7" y="141" width="9" height="54" fill="#7a5a2a" />
              <rect x="25" y="141" width="9" height="54" fill="#7a5a2a" />
              <rect x="43" y="141" width="9" height="54" fill="#7a5a2a" />
            </g>
            <circle cx="34" cy="168" r="27" fill="none" stroke="#7a8a9a" strokeWidth="5" />
            <circle cx="34" cy="168" r="7" fill="#7a8a9a" stroke="#1a0e05" strokeWidth="1.4" />
          </g>
        </g>
      </svg>
      <span className="gwo-label">
        Hello dear visitor! Have a question? <strong>Click me</strong>
      </span>

      <style>{`
        .gwo-root{position:fixed;left:20px;bottom:18px;width:130px;height:260px;z-index:40;display:block;text-decoration:none;cursor:pointer}
        .gwo-svg{width:100%;height:100%;display:block;overflow:visible}
        .gwo-shadow{position:absolute;left:18px;bottom:2px;width:86px;height:14px;border-radius:50%;background:radial-gradient(closest-side,rgba(0,212,255,0.26),transparent);filter:blur(1px)}
        .gwo-figure{transform-box:fill-box;transform-origin:center bottom}
        .gwo-leg{transform-box:fill-box;transform-origin:top center}
        .gwo-arm{transform-box:fill-box;transform-origin:top center}
        .gwo-eyes{animation:gwoGlow 1.7s ease-in-out infinite}
        /* Speech bubble beside his head, with a tail pointing back at him. */
        .gwo-label{position:absolute;left:100px;top:26px;width:186px;font-size:12.5px;line-height:1.45;font-weight:500;color:#0d0c0a;background:#d4a843;padding:8px 11px;border-radius:8px;pointer-events:none;box-shadow:0 3px 10px rgba(0,0,0,.45)}
        .gwo-label strong{font-weight:700}
        .gwo-label::after{content:"";position:absolute;left:-6px;top:16px;width:0;height:0;border-top:6px solid transparent;border-bottom:6px solid transparent;border-right:7px solid #d4a843}

        /* walk-on (first visit) */
        .gwo-run{transform:translateX(-260px);animation:gwoWalkIn 3.3s cubic-bezier(.22,.61,.36,1) forwards}
        .gwo-run .gwo-figure{animation:gwoBob .55s ease-in-out 0s 6 both, gwoBreathe 4s ease-in-out 3.3s infinite}
        .gwo-run .gwo-legFront{animation:gwoMarch .55s ease-in-out 0s 6 both}
        .gwo-run .gwo-legBack{animation:gwoMarchRev .55s ease-in-out 0s 6 both}
        .gwo-run .gwo-armAxe{animation:gwoSwing .55s ease-in-out 0s 6 both}
        .gwo-run .gwo-armShield{animation:gwoSwingRev .55s ease-in-out 0s 6 both}
        .gwo-run .gwo-shadow{animation:gwoShadow .55s ease-in-out 0s 6 both}
        .gwo-run .gwo-label{opacity:0;animation:gwoLabelIn .5s ease 3.35s forwards}

        /* idle (returning visitor / reduced motion) */
        .gwo-idle .gwo-figure{animation:gwoBreathe 4s ease-in-out infinite}
        .gwo-idle .gwo-label{opacity:1}

        .gwo-root:hover .gwo-figure{animation:gwoBreathe 2.4s ease-in-out infinite}

        @keyframes gwoWalkIn{from{transform:translateX(-260px)}to{transform:translateX(0)}}
        @keyframes gwoBob{0%{transform:translateY(0)}25%{transform:translateY(-5px)}50%{transform:translateY(0)}75%{transform:translateY(-5px)}100%{transform:translateY(0)}}
        @keyframes gwoBreathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
        @keyframes gwoMarch{0%{transform:translateY(0) rotate(0)}25%{transform:translateY(-10px) rotate(-6deg)}50%{transform:translateY(0) rotate(0)}75%{transform:translateY(0) rotate(4deg)}100%{transform:translateY(0) rotate(0)}}
        @keyframes gwoMarchRev{0%{transform:translateY(0) rotate(0)}25%{transform:translateY(0) rotate(4deg)}50%{transform:translateY(0) rotate(0)}75%{transform:translateY(-10px) rotate(-6deg)}100%{transform:translateY(0) rotate(0)}}
        @keyframes gwoSwing{0%{transform:rotate(0)}25%{transform:rotate(9deg)}50%{transform:rotate(0)}75%{transform:rotate(-9deg)}100%{transform:rotate(0)}}
        @keyframes gwoSwingRev{0%{transform:rotate(0)}25%{transform:rotate(-7deg)}50%{transform:rotate(0)}75%{transform:rotate(7deg)}100%{transform:rotate(0)}}
        @keyframes gwoShadow{0%,50%,100%{transform:scaleX(1);opacity:.26}25%,75%{transform:scaleX(.86);opacity:.18}}
        @keyframes gwoGlow{0%,100%{opacity:.65}50%{opacity:1}}
        @keyframes gwoLabelIn{to{opacity:1}}

        @media (max-width:639px){
          .gwo-root{left:10px;bottom:10px;width:92px;height:184px}
          .gwo-label{display:none}
        }
        @media (prefers-reduced-motion:reduce){
          .gwo-run{transform:translateX(0);animation:none}
          .gwo-run .gwo-figure,.gwo-run .gwo-legFront,.gwo-run .gwo-legBack,
          .gwo-run .gwo-armAxe,.gwo-run .gwo-armShield,.gwo-run .gwo-shadow{animation:none}
          .gwo-run .gwo-label{opacity:1;animation:none}
        }
      `}</style>
    </Link>
  );
}

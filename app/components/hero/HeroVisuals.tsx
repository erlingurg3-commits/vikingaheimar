"use client";

/**
 * Rune Pattern SVG Component
 * Subtle Nordic rune pattern overlay
 */

export function RunePattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-5 pointer-events-none"
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="runes"
          x="0"
          y="0"
          width="200"
          height="200"
          patternUnits="userSpaceOnUse"
        >
          {/* ᚠ - Fehu (Wealth) */}
          <text
            x="10"
            y="40"
            fontSize="48"
            fontFamily="Norse, serif"
            fill="#4ea8de"
            opacity="0.3"
          >
            ᚠ
          </text>

          {/* ᚢ - Uruz (Strength) */}
          <text
            x="10"
            y="120"
            fontSize="48"
            fontFamily="Norse, serif"
            fill="#4ea8de"
            opacity="0.3"
          >
            ᚢ
          </text>

          {/* ᚦ - Thurisaz (Gateway) */}
          <text
            x="110"
            y="80"
            fontSize="48"
            fontFamily="Norse, serif"
            fill="#4ea8de"
            opacity="0.3"
          >
            ᚦ
          </text>
        </pattern>
      </defs>

      <rect width="1200" height="600" fill="url(#runes)" />
    </svg>
  );
}

/**
 * Animated Scroll Indicator
 * Subtle cue for users to scroll down
 */
export function ScrollIndicator() {
  return (
    <div
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"
      role="presentation"
    >
      <span className="text-xs font-text font-medium uppercase tracking-widest text-neutral-300">
        Scroll
      </span>

      {/* Animated arrow */}
      <div
        className="w-6 h-6 flex items-center justify-center animate-bounce"
        aria-hidden="true"
      >
        <svg
          className="w-5 h-5 text-accent-frost-blue"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
}

export default RunePattern;

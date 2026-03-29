/**
 * AxeDivider — full-width decorative section break.
 * Renders a thin rule on each side of a crossed-axes SVG motif.
 *
 * Purely presentational, aria-hidden.
 * The opacity-70 class keeps it understated.
 */
export default function AxeDivider() {
  return (
    <div
      className="flex items-center w-full py-2 opacity-70"
      aria-hidden="true"
      role="separator"
    >
      {/* Left rule */}
      <div
        className="flex-grow h-px"
        style={{ backgroundColor: "#d4d0c8" }}
      />

      {/* Centre — crossed axes motif */}
      <svg
        viewBox="0 0 48 48"
        width="48"
        height="48"
        fill="none"
        stroke="#c9893f"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mx-3 shrink-0"
      >
        {/* Axe 1 — handle ╲ */}
        <line x1="8" y1="8" x2="40" y2="40" />
        {/* Axe 1 — blade (top-left) */}
        <path d="M 8,8 Q 14,2 18,4 L 20,14 Z" />

        {/* Axe 2 — handle ╱ */}
        <line x1="40" y1="8" x2="8" y2="40" />
        {/* Axe 2 — blade (top-right) */}
        <path d="M 40,8 Q 46,12 44,18 L 34,20 Z" />

        {/* Centre diamond */}
        <polygon
          points="24,20 28,24 24,28 20,24"
          fill="rgba(201,137,63,0.3)"
          stroke="#c9893f"
        />
      </svg>

      {/* Right rule */}
      <div
        className="flex-grow h-px"
        style={{ backgroundColor: "#d4d0c8" }}
      />
    </div>
  );
}

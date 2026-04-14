"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * IslendingurRouteMap — scroll-driven background
 *
 * Transparent SVG overlaid behind the entire booking page.
 * Ship advances along the route as the visitor scrolls the page.
 * Reykjavík → Greenland → L'Anse aux Meadows → New York.
 *
 * Performance: uses direct DOM mutation via refs instead of setState
 * to avoid React re-renders on every scroll frame.
 */

const WAYPOINTS: {
  x: number;
  y: number;
  label: string;
  sublabel?: string;
  anchor: "start" | "end";
  dx: number;
  dy: number;
}[] = [
  { x: 429, y: 79, label: "Reykjavík", anchor: "end", dx: -8, dy: 4 },
  { x: 260, y: 320, label: "Grænland", sublabel: "Brattahlíð", anchor: "start", dx: 10, dy: 5 },
  { x: 340, y: 620, label: "L'Anse aux Meadows", anchor: "start", dx: 10, dy: -6 },
  { x: 240, y: 940, label: "New York", anchor: "end", dx: -10, dy: 5 },
];

const ROUTE_PATH =
  "M 429,79 C 400,160 290,220 260,320 C 220,420 310,520 340,620 C 370,720 300,840 240,940";

const ROUTE_LENGTH = 1050;
const WP_THRESHOLDS = [0, 0.25, 0.55, 0.85];
// Compress the voyage so the ship arrives in New York well before the page ends.
// At this fraction of page scroll, progress along the route = 1 (ship docked).
const VOYAGE_COMPLETE_AT = 0.80;

export default function IslendingurRouteMap() {
  const pathRef = useRef<SVGPathElement>(null);
  const tracedPathRef = useRef<SVGPathElement>(null);
  const shipRef = useRef<SVGGElement>(null);
  const statueRef = useRef<SVGGElement>(null);
  const wpGroupRefs = useRef<(SVGGElement | null)[]>([]);
  const wpDotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const wpRingRefs = useRef<(SVGCircleElement | null)[]>([]);
  const wpLabelRefs = useRef<(SVGTextElement | null)[]>([]);

  const updateFromScroll = useCallback(() => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const rawProgress = docH <= 0 ? 0 : Math.max(0, Math.min(1, window.scrollY / docH));
    // Remap scroll so the voyage finishes at VOYAGE_COMPLETE_AT instead of 1.0
    const progress = Math.min(rawProgress / VOYAGE_COMPLETE_AT, 1);

    // Update traced path dash offset
    if (tracedPathRef.current) {
      tracedPathRef.current.style.strokeDashoffset = String(ROUTE_LENGTH * (1 - progress));
    }

    // Update ship position
    if (pathRef.current && shipRef.current) {
      const len = pathRef.current.getTotalLength();
      const point = pathRef.current.getPointAtLength(progress * len);
      const delta = Math.min(progress * len + 2, len);
      const point2 = pathRef.current.getPointAtLength(delta);
      const angle = Math.atan2(point2.y - point.y, point2.x - point.x) * (180 / Math.PI);
      shipRef.current.setAttribute(
        "transform",
        `translate(${point.x}, ${point.y}) rotate(${angle})`,
      );
      shipRef.current.style.opacity = progress < 0.98 ? "1" : "0";
    }

    // Fade in the Statue of Liberty as the ship reaches New York
    if (statueRef.current) {
      const nyThreshold = WP_THRESHOLDS[3]; // 0.85
      // 0 below threshold → 1 when progress reaches 1 (fully docked)
      const fade = Math.max(0, Math.min(1, (progress - nyThreshold) / (1 - nyThreshold)));
      statueRef.current.style.opacity = String(fade);
    }

    // Update waypoint visibility
    for (let i = 0; i < WAYPOINTS.length; i++) {
      const reached = progress >= WP_THRESHOLDS[i];
      const group = wpGroupRefs.current[i];
      const dot = wpDotRefs.current[i];
      const ring = wpRingRefs.current[i];
      const label = wpLabelRefs.current[i];
      if (group) group.style.opacity = reached ? "1" : "0.2";
      if (dot) dot.setAttribute("fill", reached ? "#c8874a" : "#d4cec4");
      if (ring) ring.style.opacity = reached ? "0.4" : "0.1";
      if (label) label.style.opacity = reached ? "0.7" : "0.2";
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", updateFromScroll, { passive: true });
    updateFromScroll();
    return () => window.removeEventListener("scroll", updateFromScroll);
  }, [updateFromScroll]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <svg
        viewBox="0 0 600 1060"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMin slice"
        style={{ width: "100%", height: "100%", display: "block" }}
        aria-hidden="true"
      >
        <defs>
          <filter id="rm-ship-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Recolour any image's alpha silhouette in amber (#c8874a) */}
          <filter id="rm-amber-tint">
            <feFlood floodColor="#c8874a" result="flood" />
            <feComposite in="flood" in2="SourceAlpha" operator="in" />
          </filter>
          {/* Same trick, but in the cream coastline tone */}
          <filter id="rm-coast-tint">
            <feFlood floodColor="#e8e2d8" result="flood" />
            <feComposite in="flood" in2="SourceAlpha" operator="in" />
          </filter>
        </defs>

        {/* ── Subtle latitude lines ── */}
        <g stroke="#d4d0c8" strokeWidth="0.5" opacity="0.25">
          <line x1="0" y1="200" x2="600" y2="200" />
          <line x1="0" y1="450" x2="600" y2="450" />
          <line x1="0" y1="700" x2="600" y2="700" />
          <line x1="0" y1="900" x2="600" y2="900" />
        </g>

        {/* ── Coastlines — realistic outlines (Natural Earth) ── */}
        <g fill="#e8e2d8" stroke="#d4cec4" strokeWidth="0.5" opacity="0.6" strokeLinejoin="round">

          {/* Iceland — Natural Earth 50m simplified (112 pts) */}
          <g transform="translate(388,22) scale(0.29)">
            <path d="M485.2,34.3 L535.9,20.2 L519,29.1 L508,45.9 L530.5,53.5 L531,64.9 L523.5,77.1 L546.9,75 L550.8,84.5 L542.5,94.6 L558.9,88.4 L588.3,99.8 L578.3,114.9 L587.1,122.3 L581,129.9 L591.5,136.2 L589.3,144.4 L575.7,148.4 L575.7,160.4 L565.5,171.5 L547.2,171.2 L544.7,190.3 L534.2,201.6 L469.7,223.7 L426.4,252.4 L363.4,266.5 L356.4,282.9 L318.6,294.8 L235.8,281 L220,268.9 L227,261.7 L224.3,258 L211.6,264.2 L187.2,245.6 L104.3,255.9 L101.7,232.3 L112,240.8 L129.2,236.4 L168,205 L136.4,211 L144.6,203.9 L139.2,201.9 L141.9,192.5 L161.2,182.2 L133.6,190.8 L121.9,182.4 L126,172.9 L114.3,166.6 L67.1,163.9 L41.8,171.8 L30.7,160.3 L97.1,143.4 L145.1,143.2 L151.1,130.4 L137.1,136.1 L112,129.5 L147.6,106.4 L90.9,94.1 L37.5,110.1 L6.7,99.2 L18.8,90.9 L39.8,98 L27.2,76 L52.7,85 L70.4,78.5 L41.1,69.3 L57.6,66.5 L44.1,53.8 L62.4,53.1 L53.6,45.3 L61.5,38.7 L82.4,47.4 L84.7,57 L103.9,53 L106.3,67.6 L115.6,63.8 L115.4,48.9 L88.5,35.7 L113.3,30.8 L79.4,24.1 L91.6,14.7 L116.5,15.7 L171.1,53 L165.2,58.4 L176.3,65 L172.8,79.2 L157.6,80.9 L173.3,94.3 L169.7,103.9 L180.5,108.9 L185.9,123.1 L203.3,88.9 L222.1,95 L227.3,81.3 L227.3,52.3 L235.3,46.1 L273.8,76.8 L279.5,48.4 L308.3,38.4 L346,79.9 L348.3,71.1 L337.7,40.9 L358.6,42.2 L377.7,58.7 L398.9,36.7 L415.8,43.8 L434.7,37.3 L437.8,29.7 L431.7,14.1 L447.4,7.1 L461.5,7.9 L485.2,34.3 Z" />
          </g>

          {/* Greenland — real silhouette from /greenland.png, tinted cream.
             Positioned so the southern tip lands on the Grænland waypoint (260, 320). */}
          <image
            href="/greenland.png"
            x={180}
            y={145}
            width={160}
            height={175}
            preserveAspectRatio="xMidYMid meet"
            opacity={0.75}
            filter="url(#rm-coast-tint)"
          />

          {/* Eastern Canada — real silhouette from /canada.png, tinted cream.
             Positioned so the L'Anse aux Meadows mark aligns with the waypoint (340, 620). */}
          <image
            href="/canada.png"
            x={155}
            y={475}
            width={260}
            height={248}
            preserveAspectRatio="xMidYMid meet"
            opacity={0.75}
            filter="url(#rm-coast-tint)"
          />

          {/* New York State — real silhouette from /new-york.png, tinted cream.
             Positioned so NYC (bottom-right tip) aligns with the waypoint (240, 940). */}
          <image
            href="/new-york.png"
            x={118}
            y={824}
            width={160}
            height={124}
            preserveAspectRatio="xMidYMid meet"
            opacity={0.75}
            filter="url(#rm-coast-tint)"
          />
        </g>

        {/* ── Full route (ghost path, always visible) ── */}
        <path
          d={ROUTE_PATH}
          fill="none"
          stroke="#c8874a"
          strokeWidth="1"
          strokeDasharray="4 6"
          strokeLinecap="round"
          opacity="0.12"
        />

        {/* ── Traced route (draws as you scroll) ── */}
        <path
          ref={(el) => {
            tracedPathRef.current = el;
            // Also store as pathRef for getPointAtLength calculations
            pathRef.current = el;
          }}
          d={ROUTE_PATH}
          fill="none"
          stroke="#c8874a"
          strokeWidth="2"
          strokeDasharray={ROUTE_LENGTH}
          strokeDashoffset={ROUTE_LENGTH}
          strokeLinecap="round"
          opacity="0.55"
          style={{ transition: "stroke-dashoffset 0.06s linear" }}
        />

        {/* ── Waypoint dots + labels ── */}
        {WAYPOINTS.map((wp, i) => (
          <g
            key={wp.label}
            ref={(el) => { wpGroupRefs.current[i] = el; }}
            style={{ opacity: 0.2, transition: "opacity 0.6s ease" }}
          >
            <circle
              ref={(el) => { wpRingRefs.current[i] = el; }}
              cx={wp.x}
              cy={wp.y}
              r="8"
              fill="none"
              stroke="#c8874a"
              strokeWidth="1"
              style={{ opacity: 0.1, transition: "opacity 0.6s ease" }}
            />
            <circle
              ref={(el) => { wpDotRefs.current[i] = el; }}
              cx={wp.x}
              cy={wp.y}
              r="3"
              fill="#d4cec4"
              style={{ transition: "fill 0.4s ease" }}
            />
            <text
              ref={(el) => { wpLabelRefs.current[i] = el; }}
              x={wp.x + wp.dx}
              y={wp.y + wp.dy}
              textAnchor={wp.anchor}
              fill="#7a7672"
              fontSize="10"
              fontFamily="var(--font-text), system-ui, sans-serif"
              fontWeight="500"
              letterSpacing="0.03em"
              style={{ opacity: 0.2, transition: "opacity 0.6s ease" }}
            >
              <tspan x={wp.x + wp.dx}>{wp.label}</tspan>
              {wp.sublabel && (
                <tspan
                  x={wp.x + wp.dx}
                  dy="11"
                  fontSize="8"
                  fontStyle="italic"
                  fill="#9a938a"
                >
                  {wp.sublabel}
                </tspan>
              )}
            </text>
          </g>
        ))}

        {/* ── Statue of Liberty — fades in at New York ── */}
        <g
          ref={statueRef}
          style={{ opacity: 0, transition: "opacity 0.5s ease" }}
        >
          <image
            href="/statue-of-liberty.png"
            x={260}
            y={875}
            width={60}
            height={60}
            preserveAspectRatio="xMidYMax meet"
            opacity={0.45}
            filter="url(#rm-amber-tint)"
          />
        </g>

        {/* ── Sailing ship ── */}
        <g
          ref={shipRef}
          filter="url(#rm-ship-glow)"
          transform={`translate(${WAYPOINTS[0].x}, ${WAYPOINTS[0].y}) rotate(0)`}
          style={{ opacity: 1, transition: "opacity 0.4s ease" }}
        >
          <g transform="translate(-18,-16) scale(0.65)">
            {/* Hull */}
            <path
              d="M 0,20 C 4,8 14,2 28,2 C 42,2 52,8 56,20 C 52,26 42,30 28,30 C 14,30 4,26 0,20 Z"
              fill="rgba(200,135,74,0.08)"
              stroke="#c8874a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Mast */}
            <line
              x1="28" y1="4" x2="28" y2="-30"
              stroke="#c8874a"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            {/* Sail */}
            <path
              d="M 28,-28 C 40,-24 48,-14 48,-4 L 28,-2 Z"
              fill="rgba(200,135,74,0.12)"
              stroke="#c8874a"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Bow ornament */}
            <path
              d="M 56,20 C 62,14 64,6 62,0"
              fill="none"
              stroke="#c8874a"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            {/* Stern ornament */}
            <path
              d="M 0,20 C -6,14 -8,6 -6,0"
              fill="none"
              stroke="#c8874a"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </g>
        </g>

        {/* ── Voyage label ── */}
        <text
          x="300"
          y="1030"
          textAnchor="middle"
          fill="#c8874a"
          fontSize="9"
          fontFamily="var(--font-text), system-ui, sans-serif"
          fontWeight="600"
          letterSpacing="0.18em"
          opacity="0.3"
        >
          THE VOYAGE OF ÍSLENDINGUR
        </text>
      </svg>
    </div>
  );
}

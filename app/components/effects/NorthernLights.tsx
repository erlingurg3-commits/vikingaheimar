"use client";

import { useEffect, useRef, useState } from "react";

/**
 * NorthernLights — realistic aurora borealis canvas animation.
 *
 * Draws multiple translucent curtain bands that sway, ripple, and pulse
 * with colours true to the real aurora: greens, teals, soft violets.
 * Runs at ~30fps to stay light. Respects prefers-reduced-motion.
 *
 * position: absolute, inset: 0 — parent must be position:relative overflow:hidden.
 */

interface Band {
  /** Vertical centre as fraction of canvas height (0–1) */
  y: number;
  /** Vertical thickness as fraction of canvas height */
  height: number;
  /** Hue in degrees — aurora greens (120–160) or violet (270–290) */
  hue: number;
  /** Base saturation 0–100 */
  saturation: number;
  /** Base lightness 0–100 */
  lightness: number;
  /** Peak alpha */
  alpha: number;
  /** Sway speed multiplier */
  speed: number;
  /** Phase offset so bands don't move in unison */
  phase: number;
  /** Number of wave ripples across the width */
  ripples: number;
  /** Ripple amplitude in px */
  rippleAmp: number;
}

const BANDS: Band[] = [
  // Primary green curtain — brightest, spans the middle
  {
    y: 0.4,
    height: 0.55,
    hue: 135,
    saturation: 70,
    lightness: 55,
    alpha: 0.18,
    speed: 0.4,
    phase: 0,
    ripples: 3,
    rippleAmp: 22,
  },
  // Teal-green, upper half
  {
    y: 0.3,
    height: 0.45,
    hue: 155,
    saturation: 60,
    lightness: 50,
    alpha: 0.12,
    speed: 0.3,
    phase: 1.8,
    ripples: 4,
    rippleAmp: 18,
  },
  // Deeper green, wide wash across most of banner
  {
    y: 0.5,
    height: 0.65,
    hue: 125,
    saturation: 55,
    lightness: 45,
    alpha: 0.09,
    speed: 0.25,
    phase: 3.5,
    ripples: 2.5,
    rippleAmp: 26,
  },
  // Violet fringe — upper edge
  {
    y: 0.18,
    height: 0.35,
    hue: 280,
    saturation: 45,
    lightness: 50,
    alpha: 0.07,
    speed: 0.35,
    phase: 2.2,
    ripples: 3.5,
    rippleAmp: 14,
  },
  // Pink-violet lower reach
  {
    y: 0.7,
    height: 0.35,
    hue: 290,
    saturation: 35,
    lightness: 55,
    alpha: 0.06,
    speed: 0.2,
    phase: 4.0,
    ripples: 2,
    rippleAmp: 16,
  },
];

/** Number of vertical columns to sample per band for the curtain shape */
const COLUMNS = 64;

export default function NorthernLights() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let animFrame: number;
    let lastTime = 0;
    const FPS_INTERVAL = 1000 / 30; // cap at ~30fps

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    const draw = (now: number) => {
      animFrame = requestAnimationFrame(draw);

      // Throttle to ~30fps
      if (now - lastTime < FPS_INTERVAL) return;
      lastTime = now;

      const t = now * 0.001; // seconds

      ctx.clearRect(0, 0, w, h);

      for (const band of BANDS) {
        // Global sway: the whole curtain shifts left/right slowly
        const sway = Math.sin(t * band.speed + band.phase) * 40;

        // Pulsing brightness
        const pulse =
          0.7 +
          0.3 * Math.sin(t * band.speed * 0.6 + band.phase * 1.3);

        const colWidth = w / COLUMNS;

        for (let i = 0; i < COLUMNS; i++) {
          const xFrac = i / COLUMNS;
          const x = i * colWidth + sway;

          // Ripple: vertical offset per column
          const rippleOffset =
            Math.sin(xFrac * Math.PI * 2 * band.ripples + t * band.speed * 1.5 + band.phase) *
            band.rippleAmp;

          // Column-local brightness variation (shimmer)
          const shimmer =
            0.6 +
            0.4 *
              Math.sin(
                xFrac * Math.PI * 7 + t * 1.2 + band.phase
              );

          const centerY = band.y * h + rippleOffset;
          const bandH = band.height * h * (0.8 + 0.2 * shimmer);

          // Vertical gradient for this column
          const grad = ctx.createLinearGradient(
            x,
            centerY - bandH / 2,
            x,
            centerY + bandH / 2
          );

          const a = band.alpha * pulse * shimmer;
          const l = band.lightness + 10 * shimmer;

          grad.addColorStop(
            0,
            `hsla(${band.hue}, ${band.saturation}%, ${l}%, 0)`
          );
          grad.addColorStop(
            0.3,
            `hsla(${band.hue}, ${band.saturation}%, ${l}%, ${a * 0.6})`
          );
          grad.addColorStop(
            0.5,
            `hsla(${band.hue}, ${band.saturation}%, ${l}%, ${a})`
          );
          grad.addColorStop(
            0.7,
            `hsla(${band.hue}, ${band.saturation}%, ${l}%, ${a * 0.6})`
          );
          grad.addColorStop(
            1,
            `hsla(${band.hue}, ${band.saturation}%, ${l}%, 0)`
          );

          ctx.fillStyle = grad;
          ctx.fillRect(x, centerY - bandH / 2, colWidth + 1, bandH);
        }
      }
    };

    animFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, [reducedMotion]);

  // Reduced motion: show a static faint green glow
  if (reducedMotion) {
    return (
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 1,
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(100,200,140,0.08) 0%, transparent 70%)",
        }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
        filter: "blur(5px)",
      }}
    />
  );
}

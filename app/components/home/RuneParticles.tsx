"use client";

import { useEffect, useRef, useState } from "react";

// Extended Elder Futhark rune set
const RUNES = ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᛁ", "ᛃ", "ᛇ"];

// Heritage amber — rgba(201, 137, 63, 0.7) per spec
const RUNE_FILL = "rgba(201,137,63,0.7)";

interface RuneState {
  x: number;        // fractional (0–1) of canvas width
  y: number;        // current y in px
  char: string;
  opacity: number;  // 0.04–0.09
  speed: number;    // upward drift px/frame (0.15–0.35)
  size: number;     // font size in px (14–28)
  phase: number;
  phaseSpeed: number;
}

/**
 * RuneParticles — purely decorative animated Norse runes drifting upward.
 * Fixed canvas at z-index 1, pointer-events none.
 * Returns null when prefers-reduced-motion is set.
 */
export default function RuneParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPrefersReduced(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  useEffect(() => {
    if (!mounted || prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Seed 10 particles
    const runes: RuneState[] = Array.from({ length: 10 }, (_, i) => ({
      x: Math.random(),
      y: Math.random() * window.innerHeight,
      char: RUNES[i % RUNES.length],
      opacity: 0.04 + Math.random() * 0.05,       // 0.04–0.09
      speed: 0.15 + Math.random() * 0.20,          // 0.15–0.35 px/frame
      size: 14 + Math.floor(Math.random() * 15),   // 14–28px
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.002 + Math.random() * 0.003,
    }));

    let animFrame: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const rune of runes) {
        // Drift upward
        rune.y -= rune.speed;
        if (rune.y < -rune.size - 10) {
          rune.y = canvas.height + rune.size;
          rune.x = Math.random();
        }

        // Oscillate opacity gently
        rune.phase += rune.phaseSpeed;
        const osc = (Math.sin(rune.phase) + 1) / 2;
        const alpha = rune.opacity * (0.4 + 0.6 * osc);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = RUNE_FILL;
        ctx.font = `${rune.size}px var(--font-display, serif)`;
        ctx.fillText(rune.char, rune.x * canvas.width, rune.y);
        ctx.restore();
      }

      animFrame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, [mounted, prefersReduced]);

  if (!mounted || prefersReduced) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}

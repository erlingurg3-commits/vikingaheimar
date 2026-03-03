'use client';

/**
 * ScrollLine — La Linea storytelling animation
 *
 * A single continuous line travels down the left side of the viewport
 * as the visitor scrolls. At key scroll positions it morphs into a Viking
 * object (axe, ship, sword, shield, rune) before dissolving back into a
 * travelling line.
 *
 * Rules:
 *  - pointer-events: none on the canvas — never blocks any click
 *  - Canvas sits at z-index 5 (above bg, below nav at z-1025)
 *  - Mobile (<768px): opacity 0.3, no shape morphing — just the line
 *  - Respects prefers-reduced-motion: freezes animation, keeps line visible
 */

import { useEffect } from 'react';

export default function ScrollLine() {
  useEffect(() => {
    const canvas = document.getElementById('line-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    // Cast to non-nullable — TypeScript can't narrow `ctx` across closure
    // boundaries; the runtime guard above makes this safe.
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    if (!ctx) return;

    // ------------------------------------------------------------------
    // Respect prefers-reduced-motion
    // ------------------------------------------------------------------
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W: number, H: number;
    let scrollY = 0;
    let targetScrollY = 0;
    let animFrame: number;

    // ------------------------------------------------------------------
    // Resize handler
    // ------------------------------------------------------------------
    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();

    const onScroll = () => {
      targetScrollY = window.scrollY;
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    // ------------------------------------------------------------------
    // Shape definitions
    // Points are [x, y] normalised 0–1; rendered relative to a centre
    // point at a given screen-fraction position.
    // ------------------------------------------------------------------
    type ShapeDef = { points: number[][]; size: number; label: string; glow: boolean };

    const shapes: Record<string, ShapeDef> = {
      line: {
        points: [
          [0, 0.5],
          [0.2, 0.35],
          [0.4, 0.65],
          [0.6, 0.35],
          [0.8, 0.65],
          [1, 0.5],
        ],
        size: 100,
        label: '',
        glow: false,
      },
      axe: {
        points: [
          [0.5, 1],
          [0.5, 0.42],
          [0.5, 0.42],
          [0.18, 0.18],
          [0.12, 0.06],
          [0.32, 0.12],
          [0.5, 0.18],
          [0.5, 0.18],
          [0.68, 0.12],
          [0.88, 0.06],
          [0.82, 0.18],
          [0.5, 0.42],
        ],
        size: 130,
        label: 'AXE',
        glow: true,
      },
      sword: {
        points: [
          [0.5, 0.02],
          [0.5, 0.72],
          [0.14, 0.58],
          [0.86, 0.58],
          [0.5, 0.58],
          [0.5, 0.72],
          [0.38, 0.85],
          [0.62, 0.85],
          [0.6, 1],
          [0.4, 1],
          [0.38, 0.85],
        ],
        size: 150,
        label: 'SWORD',
        glow: true,
      },
      ship: {
        points: [
          [0.05, 0.55],
          [0.1, 0.68],
          [0.9, 0.68],
          [0.95, 0.55],
          [0.9, 0.68],
          [0.85, 0.82],
          [0.15, 0.82],
          [0.1, 0.68],
          [0.5, 0.82],
          [0.5, 0.18],
          [0.5, 0.22],
          [0.73, 0.36],
          [0.71, 0.62],
          [0.5, 0.68],
          [0.29, 0.62],
          [0.27, 0.36],
          [0.5, 0.22],
          [0.05, 0.55],
          [0.07, 0.38],
          [0.16, 0.22],
          [0.95, 0.55],
          [0.93, 0.38],
          [0.84, 0.22],
        ],
        size: 180,
        label: 'ÍSLENDINGUR',
        glow: true,
      },
      shield: {
        points: [
          [0.5, 0.03],
          [0.93, 0.26],
          [0.93, 0.62],
          [0.5, 0.97],
          [0.07, 0.62],
          [0.07, 0.26],
          [0.5, 0.03],
          [0.5, 0.03],
          [0.5, 0.97],
          [0.07, 0.44],
          [0.93, 0.44],
        ],
        size: 125,
        label: 'SHIELD',
        glow: true,
      },
      rune: {
        points: [
          [0.38, 0.05],
          [0.38, 0.95],
          [0.38, 0.22],
          [0.72, 0.38],
          [0.68, 0.54],
          [0.38, 0.54],
          [0.38, 0.4],
          [0.7, 0.56],
        ],
        size: 90,
        label: 'ᚠ FEHU',
        glow: true,
      },
    };

    // ------------------------------------------------------------------
    // Timeline — scroll fraction 0–1 → shape + screen position
    // ------------------------------------------------------------------
    type TimelineEntry = { at: number; shape: string; cx: number; cy: number };

    const timeline: TimelineEntry[] = [
      { at: 0.0,  shape: 'line',   cx: 0.08, cy: 0.5  },
      { at: 0.15, shape: 'axe',    cx: 0.08, cy: 0.48 },
      { at: 0.25, shape: 'line',   cx: 0.08, cy: 0.5  },
      { at: 0.35, shape: 'ship',   cx: 0.08, cy: 0.48 },
      { at: 0.48, shape: 'line',   cx: 0.08, cy: 0.5  },
      { at: 0.58, shape: 'sword',  cx: 0.08, cy: 0.48 },
      { at: 0.70, shape: 'line',   cx: 0.08, cy: 0.5  },
      { at: 0.82, shape: 'shield', cx: 0.08, cy: 0.48 },
      { at: 0.92, shape: 'line',   cx: 0.08, cy: 0.5  },
      { at: 1.0,  shape: 'rune',   cx: 0.08, cy: 0.5  },
    ];

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------
    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    function easeInOut(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function getPoints(
      shapeKey: string,
      cx: number,
      cy: number,
      size: number,
    ): number[][] {
      return shapes[shapeKey].points.map(([x, y]) => [
        cx * W + (x - 0.5) * size,
        cy * H + (y - 0.5) * size,
      ]);
    }

    function getState(frac: number): { prev: TimelineEntry; next: TimelineEntry; t: number } {
      let prev = timeline[0];
      let next = timeline[1];
      for (let i = 0; i < timeline.length - 1; i++) {
        if (frac >= timeline[i].at && frac <= timeline[i + 1].at) {
          prev = timeline[i];
          next = timeline[i + 1];
          break;
        }
      }
      if (frac >= timeline[timeline.length - 1].at) {
        prev = next = timeline[timeline.length - 1];
      }
      const range = next.at - prev.at;
      const t = easeInOut(range > 0 ? Math.min(1, (frac - prev.at) / range) : 1);
      return { prev, next, t };
    }

    // ------------------------------------------------------------------
    // Draw
    // ------------------------------------------------------------------
    function draw() {
      ctx.clearRect(0, 0, W, H);

      const isMobile = W < 768;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      const frac = maxScroll > 0 ? Math.min(1, scrollY / maxScroll) : 0;
      const { prev, next, t } = getState(frac);

      // On mobile — just draw travelling line, no morphing
      const effectiveNext = isMobile ? { ...next, shape: 'line' } : next;
      const effectivePrev = isMobile ? { ...prev, shape: 'line' } : prev;

      const pPts = getPoints(effectivePrev.shape, prev.cx, prev.cy, shapes[effectivePrev.shape].size);
      const nPts = getPoints(effectiveNext.shape, next.cx, next.cy, shapes[effectiveNext.shape].size);

      const maxLen = Math.max(pPts.length, nPts.length);
      while (pPts.length < maxLen) pPts.push([...pPts[pPts.length - 1]]);
      while (nPts.length < maxLen) nPts.push([...nPts[nPts.length - 1]]);

      const pts = pPts.map(([x, y], i) => [lerp(x, nPts[i][0], t), lerp(y, nPts[i][1], t)]);

      const isShaping = !isMobile && t > 0.5 && next.shape !== 'line';
      const glowIntensity = isShaping ? Math.min(1, (t - 0.5) * 2) : 0;

      // Mobile dimming
      const baseOpacity = isMobile ? 0.3 : 0.55;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 2;

      if (glowIntensity > 0.1) {
        ctx.shadowColor = '#7dd3fc';
        ctx.shadowBlur = 6 * glowIntensity;
        ctx.strokeStyle = `rgba(240,237,230,${baseOpacity + glowIntensity * 0.4})`;
      } else {
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(240,237,230,${baseOpacity})`;
      }

      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) {
        if (i < pts.length - 1) {
          const mx = (pts[i][0] + pts[i + 1][0]) / 2;
          const my = (pts[i][1] + pts[i + 1][1]) / 2;
          ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
        } else {
          ctx.lineTo(pts[i][0], pts[i][1]);
        }
      }
      ctx.stroke();

      // Shape label — only on desktop and when fully formed
      if (!isMobile && isShaping && glowIntensity > 0.6) {
        const activeShape = next.shape;
        const labelText = shapes[activeShape].label;
        if (labelText) {
          const lx = next.cx * W;
          const ly = next.cy * H + shapes[activeShape].size * 0.62;
          ctx.globalAlpha = (glowIntensity - 0.6) * 2.5;
          ctx.font = '8px serif';
          ctx.fillStyle = '#7dd3fc';
          ctx.textAlign = 'center';
          ctx.fillText(labelText, lx, ly);
        }
      }

      ctx.restore();
    }

    // ------------------------------------------------------------------
    // Animation loop — skip smooth interpolation if reduced motion
    // ------------------------------------------------------------------
    function tick() {
      if (!reducedMotion) {
        scrollY += (targetScrollY - scrollY) * 0.08;
      } else {
        // Snap immediately — keep line visible but static
        scrollY = targetScrollY;
      }
      draw();
      animFrame = requestAnimationFrame(tick);
    }

    tick();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return null;
}

"use client";

import type React from "react";

/**
 * HeroFog — absolute-positioned mist layer inside the hero section.
 * position: absolute, inset: 0, zIndex: 8, pointerEvents: none.
 *
 * Four blobs rendered from config data. No JS state — always rendered.
 * The fogDrift keyframe is defined in globals.css.
 * prefers-reduced-motion: fog-drift classes in globals.css suppress animation.
 */

type BlobConfig = React.CSSProperties;

const blobs: BlobConfig[] = [
  {
    width: "60vw",
    height: "40vh",
    top: "-10%",
    left: "-20%",
    animation: "fogDrift 28s ease-in-out infinite",
  },
  {
    width: "50vw",
    height: "35vh",
    top: "20%",
    right: "-15%",
    animation: "fogDrift 36s ease-in-out infinite reverse",
  },
  {
    width: "70vw",
    height: "30vh",
    bottom: "10%",
    left: "10%",
    animation: "fogDrift 44s ease-in-out 8s infinite",
  },
  {
    width: "40vw",
    height: "50vh",
    top: "40%",
    left: "30%",
    animation: "fogDrift 32s ease-in-out 4s infinite",
  },
];

export default function HeroFog() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 8,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {blobs.map((blob, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(200,210,220,0.13) 0%, transparent 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
            ...blob,
          }}
        />
      ))}
    </div>
  );
}

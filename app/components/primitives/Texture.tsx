"use client";

import React from "react";

type TextureType = "noise" | "grain" | "lines" | "dots" | "gradient-overlay";
type TextureIntensity = "subtle" | "medium" | "heavy";

interface TextureProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: TextureType;
  intensity?: TextureIntensity;
  opacity?: number;
  blendMode?: "multiply" | "overlay" | "screen" | "soft-light";
}

/**
 * Texture component for adding subtle visual interest to sections
 * Uses CSS gradients and patterns (no image files)
 */
export const Texture = React.forwardRef<HTMLDivElement, TextureProps>(
  (
    {
      type = "noise",
      intensity = "subtle",
      opacity = 1,
      blendMode = "multiply",
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const intensityMap = {
      subtle: 0.02,
      medium: 0.05,
      heavy: 0.1,
    };

    const textureStyles = {
      noise: {
        backgroundImage: `
          repeating-linear-gradient(
            45deg,
            transparent 0px,
            rgba(255, 255, 255, ${intensityMap[intensity]}) 1px,
            transparent 2px,
            transparent 4px
          ),
          repeating-linear-gradient(
            -45deg,
            transparent 0px,
            rgba(15, 20, 25, ${intensityMap[intensity]}) 1px,
            transparent 2px,
            transparent 4px
          )
        `,
        backgroundSize: "4px 4px",
      },

      grain: {
        backgroundImage: `
          radial-gradient(circle, rgba(255, 255, 255, ${intensityMap[intensity]}) 1px, transparent 1px)
        `,
        backgroundSize: `${3 + intensityMap[intensity] * 10}px ${3 + intensityMap[intensity] * 10}px`,
      },

      lines: {
        backgroundImage: `
          repeating-linear-gradient(
            90deg,
            transparent 0px,
            transparent 2px,
            rgba(78, 168, 222, ${intensityMap[intensity]}) 2px,
            rgba(78, 168, 222, ${intensityMap[intensity]}) 4px
          )
        `,
        backgroundSize: "4px 100%",
      },

      dots: {
        backgroundImage: `
          radial-gradient(circle, rgba(78, 168, 222, ${intensityMap[intensity]}) 1px, transparent 1px)
        `,
        backgroundSize: `${8 + intensityMap[intensity] * 20}px ${8 + intensityMap[intensity] * 20}px`,
      },

      "gradient-overlay": {
        backgroundImage: `
          linear-gradient(135deg, rgba(78, 168, 222, ${intensityMap[intensity] * 0.5}) 0%, transparent 100%)
        `,
        backgroundSize: "100% 100%",
      },
    };

    return (
      <div
        ref={ref}
        className={`pointer-events-none ${className}`}
        style={{
          ...textureStyles[type],
          opacity,
          mixBlendMode: blendMode as any,
          ...style,
        }}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

Texture.displayName = "Texture";

/* =====================
   BACKGROUND WITH TEXTURE
   ===================== */

interface TexturedBackgroundProps
  extends React.HTMLAttributes<HTMLDivElement> {
  textureType?: TextureType;
  textureIntensity?: TextureIntensity;
  children?: React.ReactNode;
}

/**
 * Wrapper component that combines a background with texture overlay
 */
export const TexturedBackground = React.forwardRef<
  HTMLDivElement,
  TexturedBackgroundProps
>(
  (
    {
      textureType = "noise",
      textureIntensity = "subtle",
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={`relative ${className}`} {...props}>
        {/* Texture overlay */}
        <Texture
          type={textureType}
          intensity={textureIntensity}
          className="absolute inset-0 z-10"
        />

        {/* Content */}
        <div className="relative z-20">{children}</div>
      </div>
    );
  }
);

TexturedBackground.displayName = "TexturedBackground";

export default Texture;

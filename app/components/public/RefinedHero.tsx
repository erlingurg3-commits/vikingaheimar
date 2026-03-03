"use client";

import React from "react";
import { H1, Overline } from "../primitives/Typography";
import { TexturedBackground } from "../primitives/Texture";

const RefinedHero: React.FC = () => {
  return (
    <TexturedBackground
      textureType="gradient-overlay"
      textureIntensity="subtle"
      className="relative w-full h-96 bg-cover bg-center"
      style={{
        backgroundImage: "url(/path/to/your/hero-image.jpg)",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-4">
        <Overline>Icelandic Heritage</Overline>
        <H1 className="text-accent-ice-white">
          Discover the Viking Heritage
        </H1>
      </div>
    </TexturedBackground>
  );
};

export default RefinedHero;

"use client";

import { H1, Overline, BodyLarge } from "./primitives/Typography";
import Button from "./primitives/Button";
import { TexturedBackground } from "./primitives/Texture";

export default function Hero() {
  const scrollToHall = () => {
    const element = document.getElementById("hall");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <TexturedBackground
      textureType="noise"
      textureIntensity="subtle"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/viking.jpg')" }}
      />

      {/* Dark Overlay for readability */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Content */}
      <div className="relative z-10 text-center animate-fadeIn max-w-4xl px-6">
        <Overline className="justify-center mb-6">
          Welcome to Icelandic Heritage
        </Overline>

        <H1 className="mb-6 text-accent-frost-blue">
          VÍKINGAHEIMAR
        </H1>

        <BodyLarge className="text-neutral-200 mb-10 italic">
          You are among Vikings now.
        </BodyLarge>

        <Button
          onClick={scrollToHall}
          variant="primary"
          size="lg"
          className="rounded-lg"
        >
          Enter the Hall
        </Button>
      </div>
    </TexturedBackground>
  );
}

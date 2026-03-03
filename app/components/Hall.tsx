"use client";

import { SectionTitle, Body } from "./primitives/Typography";
import Container from "./primitives/Container";
import { TexturedBackground } from "./primitives/Texture";

export default function Hall() {
  return (
    <TexturedBackground
      textureType="grain"
      textureIntensity="subtle"
      className="relative min-h-screen bg-black flex flex-col items-center justify-center text-center px-8"
    >
      <Container size="lg" className="py-20">
        <SectionTitle
          overline="The Beginning"
          title="The Hall of Exploration"
          subtitle="Step into the world of Icelandic Vikings. Discover exploration, mythology, craftsmanship, and the spirit of the North."
          align="center"
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Exploration",
              description: "Chart unknown waters and discover new lands",
            },
            {
              title: "Mythology",
              description: "Journey through ancient Norse legends and gods",
            },
            {
              title: "Craftsmanship",
              description: "Master the ancient art of shipbuilding and trade",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-8 rounded-lg bg-neutral-900/40 border border-accent-frost-blue/20 hover:border-accent-frost-blue/40 transition-all"
            >
              <h3 className="font-display text-2xl font-normal mb-3 text-accent-frost-blue">
                {item.title}
              </h3>
              <Body className="text-neutral-300">{item.description}</Body>
            </div>
          ))}
        </div>
      </Container>
    </TexturedBackground>
  );
}

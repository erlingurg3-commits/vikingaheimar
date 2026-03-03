"use client";

import React from "react";
import Container from "@/app/components/ui/Container";
import { TexturedBackground } from "@/app/components/primitives/Texture";

type SectionTone = "default" | "muted" | "contrast";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  tone?: SectionTone;
  containerSize?: "sm" | "md" | "lg" | "xl";
  textured?: boolean;
}

export default function Section({
  as: Component = "section",
  tone = "default",
  containerSize = "lg",
  textured = false,
  className = "",
  children,
  ...props
}: SectionProps) {
  const toneStyles = {
    default: "bg-transparent",
    muted: "bg-gradient-to-b from-neutral-900/50 to-neutral-950/60 border-y border-accent-frost-blue/10",
    contrast: "bg-gradient-to-b from-base-charcoal via-neutral-900 to-neutral-950 border-y border-accent-frost-blue/10",
  }[tone];

  const content = (
    <Component className={`w-full py-20 lg:py-28 ${toneStyles} ${className}`} {...props}>
      <Container size={containerSize}>{children}</Container>
    </Component>
  );

  if (!textured) {
    return content;
  }

  return (
    <TexturedBackground textureType="noise" textureIntensity="subtle">
      {content}
    </TexturedBackground>
  );
}

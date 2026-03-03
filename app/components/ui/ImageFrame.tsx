"use client";

import React from "react";
import Image from "next/image";
import { Texture } from "@/app/components/primitives/Texture";

interface ImageFrameProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export default function ImageFrame({
  src,
  alt,
  caption,
  width = 1200,
  height = 800,
  priority = false,
}: ImageFrameProps) {
  return (
    <figure className="relative overflow-hidden rounded-2xl border border-accent-frost-blue/25 bg-neutral-900/50">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className="w-full h-auto object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" aria-hidden="true" />
      <Texture type="noise" intensity="subtle" className="absolute inset-0" blendMode="overlay" />
      {caption && (
        <figcaption className="absolute left-4 bottom-4 text-xs tracking-wide uppercase text-neutral-200 bg-black/45 px-2 py-1 rounded">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

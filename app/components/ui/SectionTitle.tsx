"use client";

import React from "react";
import { SectionTitle as PrimitiveSectionTitle } from "@/app/components/primitives/Typography";

interface SectionTitleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center" | "right";
}

export default function SectionTitle({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
  ...props
}: SectionTitleProps) {
  return (
    <PrimitiveSectionTitle
      overline={eyebrow}
      title={title}
      subtitle={description}
      align={align}
      className={className}
      {...props}
    />
  );
}

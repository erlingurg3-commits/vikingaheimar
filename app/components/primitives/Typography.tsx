"use client";

import React from "react";

/**
 * Typography scale component system
 * Provides consistent heading and text sizing across the application
 */

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  as?: React.ElementType;
}

/* =====================
   HEADING COMPONENTS
   ===================== */

export const H1 = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className = "", ...props }, ref) => (
    <h1
      ref={ref}
      className={`font-display text-6xl font-normal tracking-tight leading-tight text-off-white ${className}`}
      {...props}
    />
  )
);
H1.displayName = "H1";

export const H2 = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className = "", ...props }, ref) => (
    <h2
      ref={ref}
      className={`font-display text-5xl font-normal tracking-tight leading-tight text-off-white ${className}`}
      {...props}
    />
  )
);
H2.displayName = "H2";

export const H3 = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className = "", ...props }, ref) => (
    <h3
      ref={ref}
      className={`font-display text-4xl font-normal tracking-tight leading-snug text-off-white ${className}`}
      {...props}
    />
  )
);
H3.displayName = "H3";

export const H4 = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className = "", ...props }, ref) => (
    <h4
      ref={ref}
      className={`font-display text-3xl font-normal tracking-normal leading-snug text-off-white ${className}`}
      {...props}
    />
  )
);
H4.displayName = "H4";

export const H5 = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className = "", ...props }, ref) => (
    <h5
      ref={ref}
      className={`font-text text-2xl font-semibold tracking-normal leading-snug text-off-white ${className}`}
      {...props}
    />
  )
);
H5.displayName = "H5";

export const H6 = React.forwardRef<HTMLHeadingElement, TypographyProps>(
  ({ className = "", ...props }, ref) => (
    <h6
      ref={ref}
      className={`font-text text-xl font-semibold tracking-normal leading-snug text-neutral-100 ${className}`}
      {...props}
    />
  )
);
H6.displayName = "H6";

/* =====================
   BODY TEXT COMPONENTS
   ===================== */

export const Body = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className = "", ...props }, ref) => (
    <p
      ref={ref}
      className={`font-text text-base font-normal leading-relaxed text-neutral-200 ${className}`}
      {...props}
    />
  )
);
Body.displayName = "Body";

export const BodyLarge = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className = "", ...props }, ref) => (
    <p
      ref={ref}
      className={`font-text text-lg font-normal leading-relaxed text-neutral-100 ${className}`}
      {...props}
    />
  )
);
BodyLarge.displayName = "BodyLarge";

export const BodySmall = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className = "", ...props }, ref) => (
    <p
      ref={ref}
      className={`font-text text-sm font-normal leading-normal text-neutral-300 ${className}`}
      {...props}
    />
  )
);
BodySmall.displayName = "BodySmall";

/* =====================
   CAPTION & UTILITY TEXT
   ===================== */

export const Caption = React.forwardRef<HTMLParagraphElement, TypographyProps>(
  ({ className = "", ...props }, ref) => (
    <p
      ref={ref}
      className={`font-text text-xs font-medium tracking-wide leading-normal text-neutral-400 uppercase ${className}`}
      {...props}
    />
  )
);
Caption.displayName = "Caption";

export const Overline = React.forwardRef<HTMLSpanElement, TypographyProps>(
  ({ className = "", ...props }, ref) => (
    <span
      ref={ref}
      className={`font-text text-xs font-bold tracking-widest leading-normal text-accent-frost-blue uppercase ${className}`}
      {...props}
    />
  )
);
Overline.displayName = "Overline";

export const Label = React.forwardRef<HTMLLabelElement, TypographyProps>(
  ({ className = "", ...props }, ref) => (
    <label
      ref={ref}
      className={`font-text text-sm font-medium leading-normal text-neutral-200 ${className}`}
      {...props}
    />
  )
);
Label.displayName = "Label";

export const Mono = React.forwardRef<HTMLSpanElement, TypographyProps>(
  ({ className = "", ...props }, ref) => (
    <span
      ref={ref}
      className={`font-mono text-sm font-normal tracking-normal text-neutral-300 ${className}`}
      {...props}
    />
  )
);
Mono.displayName = "Mono";

/* =====================
   SECTION TITLE COMPONENT
   ===================== */

interface SectionTitleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  overline?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center" | "right";
}

export const SectionTitle = React.forwardRef<HTMLDivElement, SectionTitleProps>(
  (
    { overline, title, subtitle, align = "left", className = "", ...props },
    ref
  ) => {
    const alignClass = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    }[align];

    return (
      <div
        ref={ref}
        className={`space-y-2 md:space-y-4 ${className}`}
        {...props}
      >
        {overline && (
          <Overline className={alignClass}>{overline}</Overline>
        )}
        <h2 className={`font-display text-4xl md:text-5xl font-normal tracking-tight leading-tight text-off-white ${alignClass}`}>
          {title}
        </h2>
        {subtitle && (
          <BodyLarge className={`${alignClass} text-neutral-300 md:max-w-2xl ${align === "center" ? "mx-auto" : ""}`}>
            {subtitle}
          </BodyLarge>
        )}
      </div>
    );
  }
);
SectionTitle.displayName = "SectionTitle";

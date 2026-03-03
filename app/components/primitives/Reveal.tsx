"use client";

import React, { useEffect, useRef, useState } from "react";

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delayMs?: number;
  yOffset?: number;
  once?: boolean;
  threshold?: number;
}

export default function Reveal({
  children,
  className = "",
  delayMs = 0,
  yOffset = 16,
  once = true,
  threshold = 0.16,
  ...props
}: RevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setReducedMotion(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setIsVisible(true);
      return;
    }

    const node = containerRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      { threshold }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [once, reducedMotion, threshold]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0px)" : `translateY(${yOffset}px)`,
        transition:
          reducedMotion
            ? "none"
            : "opacity 520ms cubic-bezier(0.16, 1, 0.3, 1), transform 520ms cubic-bezier(0.16, 1, 0.3, 1)",
        transitionDelay: reducedMotion ? "0ms" : `${delayMs}ms`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

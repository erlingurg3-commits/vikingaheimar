"use client";

import { useRef, useState, useEffect } from "react";
import type { RefObject } from "react";

/**
 * useScrollReveal — triggers isVisible once when the element enters the viewport.
 *
 * Uses IntersectionObserver and unobserves after the first intersection (animate-once).
 * Supports an optional delay (ms) before setting visible, for staggered reveals.
 *
 * Generic type T defaults to HTMLElement — narrow to HTMLDivElement etc. as needed.
 */
export function useScrollReveal<T extends HTMLElement = HTMLElement>(options?: {
  threshold?: number;
  delay?: number;
  rootMargin?: string;
}): { ref: RefObject<T | null>; isVisible: boolean } {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  const threshold = options?.threshold ?? 0.08;
  const delay = options?.delay;
  const rootMargin = options?.rootMargin ?? "0px 0px -60px 0px";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay) {
            setTimeout(() => setIsVisible(true), delay);
          } else {
            setIsVisible(true);
          }
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, delay, rootMargin]);

  return { ref, isVisible };
}

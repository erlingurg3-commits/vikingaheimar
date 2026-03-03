/**
 * useRevealOnScroll Hook
 *
 * Lightweight reveal-on-scroll animation using Intersection Observer.
 * Adds 'visible' class to element when it enters viewport.
 * No scroll listeners - uses browser's native observation.
 *
 * Usage:
 *   const ref = useRevealOnScroll();
 *   <div ref={ref} className={`transition-opacity ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
 */

"use client";

import { useRef, useEffect, useState } from "react";

export function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Stop observing after reveal to save resources
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: "50px", // Start animation before element fully enters viewport
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return { ref, isVisible };
}

"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * useScrollReveal — triggers isVisible once when the element enters the viewport.
 *
 * Uses IntersectionObserver and unobserves after the first intersection (animate-once).
 * Supports an optional delay (ms) before setting visible, for staggered reveals.
 *
 * FAIL-OPEN REWRITE — 2026-08-21
 * -----------------------------------------------------------------------
 * The previous version (kept commented at the bottom of this file) captured
 * `ref.current` inside an effect whose deps were [threshold, delay, rootMargin]
 * and bailed out with `if (!el) return;` when the node wasn't mounted yet.
 *
 * For any consumer that mounts its ref'd markup LATER than the first render —
 * e.g. GoogleReviews, which returns a placeholder until its fetch resolves —
 * the node was null on the only run of that effect. The deps never changed, so
 * the effect never re-ran, no observer was ever attached, `isVisible` stayed
 * false, and the element sat at opacity:0 + translateY(32px) permanently.
 * Scrolling could not rescue it because nothing was observing it.
 *
 * Four changes make it impossible for content to stay hidden:
 *
 * 1. CALLBACK REF — `ref` is now a callback that stores the node in state, so
 *    the effect re-runs the moment the node mounts, however late that is. This
 *    is the actual root-cause fix for async-mounted content.
 * 2. IN-VIEWPORT AT ATTACH — if the node is already on screen when observed, it
 *    reveals immediately. Above-the-fold content is never hidden even for a
 *    frame, so there is no flash.
 * 3. WATCHDOG — if no node has attached within WATCHDOG_MS, reveal anyway.
 *    Nothing can be left invisible by a ref that never lands.
 * 4. NO OBSERVER, NO HIDING — if IntersectionObserver is missing or throws, or
 *    the user prefers reduced motion, we reveal immediately rather than
 *    applying a hidden state we might not be able to clear.
 *
 * NOTE on the watchdog: it deliberately does NOT force every element visible
 * 300ms after mount. Doing that would reveal below-the-fold content while it is
 * still off screen and remove the site's scroll animations entirely. It fires
 * only when the element could not be observed — the case that actually strands
 * content. Elements that are observed and simply waiting their turn still
 * animate on scroll, and are guaranteed to reveal when they intersect.
 *
 * Generic type T defaults to HTMLElement — narrow to HTMLDivElement etc. as needed.
 */

/** Reveal anyway if no node has attached this long after mount. */
const WATCHDOG_MS = 300;

export function useScrollReveal<T extends HTMLElement = HTMLElement>(options?: {
  threshold?: number;
  delay?: number;
  rootMargin?: string;
}): { ref: (node: T | null) => void; isVisible: boolean } {
  const [node, setNode] = useState<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const threshold = options?.threshold ?? 0.08;
  const delay = options?.delay;
  const rootMargin = options?.rootMargin ?? "0px 0px -60px 0px";

  // Callback ref — re-runs the effect below whenever the node mounts or swaps,
  // including long after the first render.
  const ref = useCallback((next: T | null) => setNode(next), []);

  // Watchdog: nothing ever attached, so nothing can ever reveal it. Fail open.
  useEffect(() => {
    if (node || isVisible) return;
    const t = setTimeout(() => setIsVisible(true), WATCHDOG_MS);
    return () => clearTimeout(t);
  }, [node, isVisible]);

  useEffect(() => {
    if (!node) return;

    // SSR-safe: this only ever runs in an effect, so window/matchMedia exist.
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reduced motion, or no observer support — show it, don't animate it.
    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    // Already on screen when we attached: reveal now, no hidden frame.
    const rect = node.getBoundingClientRect();
    const alreadyInView = rect.top < window.innerHeight && rect.bottom > 0;

    const show = () => setIsVisible(true);

    if (alreadyInView) {
      if (delay) {
        const t = setTimeout(show, delay);
        return () => clearTimeout(t);
      }
      show();
      return;
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    let observer: IntersectionObserver;

    try {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            if (delay) {
              timer = setTimeout(show, delay);
            } else {
              show();
            }
            observer.unobserve(node);
          }
        },
        { threshold, rootMargin }
      );
      observer.observe(node);
    } catch {
      // Observer construction failed — never leave the node hidden.
      setIsVisible(true);
      return;
    }

    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [node, threshold, delay, rootMargin]);

  return { ref, isVisible };
}

/* ------------------------------------------------------------------------
 * PREVIOUS IMPLEMENTATION — disabled 2026-08-21, kept for reference.
 * Stranded any ref'd node that mounted after the first render at opacity:0
 * (see the note at the top of this file). Replaced, not deleted.
 *
 * export function useScrollReveal<T extends HTMLElement = HTMLElement>(options?: {
 *   threshold?: number;
 *   delay?: number;
 *   rootMargin?: string;
 * }): { ref: RefObject<T | null>; isVisible: boolean } {
 *   const ref = useRef<T>(null);
 *   const [isVisible, setIsVisible] = useState(false);
 *
 *   const threshold = options?.threshold ?? 0.08;
 *   const delay = options?.delay;
 *   const rootMargin = options?.rootMargin ?? "0px 0px -60px 0px";
 *
 *   useEffect(() => {
 *     const el = ref.current;
 *     if (!el) return;              // <-- never retried; the bug
 *
 *     const observer = new IntersectionObserver(
 *       ([entry]) => {
 *         if (entry.isIntersecting) {
 *           if (delay) {
 *             setTimeout(() => setIsVisible(true), delay);
 *           } else {
 *             setIsVisible(true);
 *           }
 *           observer.unobserve(el);
 *         }
 *       },
 *       { threshold, rootMargin }
 *     );
 *
 *     observer.observe(el);
 *     return () => observer.disconnect();
 *   }, [threshold, delay, rootMargin]);
 *
 *   return { ref, isVisible };
 * }
 * --------------------------------------------------------------------- */

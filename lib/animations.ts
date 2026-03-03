/**
 * Animation utilities and motion tokens
 * Extends existing globals.css animations with reusable patterns and stagger utilities
 */

import { MOTION } from './design-tokens';

/**
 * Animation preset definitions for use in CSS
 */
export const ANIMATION_PRESETS = {
  fadeIn: {
    name: 'fadeIn',
    duration: '1.5s',
    timingFunction: 'ease-out',
    keyframes: `
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    `,
  },

  slideInLeft: {
    name: 'slideInLeft',
    duration: '0.5s',
    timingFunction: 'ease-out',
    keyframes: `
      from {
        opacity: 0;
        transform: translateX(-40px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    `,
  },

  slideInRight: {
    name: 'slideInRight',
    duration: '0.5s',
    timingFunction: 'ease-out',
    keyframes: `
      from {
        opacity: 0;
        transform: translateX(40px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    `,
  },

  slideInUp: {
    name: 'slideInUp',
    duration: '0.5s',
    timingFunction: 'ease-out',
    keyframes: `
      from {
        opacity: 0;
        transform: translateY(40px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    `,
  },

  scaleIn: {
    name: 'scaleIn',
    duration: '0.4s',
    timingFunction: 'ease-out',
    keyframes: `
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    `,
  },

  fadeInOut: {
    name: 'fadeInOut',
    duration: '0.3s',
    timingFunction: 'ease-in-out',
    keyframes: `
      0%, 100% {
        opacity: 0;
      }
      50% {
        opacity: 1;
      }
    `,
  },

  pulse: {
    name: 'pulse',
    duration: '2s',
    timingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
    keyframes: `
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    `,
  },

  spin: {
    name: 'spin',
    duration: '1s',
    timingFunction: 'linear',
    keyframes: `
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    `,
  },

  slowZoom: {
    name: 'slowZoom',
    duration: '20s',
    timingFunction: 'ease-in-out',
    keyframes: `
      from {
        transform: scale(1);
      }
      to {
        transform: scale(1.05);
      }
    `,
  },

  glow: {
    name: 'glow',
    duration: '2s',
    timingFunction: 'ease-in-out',
    keyframes: `
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
      }
      50% {
        box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
      }
    `,
  },
} as const;

/**
 * Generate staggered animation delays for list items
 * Useful for animating multiple elements in sequence
 *
 * @example
 * items.map((item, i) => ({
 *   style: { animationDelay: getStaggerDelay(i, 50) }
 * }))
 */
export function getStaggerDelay(index: number, delayMs: number = 50): string {
  return `${index * delayMs}ms`;
}

/**
 * Generate CSS animation string
 */
export function createAnimationString(
  name: string,
  duration: string = MOTION.timing.base,
  easing: string = MOTION.easing.easeOut,
  delay?: string,
  fillMode: 'forwards' | 'backwards' | 'both' | 'none' = 'forwards'
): string {
  const parts = [name, duration, easing];
  if (delay) parts.push(delay);
  parts.push(fillMode);
  return parts.join(' ');
}

/**
 * Transition helpers for smooth property changes
 */
export const TRANSITION = {
  color: (timing: 'fast' | 'base' | 'slow' = 'base') =>
    `color ${MOTION.timing[timing]} ${MOTION.easing.easeOut}`,

  background: (timing: 'fast' | 'base' | 'slow' = 'base') =>
    `background ${MOTION.timing[timing]} ${MOTION.easing.easeOut}`,

  transform: (timing: 'fast' | 'base' | 'slow' = 'base') =>
    `transform ${MOTION.timing[timing]} ${MOTION.easing.easeOut}`,

  opacity: (timing: 'fast' | 'base' | 'slow' = 'base') =>
    `opacity ${MOTION.timing[timing]} ${MOTION.easing.easeOut}`,

  all: (timing: 'fast' | 'base' | 'slow' = 'base') =>
    `all ${MOTION.timing[timing]} ${MOTION.easing.easeOut}`,

  boxShadow: (timing: 'fast' | 'base' | 'slow' = 'base') =>
    `box-shadow ${MOTION.timing[timing]} ${MOTION.easing.easeOut}`,

  borderColor: (timing: 'fast' | 'base' | 'slow' = 'base') =>
    `border-color ${MOTION.timing[timing]} ${MOTION.easing.easeOut}`,
} as const;

/**
 * Micro-interaction timing presets
 */
export const MICROINTERACTION = {
  // Button hover/focus feedback
  buttonHover: {
    duration: MOTION.timing.fast,
    easing: MOTION.easing.easeOut,
  },

  // Input focus feedback
  inputFocus: {
    duration: MOTION.timing.fast,
    easing: MOTION.easing.easeOut,
  },

  // Dropdown open/close
  dropdown: {
    duration: MOTION.timing.base,
    easing: MOTION.easing.easeOut,
  },

  // Modal enter/exit
  modal: {
    duration: MOTION.timing.slow,
    easing: MOTION.easing.easeOut,
  },

  // Tooltip appear/disappear
  tooltip: {
    duration: MOTION.timing.fast,
    easing: MOTION.easing.easeOut,
  },

  // Toast notification
  toast: {
    enter: MOTION.timing.base,
    exit: MOTION.timing.base,
    stay: '4000ms',
  },
} as const;

/**
 * Utility class names for applying animations
 * (corresponds to globals.css utility classes)
 */
export const ANIMATION_CLASSES = {
  fadeIn: 'animate-fadeIn',
  slideInLeft: 'animate-slideInLeft',
  slideInRight: 'animate-slideInRight',
  slideInUp: 'animate-slideInUp',
  scaleIn: 'animate-scaleIn',
  slowZoom: 'animate-slowZoom',
  glow: 'animate-glow',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  ping: 'animate-ping',
} as const;

/**
 * Centralized Design Tokens for Vikingaheimar
 * Nordic-themed, dark-first color system with accessibility built-in
 */

export const COLORS = {
  // Base palette (Dark Nordic)
  base: {
    charcoal: '#0f1419',
    nearBlack: '#0a0d12',
    white: '#ffffff',
    offWhite: '#f0f4f8',
  },

  // Accents (Cold Nordic)
  accent: {
    frostBlue: '#4ea8de',
    iceWhite: '#e8f0f7',
    deepTeal: '#0d5a6d',
  },

  // Heritage palette (public pages)
  heritage: {
    amber: '#d4a574',
    amberLight: '#e8c4a0',
    amberDark: '#8b6a47',
  },

  // Dashboard palette
  dashboard: {
    emerald: '#10b981',
    emeraldLight: '#6ee7b7',
    emeraldDark: '#059669',
    cyan: '#06b6d4',
    cyanLight: '#67e8f9',
  },

  // Status colors
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // Neutrals (shades of gray)
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
} as const;

export const TYPOGRAPHY = {
  family: {
    display: ["var(--font-display)", "Georgia", "serif"],
    text: ["var(--font-text)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
    mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
  },

  size: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '28px',
    '4xl': '32px',
    '5xl': '40px',
    '6xl': '56px',
  },

  weight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  letterSpacing: {
    tight: '-0.02em',
    normal: '0em',
    wide: '0.05em',
    wider: '0.1em',
  },
} as const;

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '96px',
} as const;

export const RADIUS = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const;

export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  glow: {
    emerald: '0 0 20px rgba(16, 185, 129, 0.3)',
    cyan: '0 0 20px rgba(6, 182, 212, 0.3)',
    amber: '0 0 20px rgba(217, 119, 6, 0.3)',
  },
} as const;

export const MOTION = {
  timing: {
    fast: '150ms',
    base: '300ms',
    slow: '500ms',
    slower: '700ms',
  },

  easing: {
    linear: 'linear',
    easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  transition: {
    fast: (property = 'all') => `${property} ${MOTION.timing.fast} ${MOTION.easing.easeOut}`,
    base: (property = 'all') => `${property} ${MOTION.timing.base} ${MOTION.easing.easeOut}`,
    slow: (property = 'all') => `${property} ${MOTION.timing.slow} ${MOTION.easing.easeOut}`,
  },
} as const;

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const CONTAINER = {
  maxWidth: {
    sm: '640px',
    md: '896px',
    lg: '1128px',
    xl: '1280px',
  },

  padding: {
    mobile: '16px',
    tablet: '24px',
    desktop: '32px',
  },
} as const;

export const ZINDEX = {
  hide: '-1',
  base: '0',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modal: '1040',
  popover: '1050',
  tooltip: '1060',
} as const;

/**
 * Export all tokens as a single object for easy imports
 */
export const TOKENS = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  radius: RADIUS,
  shadows: SHADOWS,
  motion: MOTION,
  breakpoints: BREAKPOINTS,
  container: CONTAINER,
  zindex: ZINDEX,
} as const;

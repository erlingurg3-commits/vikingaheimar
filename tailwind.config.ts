import type { Config } from 'tailwindcss';
import { COLORS, SPACING, RADIUS, SHADOWS, MOTION } from './lib/design-tokens.js';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base palette
        'base-charcoal': COLORS.base.charcoal,
        'base-near-black': COLORS.base.nearBlack,

        // Accents
        'accent-frost-blue': COLORS.accent.frostBlue,
        'accent-ice-white': COLORS.accent.iceWhite,
        'accent-deep-teal': COLORS.accent.deepTeal,

        // Heritage
        'heritage-amber': COLORS.heritage.amber,
        'heritage-amber-light': COLORS.heritage.amberLight,
        'heritage-amber-dark': COLORS.heritage.amberDark,

        // Dashboard
        'dashboard-emerald': COLORS.dashboard.emerald,
        'dashboard-emerald-light': COLORS.dashboard.emeraldLight,
        'dashboard-emerald-dark': COLORS.dashboard.emeraldDark,
        'dashboard-cyan': COLORS.dashboard.cyan,
        'dashboard-cyan-light': COLORS.dashboard.cyanLight,

        // Status
        'status-success': COLORS.status.success,
        'status-warning': COLORS.status.warning,
        'status-error': COLORS.status.error,
        'status-info': COLORS.status.info,

        // Neutrals
        'neutral': {
          50: COLORS.neutral[50],
          100: COLORS.neutral[100],
          200: COLORS.neutral[200],
          300: COLORS.neutral[300],
          400: COLORS.neutral[400],
          500: COLORS.neutral[500],
          600: COLORS.neutral[600],
          700: COLORS.neutral[700],
          800: COLORS.neutral[800],
          900: COLORS.neutral[900],
        },

        // Off-white alias
        'off-white': COLORS.base.offWhite,
      },

      spacing: {
        'xs': SPACING.xs,
        'sm': SPACING.sm,
        'md': SPACING.md,
        'lg': SPACING.lg,
        'xl': SPACING.xl,
        '2xl': SPACING['2xl'],
        '3xl': SPACING['3xl'],
        '4xl': SPACING['4xl'],
      },

      borderRadius: {
        'none': RADIUS.none,
        'sm': RADIUS.sm,
        'md': RADIUS.md,
        'lg': RADIUS.lg,
        'xl': RADIUS.xl,
        'full': RADIUS.full,
      },

      boxShadow: {
        'sm': SHADOWS.sm,
        'md': SHADOWS.md,
        'lg': SHADOWS.lg,
        'xl': SHADOWS.xl,
        '2xl': SHADOWS['2xl'],
        'glow-emerald': SHADOWS.glow.emerald,
        'glow-cyan': SHADOWS.glow.cyan,
        'glow-amber': SHADOWS.glow.amber,
      },

      fontFamily: {
        'display': 'var(--font-display)',
        'text': 'var(--font-text)',
        'mono': 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
      },

      fontSize: {
        'xs': ['12px', { lineHeight: '1.2' }],
        'sm': ['14px', { lineHeight: '1.5' }],
        'base': ['16px', { lineHeight: '1.5' }],
        'lg': ['18px', { lineHeight: '1.5' }],
        'xl': ['18px', { lineHeight: '1.2' }],
        '2xl': ['21px', { lineHeight: '1.2' }],
        '3xl': ['24px', { lineHeight: '1.2' }],
        '4xl': ['28px', { lineHeight: '1.2' }],
        '5xl': ['34px', { lineHeight: '1.2' }],
        '6xl': ['48px', { lineHeight: '1.2' }],
      },

      fontWeight: {
        'light': 300,
        'normal': 400,
        'medium': 500,
        'semibold': 600,
        'bold': 700,
        'extrabold': 800,
      },

      transitionDuration: {
        'fast': MOTION.timing.fast,
        'base': MOTION.timing.base,
        'slow': MOTION.timing.slow,
        'slower': MOTION.timing.slower,
      },

      transitionTimingFunction: {
        'ease-out': MOTION.easing.easeOut,
        'ease-in': MOTION.easing.easeIn,
        'ease-in-out': MOTION.easing.easeInOut,
      },

      animation: {
        'fadeIn': `fadeIn 1.5s ${MOTION.easing.easeOut} forwards`,
        'slideInLeft': `slideInLeft 0.5s ${MOTION.easing.easeOut} forwards`,
        'slideInRight': `slideInRight 0.5s ${MOTION.easing.easeOut} forwards`,
        'slideInUp': `slideInUp 0.5s ${MOTION.easing.easeOut} forwards`,
        'scaleIn': `scaleIn 0.4s ${MOTION.easing.easeOut} forwards`,
        'slowZoom': `slowZoom 20s ${MOTION.easing.easeInOut} infinite alternate`,
        'glow': `glow 2s ${MOTION.easing.easeInOut} infinite`,
      },

      zIndex: {
        'hide': '-1',
        'base': '0',
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal': '1040',
        'popover': '1050',
        'tooltip': '1060',
      },
    },
  },
  plugins: [],
};

export default config;

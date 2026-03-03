/**
 * Accessibility utilities and focus state management
 */

export const A11Y = {
  /**
   * SR-only (screen reader only) class for skip links and hidden text
   */
  srOnly: {
    position: 'absolute' as const,
    width: '1px' as const,
    height: '1px' as const,
    padding: '0' as const,
    margin: '-1px' as const,
    overflow: 'hidden' as const,
    clip: 'rect(0, 0, 0, 0)' as const,
    whiteSpace: 'nowrap' as const,
    borderWidth: '0' as const,
  },

  /**
   * Focus visible styles (keyboard navigation)
   */
  focusRing: {
    outline: '2px solid #4ea8de',
    outlineOffset: '2px',
  },

  focusRingInset: {
    outline: '2px solid #4ea8de',
    outlineOffset: '-2px',
  },

  /**
   * Focus visible Tailwind utilities
   */
  focusClassNames: 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-frostBlue',
  focusInsetClassNames: 'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-frostBlue',

  /**
   * Reduced motion media query respects user preferences
   */
  prefersReducedMotion: '@media (prefers-reduced-motion: reduce)',

  /**
   * High contrast mode for accessibility
   */
  prefersHighContrast: '@media (prefers-contrast: more)',

  /**
   * Dark mode preference
   */
  prefersDarkMode: '@media (prefers-color-scheme: dark)',

  /**
   * Light mode preference
   */
  prefersLightMode: '@media (prefers-color-scheme: light)',
} as const;

/**
 * ARIA attributes helper
 */
export const createAriaAttributes = {
  /**
   * Announce dynamic content to screen readers
   */
  liveRegion: (
    role: 'polite' | 'assertive' = 'polite',
    atomic: boolean = true
  ) => ({
    role: 'status',
    'aria-live': role,
    'aria-atomic': atomic,
  }),

  /**
   * Mark an element as controlling another
   */
  controls: (id: string) => ({
    'aria-controls': id,
  }),

  /**
   * Mark an element as describing another
   */
  describedBy: (id: string) => ({
    'aria-describedby': id,
  }),

  /**
   * Label association for form fields
   */
  labelledBy: (id: string) => ({
    'aria-labelledby': id,
  }),

  /**
   * Expanded state for collapsible content
   */
  expanded: (isExpanded: boolean, controls?: string) => ({
    'aria-expanded': isExpanded,
    ...(controls && { 'aria-controls': controls }),
  }),

  /**
   * Disabled state
   */
  disabled: (isDisabled: boolean) => ({
    'aria-disabled': isDisabled,
    disabled: isDisabled,
  }),

  /**
   * Loading/busy state
   */
  busy: (isBusy: boolean) => ({
    'aria-busy': isBusy,
  }),

  /**
   * Hidden from accessibility tree
   */
  hidden: {
    'aria-hidden': true,
  },
} as const;

/**
 * Semantic HTML role helpers
 */
export const SEMANTIC_ROLES = {
  button: 'button' as const,
  link: 'link' as const,
  main: 'main' as const,
  navigation: 'navigation' as const,
  banner: 'banner' as const,
  contentinfo: 'contentinfo' as const,
  complementary: 'complementary' as const,
  search: 'search' as const,
} as const;

/**
 * Color contrast ratios for WCAG compliance
 */
export const CONTRAST = {
  // WCAG AA (4.5:1 minimum for normal text)
  AA_NORMAL: 4.5,

  // WCAG AA (3:1 minimum for large text)
  AA_LARGE: 3,

  // WCAG AAA (7:1 minimum for normal text)
  AAA_NORMAL: 7,

  // WCAG AAA (4.5:1 minimum for large text)
  AAA_LARGE: 4.5,
} as const;

/**
 * Utility for conditionally applying accessible classes
 */
export function getA11yClasses({
  isFocusVisible,
  isDisabled,
  requiresFieldset,
}: {
  isFocusVisible?: boolean;
  isDisabled?: boolean;
  requiresFieldset?: boolean;
} = {}): string {
  const classes: string[] = [];

  if (isFocusVisible) {
    classes.push('focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-frostBlue');
  }

  if (isDisabled) {
    classes.push('disabled:opacity-50 disabled:cursor-not-allowed');
  }

  return classes.join(' ');
}

/**
 * Skip to main content link component (used in layout)
 */
export const SkipLinkId = 'skip-to-main-content';
export const SkipLinkHTML = `
  <a 
    href="#${SkipLinkId}" 
    className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-modal focus:bg-frostBlue focus:text-base-charcoal focus:px-4 focus:py-2"
  >
    Skip to main content
  </a>
`;

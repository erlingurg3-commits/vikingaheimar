"use client";

import React from "react";
import { SkipLinkId } from "@/lib/accessibility";

/**
 * Skip to main content link
 * Visible only to keyboard users (focus visible)
 * Placed at the beginning of the page
 */
export function SkipLink() {
  return (
    <a
      href={`#${SkipLinkId}`}
      className="sr-only sr-only-focusable fixed top-0 left-0 z-modal bg-accent-frost-blue text-base-charcoal px-4 py-2 text-sm font-semibold rounded-br-lg"
    >
      Skip to main content
    </a>
  );
}

export default SkipLink;

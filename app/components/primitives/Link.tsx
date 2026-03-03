"use client";

import React from "react";
import NextLink from "next/link";
import { TRANSITION } from "@/lib/animations";

type LinkVariant = "default" | "accent" | "ghost" | "underline";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: LinkVariant;
  asButton?: boolean;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ variant = "default", asButton = false, className = "", ...props }, ref) => {
    const baseStyles = "rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-frost-blue transition-colors motion-reduce:transition-none";

    const variantStyles = {
      default: `text-accent-frost-blue hover:text-blue-400 ${TRANSITION.color("fast")}`,
      accent: `font-medium text-heritage-amber hover:text-heritage-amber-light ${TRANSITION.color("fast")}`,
      ghost: `text-off-white hover:text-accent-frost-blue ${TRANSITION.color("fast")}`,
      underline: `text-accent-frost-blue underline hover:no-underline ${TRANSITION.color("fast")}`,
    };

    const buttonStyles = asButton
      ? "inline-flex items-center justify-center px-4 py-2 rounded-lg"
      : "";

    const underlineStyles = asButton
      ? ""
      : "relative inline-block after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-current after:transition-all after:duration-300 motion-reduce:after:transition-none hover:after:w-full focus-visible:after:w-full";

    return (
      <NextLink
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${buttonStyles} ${underlineStyles} ${className}`}
        {...props}
      />
    );
  }
);

Link.displayName = "Link";

export default Link;

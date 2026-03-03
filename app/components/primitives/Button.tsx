"use client";

import React from "react";
import { TRANSITION } from "@/lib/animations";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative isolate inline-flex items-center justify-center font-medium rounded-lg transform-gpu transition-all duration-300 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-frost-blue disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";

    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2.5 text-base",
      lg: "px-6 py-3 text-lg",
    };

    const variantStyles = {
      primary: `bg-accent-frost-blue text-base-charcoal hover:bg-blue-400 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 hover:shadow-lg hover:shadow-accent-frost-blue/25 active:translate-y-0 active:scale-[0.985] ${TRANSITION.all("fast")}`,
      secondary: `border-2 border-accent-frost-blue text-accent-frost-blue hover:bg-accent-frost-blue hover:text-base-charcoal hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 hover:shadow-lg hover:shadow-accent-frost-blue/20 active:translate-y-0 active:scale-[0.985] ${TRANSITION.all("fast")}`,
      ghost: `text-off-white hover:bg-neutral-700/50 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 active:translate-y-0 active:scale-[0.99] ${TRANSITION.all("fast")}`,
      danger: `bg-status-error text-white hover:bg-red-600 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 hover:shadow-lg hover:shadow-status-error/20 active:translate-y-0 active:scale-[0.985] ${TRANSITION.all("fast")}`,
    };

    const widthStyles = fullWidth ? "w-full" : "";

    const loadingStyles = isLoading ? "cursor-wait opacity-90 shadow-md" : "";

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-accent-frost-blue/0 before:transition-colors before:duration-300 motion-reduce:before:transition-none hover:before:border-accent-frost-blue/35 ${sizeStyles[size]} ${variantStyles[variant]} ${loadingStyles} ${widthStyles} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            {children}
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;

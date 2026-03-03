"use client";

import React, { useId } from "react";
import { TRANSITION } from "@/lib/animations";

type InputType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "search"
  | "date"
  | "time"
  | "datetime-local";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      error,
      helperText,
      fullWidth = true,
      icon,
      type = "text",
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    const baseStyles = `
      w-full px-4 py-2.5 rounded-lg
      bg-neutral-900/50 border-2 border-neutral-700
      text-off-white placeholder-neutral-500
      focus-visible:outline-none focus-visible:border-accent-frost-blue focus-visible:ring-1 focus-visible:ring-accent-frost-blue/30
      disabled:opacity-50 disabled:cursor-not-allowed
      ${TRANSITION.borderColor("fast")}
      ${TRANSITION.boxShadow("fast")}
    `;

    const containerStyles = fullWidth ? "w-full" : "";
    const errorStyles = error ? "border-status-error focus-visible:border-status-error focus-visible:ring-status-error/30" : "";

    return (
      <div className={containerStyles}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-off-white mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            className={`${baseStyles} ${errorStyles} ${icon ? "pl-10" : ""} ${className}`}
            {...props}
          />
        </div>

        {error && (
          <p className="mt-1 text-sm text-status-error">{error}</p>
        )}

        {helperText && !error && (
          <p className="mt-1 text-sm text-neutral-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;

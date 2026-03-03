"use client";

import React from "react";

type ContainerSize = "sm" | "md" | "lg" | "xl";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
  as?: React.ElementType;
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = "lg", className = "", ...props }, ref) => {
    const sizeStyles = {
      sm: "max-w-[640px]",
      md: "max-w-[896px]",
      lg: "max-w-[1128px]",
      xl: "max-w-[1280px]",
    };

    return (
      <div
        ref={ref}
        className={`mx-auto px-4 md:px-6 lg:px-8 ${sizeStyles[size]} ${className}`}
        {...props}
      />
    );
  }
);

Container.displayName = "Container";

export default Container;

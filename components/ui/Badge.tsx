"use client";

import React, { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "neutral", children, ...props }, ref) => {
    const variants = {
      success: "badge-success",
      warning: "badge-warning",
      danger: "badge-danger",
      info: "badge-info",
      neutral: "badge-neutral",
    };

    return (
      <span ref={ref} className={cn(variants[variant], className)} {...props}>
        {children}
      </span>
    );
  },
);

Badge.displayName = "Badge";

"use client";

import React, { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn("input", error && "input-error", className)}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm" style={{ color: "hsl(var(--danger))" }}>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            className="mt-1 text-sm"
            style={{ color: "hsl(var(--text-secondary))" }}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

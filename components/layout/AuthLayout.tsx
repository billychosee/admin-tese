"use client";

import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 mb-6">
            <span className="text-3xl font-bold text-white">T</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">{title}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        <div className="card p-8">{children}</div>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Need help? Contact{" "}
          <a
            href="mailto:support@tese.com"
            className="text-primary-400 hover:text-primary-300"
          >
            support@tese.com
          </a>
        </p>
      </div>
    </div>
  );
}

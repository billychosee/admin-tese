"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ThemeContextType, ThemeMode } from "@/types";
import { THEME_KEY } from "@/constants";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(THEME_KEY) as ThemeMode | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const initialTheme = stored || "light";
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  }, [theme]);

  const setThemeValue = useCallback((value: ThemeMode) => {
    setTheme(value);
    localStorage.setItem(THEME_KEY, value);
    document.documentElement.classList.toggle("dark", value === "dark");
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, setTheme: setThemeValue }}
    >
      <div className={mounted ? "" : "min-h-screen bg-white"}>{children}</div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

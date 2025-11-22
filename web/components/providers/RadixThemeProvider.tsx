"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Theme } from "@radix-ui/themes";

type RadixThemeProviderProps = {
  children: React.ReactNode;
};

type Appearance = "light" | "dark";

type ThemeAppearanceContextValue = {
  appearance: Appearance;
  toggleAppearance: () => void;
};

const ThemeAppearanceContext = createContext<ThemeAppearanceContextValue | null>(null);

export function useThemeAppearance() {
  const context = useContext(ThemeAppearanceContext);
  if (!context) {
    throw new Error("useThemeAppearance must be used within RadixThemeProvider");
  }
  return context;
}

function getInitialAppearance(): Appearance {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function RadixThemeProvider({ children }: RadixThemeProviderProps) {
  const [appearance, setAppearance] = useState<Appearance>(getInitialAppearance);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (event: MediaQueryListEvent) => {
      setAppearance(event.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const toggleAppearance = () => {
    setAppearance((prev) => (prev === "light" ? "dark" : "light"));
  };

  const value = useMemo(() => ({ appearance, toggleAppearance }), [appearance]);

  return (
    <ThemeAppearanceContext.Provider value={value}>
      <Theme
        appearance={appearance}
        accentColor="cyan"
        grayColor="slate"
        radius="large"
        className="app-theme"
        data-appearance={appearance}
      >
        {children}
      </Theme>
    </ThemeAppearanceContext.Provider>
  );
}

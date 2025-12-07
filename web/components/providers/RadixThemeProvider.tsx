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

export default function RadixThemeProvider({ children }: RadixThemeProviderProps) {
  const [appearance, setAppearance] = useState<Appearance>("light");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const applyPreference = (matches: boolean) => setAppearance(matches ? "dark" : "light");

    applyPreference(mediaQuery.matches);
    const handler = (event: MediaQueryListEvent) => applyPreference(event.matches);

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

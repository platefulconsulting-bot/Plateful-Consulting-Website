"use client";

import { useCallback, useEffect, useState } from "react";
import { THEME_KEY, type Theme } from "@/lib/theme";

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

/**
 * Reads and sets the current theme.
 *
 * The DOM is the single source of truth — the inline bootstrap script has
 * already set `data-theme` before React runs, so state is seeded from it rather
 * than from storage, and a MutationObserver keeps every consumer in sync when
 * the toggle flips it. That means the 3D stage and the toggle button can never
 * disagree about which theme is showing.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readTheme);

  useEffect(() => {
    setThemeState(readTheme());
    const observer = new MutationObserver(() => setThemeState(readTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Private mode or blocked storage: the choice still applies for this visit.
    }
  }, []);

  const toggle = useCallback(
    () => setTheme(readTheme() === "dark" ? "light" : "dark"),
    [setTheme],
  );

  return { theme, setTheme, toggle };
}

"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./useTheme";
import { cn } from "@/lib/utils";

/**
 * One-click light/dark switch.
 *
 * Both icons are always rendered and CSS decides which one is visible, keyed
 * off the same `data-theme` attribute the rest of the site uses. That avoids
 * the usual hydration problem: the server cannot know the visitor's theme, so
 * choosing the icon in JavaScript would either mismatch on hydration or flash
 * the wrong one. The icon shows the theme you will get if you press it.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      // Static label: accurate in both themes, so it never disagrees with the DOM.
      aria-label="Switch between light and dark theme"
      title="Switch theme"
      className={cn(
        "group relative grid h-10 w-10 place-items-center overflow-hidden rounded-full",
        "border border-cream-100/15 text-cream-200 transition-colors duration-300",
        "hover:border-gold-400/50 hover:text-gold-300",
        className,
      )}
    >
      <Sun
        aria-hidden
        className="absolute h-[1.05rem] w-[1.05rem] rotate-90 scale-0 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] dark:rotate-0 dark:scale-100 dark:opacity-100"
      />
      <Moon
        aria-hidden
        className="absolute h-[1.05rem] w-[1.05rem] rotate-0 scale-100 opacity-100 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] dark:-rotate-90 dark:scale-0 dark:opacity-0"
      />
    </button>
  );
}

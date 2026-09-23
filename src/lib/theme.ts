export const THEME_KEY = "pfc-theme";

export type Theme = "light" | "dark";

/**
 * Theme bootstrap.
 *
 * Injected as a blocking inline script at the very top of <body>, so the
 * `data-theme` attribute is on <html> before the browser paints anything. Doing
 * this in React instead would render one frame of the wrong theme on every
 * page load — the white flash that gives away a bolted-on dark mode.
 *
 * Order of preference: an explicit choice the visitor made, otherwise their
 * operating system setting, otherwise dark (the brand's default).
 */
export const THEME_SCRIPT = `(function(){try{var k=localStorage.getItem("${THEME_KEY}");var l=window.matchMedia("(prefers-color-scheme: light)").matches;document.documentElement.dataset.theme=(k==="light"||k==="dark")?k:(l?"light":"dark");}catch(e){document.documentElement.dataset.theme="dark";}})();`;

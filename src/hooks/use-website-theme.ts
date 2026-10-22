"use client";

import { useEffect, useState } from "react";
import { readSharedCookie, writeSharedCookie } from "@/lib/shared-domain-storage";

type Theme = "light" | "dark";
type ThemeMode = Theme | "system";
const themeKey = "soniva_theme_mode";
const legacyThemeKey = "soniva-releases-theme";
const themeEvent = "soniva-releases-theme-change";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}
function resolveTheme(mode: ThemeMode): Theme {
  return mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ? "dark"
    : "light";
}
function readThemeMode(): ThemeMode {
  const shared = readSharedCookie(themeKey);
  if (shared === "light" || shared === "dark" || shared === "system") { writeSharedCookie(themeKey, shared); return shared; }
  let legacy: string | null = null;
  try { legacy = localStorage.getItem(legacyThemeKey); } catch { /* Cookie-only mode. */ }
  if (legacy === "light" || legacy === "dark") {
    writeSharedCookie(themeKey, legacy);
    return legacy;
  }
  return "system";
}

export function useWebsiteTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mode, setMode] = useState<ThemeMode>("system");
  useEffect(() => {
    const sync = () => {
      const nextMode = readThemeMode();
      const nextTheme = resolveTheme(nextMode);
      setMode(nextMode);
      setTheme(nextTheme);
      applyTheme(nextTheme);
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(themeEvent, sync);
    window.addEventListener("focus", sync);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(themeEvent, sync);
      window.removeEventListener("focus", sync);
      media.removeEventListener("change", sync);
    };
  }, []);
  const toggleTheme = () => {
    const next: ThemeMode = mode === "light" ? "dark" : mode === "dark" ? "system" : "light";
    writeSharedCookie(themeKey, next);
    try { localStorage.removeItem(legacyThemeKey); } catch { /* Cookie-only mode. */ }
    setMode(next);
    const nextTheme = resolveTheme(next);
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.dispatchEvent(new Event(themeEvent));
  };
  return { theme, mode, toggleTheme };
}

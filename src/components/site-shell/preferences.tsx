"use client";

import { Languages, Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shellCopy, type ShellLocale } from "./copy";
import { CookieSettingsButton } from "./cookie-settings-button";

export type PreferenceProps = {
  locale: ShellLocale;
  themeMode: "light" | "dark" | "system";
  onLocaleChange: () => void;
  onThemeChange: () => void;
};

export function ShellPreferences({ locale, themeMode, onLocaleChange, onThemeChange }: PreferenceProps) {
  const t = shellCopy[locale];
  const next = themeMode === "light" ? "dark" : themeMode === "dark" ? "system" : "light";
  const Icon = themeMode === "light" ? Sun : themeMode === "dark" ? Moon : Monitor;
  return <div className="flex items-center gap-1">
    <Button variant="ghost" className="h-11 gap-1 px-2" onClick={onLocaleChange} aria-label={t.language}>
      <Languages className="size-4" /><span>{locale === "zh-CN" ? "EN" : "中文"}</span>
    </Button>
    <CookieSettingsButton locale={locale} />
    <Button variant="ghost" className="size-11" onClick={onThemeChange} aria-label={t.theme[next]} title={t.theme[next]}>
      <Icon className="size-4" />
    </Button>
  </div>;
}

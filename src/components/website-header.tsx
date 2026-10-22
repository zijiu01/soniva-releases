"use client";

import { SiteHeader } from "./site-shell/header";
import { useWebsiteLocale } from "@/hooks/use-website-locale";
import { useWebsiteTheme } from "@/hooks/use-website-theme";
import { trackWebsiteEvent } from "@/lib/website-analytics";

export function WebsiteHeader() {
  const { locale, toggleLocale } = useWebsiteLocale();
  const { mode, toggleTheme } = useWebsiteTheme();
  return <SiteHeader site="download" active="download" locale={locale} themeMode={mode}
    onLocaleChange={toggleLocale} onThemeChange={toggleTheme}
    onDownload={(position) => trackWebsiteEvent("desktop_download_click", { source: "download", position })} />;
}

"use client";

import { SiteFooter } from "./site-shell/footer";
import { useWebsiteLocale } from "@/hooks/use-website-locale";
import { useWebsiteTheme } from "@/hooks/use-website-theme";
import { trackWebsiteEvent } from "@/lib/website-analytics";

export function WebsiteFooter() {
  const { locale, toggleLocale } = useWebsiteLocale();
  const { mode, toggleTheme } = useWebsiteTheme();
  return <SiteFooter site="download" locale={locale} themeMode={mode}
    onLocaleChange={toggleLocale} onThemeChange={toggleTheme}
    onDownload={(position) => trackWebsiteEvent("desktop_download_click", { source: "download", position })} />;
}

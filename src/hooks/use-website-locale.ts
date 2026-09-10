"use client";

import { createContext, createElement, type ReactNode, useContext, useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { readSharedCookie, writeSharedCookie } from "@/lib/shared-domain-storage";

const localeKey = "soniva_app_lang";
const legacyLocaleKey = "soniva-releases-locale";
const localeEvent = "soniva-releases-locale-change";
const WebsiteLocaleContext = createContext<{ locale: Locale; toggleLocale: () => void } | null>(null);

function readLocale(): Locale {
  const shared = readSharedCookie(localeKey);
  if (shared === "zh-CN" || shared === "en-US") return shared;
  const legacy = localStorage.getItem(legacyLocaleKey);
  if (legacy === "zh-CN" || legacy === "en-US") {
    writeSharedCookie(localeKey, legacy);
    return legacy;
  }
  return "zh-CN";
}

export function WebsiteLocaleProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  useEffect(() => {
    const sync = () => setLocale(readLocale());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(localeEvent, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(localeEvent, sync);
    };
  }, []);
  const toggleLocale = () => {
    const next = locale === "zh-CN" ? "en-US" : "zh-CN";
    writeSharedCookie(localeKey, next);
    localStorage.removeItem(legacyLocaleKey);
    setLocale(next);
    window.dispatchEvent(new Event(localeEvent));
  };
  return createElement(WebsiteLocaleContext.Provider, { value: { locale, toggleLocale } }, children);
}

export function useWebsiteLocale() {
  const context = useContext(WebsiteLocaleContext);
  if (!context) throw new Error("useWebsiteLocale must be used within WebsiteLocaleProvider");
  return context;
}

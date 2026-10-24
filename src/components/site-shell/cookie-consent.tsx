"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cookieSettingsEvent } from "./cookie-settings-button";
import { useWebsiteLocale } from "@/hooks/use-website-locale";
import { writeSharedCookie } from "@/lib/shared-domain-storage";
import {
  type Consent, consentEvent, disableAnalytics, initializeAnalytics, measurementId,
  readConsent, setConsent as saveConsent, trackWebsiteEvent,
} from "@/lib/website-analytics";

export function CookieConsent() {
  const { locale } = useWebsiteLocale();
  const [consent, setConsent] = useState<Consent>("unset");
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    const open = () => setEditing(true);
    window.addEventListener(cookieSettingsEvent, open);
    return () => window.removeEventListener(cookieSettingsEvent, open);
  }, []);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const copy = locale === "zh-CN"
    ? { text: "统计 Cookie 用于了解网站的使用情况，是否允许由你决定。", reject: "拒绝", accept: "接受", settings: "Cookie 设置" }
    : { text: "Analytics cookies help understand website usage. You choose whether to allow them.", reject: "Reject", accept: "Accept", settings: "Cookie settings" };

  useEffect(() => {
    const sync = () => {
      // Migrate this site's former localStorage consent only when no shared choice exists.
      if (readConsent() === "unset") {
        try {
          const old = localStorage.getItem("soniva_cookie_consent");
          if (old === "accepted" || old === "rejected") { writeSharedCookie("soniva_cookie_consent", old); localStorage.removeItem("soniva_cookie_consent"); }
        } catch { /* Cookie-only mode. */ }
      }
      const next = readConsent();
      if (next !== "accepted") disableAnalytics();
      setConsent(next);
    };
    sync();
    window.addEventListener(consentEvent, sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener(consentEvent, sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  useEffect(() => {
    if (ready && consent === "accepted") trackWebsiteEvent("page_view", { page_path: pathname });
  }, [pathname, ready, consent]);

  const choose = (value: Exclude<Consent, "unset">) => {
    saveConsent(value);
    setConsent(value);
    setEditing(false);
    // A loaded third-party script cannot be unloaded by unmounting next/script.
    if (value === "rejected" && ready) window.location.reload();
  };

  return <>
    {consent === "unset" || editing ? (
      <aside aria-label={copy.settings} className="fixed inset-x-4 bottom-4 z-[400] flex flex-col gap-3 rounded-lg border border-border bg-background p-4 text-sm sm:left-auto sm:max-w-sm">
        <p className="leading-6 text-muted-foreground">{copy.text}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => choose("rejected")}>{copy.reject}</Button>
          <Button size="sm" onClick={() => choose("accepted")}>{copy.accept}</Button>
        </div>
      </aside>
    ) : null}
    {consent === "accepted" && (
      <Script id="soniva-ga4" src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive" onReady={() => setReady(initializeAnalytics())} />
    )}
  </>;
}

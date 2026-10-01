"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { siteCopy, useT } from "@/lib/i18n";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";

const CONSENT_KEY = "soniva_cookie_consent";

type ConsentState = "unset" | "accepted" | "rejected";

// 与 web 主站同一个键名，但这里只能存 localStorage：本站部署在 vercel.app /
// github.io，写不进 .soniva.uk 的共享 Cookie（浏览器会拒绝第三方 Domain）。
// 将来若迁到 soniva.uk 子域，把 readConsent/writeConsent 换成主站的
// shared-domain-storage 即可，键名不用动。
function readConsent(): ConsentState {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === "accepted" || stored === "rejected") return stored;
  } catch {
    // 隐私模式等存不了就不弹也不追踪，GA 不加载
  }
  return "unset";
}

// 同 web 主站的机制：GA 只在用户点「接受」之后才加载；客户端路由跳转不整页
// 加载，config 只记落地页一页，后续 page_view 在这里按 pathname 逐次补发
// （lastPath 逐次记录，保证每个路由恰好一条；刚点接受那一次 window.gtag 还
// 不存在，那次 page_view 由 config 负责，这里不发就是避免双份）。
export function CookieConsent() {
  const t = useT(siteCopy);
  const [consent, setConsent] = useState<ConsentState>("unset");
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setConsent(readConsent());
  }, []);

  useEffect(() => {
    const previous = lastPathRef.current;
    lastPathRef.current = pathname;
    if (consent !== "accepted" || previous === pathname) return;
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (!gtag) return;
    gtag("event", "page_view", { page_path: pathname });
  }, [consent, pathname]);

  const choose = (next: "accepted" | "rejected") => {
    try {
      localStorage.setItem(CONSENT_KEY, next);
    } catch {
      // 存不了就本次会话内生效
    }
    setConsent(next);
  };

  if (mounted && consent === "unset") {
    return (
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:px-8">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t("consentNotice")}{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
              {t("footerPrivacy")}
            </Link>
          </p>
          <div className="flex shrink-0 items-center justify-end gap-2 sm:ml-auto">
            <Button type="button" variant="outline" size="sm" onClick={() => choose("rejected")}>
              {t("consentReject")}
            </Button>
            <Button type="button" size="sm" onClick={() => choose("accepted")}>
              {t("consentAccept")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    consent === "accepted" && (
      <>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </>
    )
  );
}

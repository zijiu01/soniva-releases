"use client";

import Link from "next/link";
import { ArrowRight } from "@/components/animate-ui/icons/arrow-right";
import { AnimatedLucide } from "@/components/animate-ui/icons/animated-lucide";
import { SonivaLogo } from "@/components/soniva-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useWebsiteLocale } from "@/hooks/use-website-locale";
import { siteCopy, useT } from "@/lib/i18n";
import { appUrl, marketingUrl } from "@/lib/website-urls";

export function WebsiteFooter() {
  const t = useT(siteCopy);
  const { toggleLocale } = useWebsiteLocale();
  return (
    <footer>
      <div className="marketing-grid-frame marketing-footer-frame mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
          <div>
            <a href={marketingUrl} className="soniva-brand inline-flex items-center gap-1 font-semibold tracking-tight" aria-label="Soniva home">
              <SonivaLogo />
              <span className="text-lg font-medium">Soniva</span>
            </a>
            <p className="mt-4 ml-1 max-w-xs text-sm leading-6 text-muted-foreground">{t("footerTagline")}</p>
            <div className="mt-5 flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={toggleLocale}
                className="text-muted-foreground hover:bg-transparent pl-1 pr-2.5"
              >
                <AnimatedLucide name="Languages" className="size-3.5" animateOnHover />
                <span>{t("footerLanguage")}</span>
              </Button>
              <ThemeToggle />
            </div>
          </div>
          <FooterColumn
            title={t("footerProduct")}
            links={[
              { label: t("navDownload"), href: "/#download" },
              { label: t("footerPricing"), href: `${marketingUrl}/pricing` },
              { label: t("navDocs"), href: "/docs" },
            ]}
          />
          <FooterColumn
            title={t("footerResourceTitle")}
            links={[
              { label: t("navReleases"), href: "/#timeline" },
              { label: t("footerHelp"), href: `${marketingUrl}/help` },
            ]}
          />
          <FooterColumn
            title={t("footerLegal")}
            links={[
              { label: t("footerTerms"), href: `${marketingUrl}/terms` },
              { label: t("footerPrivacy"), href: `${marketingUrl}/privacy` },
              { label: t("footerRefund"), href: `${marketingUrl}/refund-policy` },
            ]}
          />
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Soniva</p>
          <a href={appUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-foreground">
            {t("footerVisit")}
            <ArrowRight className="size-3.5" animateOnHover />
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <ul className="mt-4 space-y-3">
        {links.map((link) => {
          const className = "text-sm text-muted-foreground transition-colors hover:text-foreground";
          return (
            <li key={link.href}>
              {link.href.startsWith("/") ? (
                <Link href={link.href} className={className}>
                  {link.label}
                </Link>
              ) : (
                <a href={link.href} className={className}>
                  {link.label}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

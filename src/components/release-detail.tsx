"use client";

import Link from "next/link";
import { ChannelBadge } from "@/components/channel-badge";
import { MarkdownContent } from "@/components/markdown/markdown-content";
import { Button, buttonVariants } from "@/components/ui/button";
import { useWebsiteLocale } from "@/hooks/use-website-locale";
import { siteCopy, useT } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import type { ReleaseEntry } from "@/lib/content/types";

export function ReleaseDetail({ release, bodies }: { release: ReleaseEntry; bodies: Record<Locale, string> }) {
  const t = useT(siteCopy);
  const { locale } = useWebsiteLocale();
  const title = locale === "zh-CN" ? release.titleZh : release.titleEn;
  const summary = locale === "zh-CN" ? release.summaryZh : release.summaryEn;

  return (
    <article className="marketing-grid-frame mx-auto max-w-4xl px-5 sm:px-8">
      <div className="section-pad">
        <Link href="/#timeline" className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline">
          ← {t("releaseBack")}
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-medium">v{release.version}</span>
          <ChannelBadge channel={release.channel} />
          <span className="text-xs text-muted-foreground">
            {release.date ? t("releasePublishedOn", { date: release.date }) : t("releaseNotPublished")}
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {summary && <p className="mt-5 text-base leading-8 text-muted-foreground">{summary}</p>}

        <section className="mt-10 rounded-xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-sm font-medium">{t("releaseDownloads")}</h2>
          {release.downloads.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">{t("releaseNoDownloads")}</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {release.downloads.map((asset) => (
                <li key={asset.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {asset.platform}
                      {asset.arch ? ` · ${asset.arch}` : ""}
                    </p>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {asset.filename}
                      {asset.size ? ` · ${asset.size}` : ""}
                    </p>
                  </div>
                  <div className="ml-auto">
                    {asset.href ? (
                      <a href={asset.href} className={buttonVariants({ size: "sm", variant: "default" })}>
                        {t("homeDownload")}
                      </a>
                    ) : (
                      <Button size="sm" variant="outline" disabled>
                        {t("homeComingSoon")}
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {release.channel !== "released" && (
            <p className="mt-4 text-xs text-muted-foreground">{t("releaseDownloadUnavailable")}</p>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-sm font-medium">{t("releaseNotes")}</h2>
          <div className="mt-4">
            <MarkdownContent markdown={bodies[locale]} />
          </div>
        </section>
      </div>
    </article>
  );
}

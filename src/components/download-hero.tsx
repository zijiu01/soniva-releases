"use client";

import { ChannelBadge } from "@/components/channel-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { useWebsiteLocale } from "@/hooks/use-website-locale";
import { siteCopy, useT } from "@/lib/i18n";
import type { ReleaseEntry } from "@/lib/content/types";

export function DownloadHero({ release }: { release?: ReleaseEntry }) {
  const t = useT(siteCopy);
  const { locale } = useWebsiteLocale();
  const title = release ? (locale === "zh-CN" ? release.titleZh : release.titleEn) : t("homeTitle");
  const summary = release ? (locale === "zh-CN" ? release.summaryZh : release.summaryEn) : t("homeSubtitle");

  return (
    <section id="download" className="marketing-grid-frame mx-auto max-w-6xl px-5 sm:px-8">
      <div className="section-pad-lg flex flex-col items-center text-center">
        <div className="flex items-center gap-2">
          {release && <ChannelBadge channel={release.channel} />}
          {release && (
            <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
              v{release.version}
            </span>
          )}
        </div>
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">{summary}</p>

        {release && release.downloads.length > 0 && (
          <div className="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:justify-center">
            {release.downloads.map((asset) =>
              asset.href ? (
                <a key={asset.id} href={asset.href} className={buttonVariants({ size: "lg", variant: "default" })}>
                  {asset.platform} · {asset.arch}
                </a>
              ) : (
                <Button key={asset.id} size="lg" variant="outline" disabled title={t("releaseDownloadUnavailable")}>
                  {asset.platform} · {asset.arch}
                  <span className="text-muted-foreground">· {t("homeComingSoon")}</span>
                </Button>
              ),
            )}
          </div>
        )}

        <a href="#timeline" className="mt-6 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline">
          {t("homeViewReleases")}
        </a>
      </div>
    </section>
  );
}

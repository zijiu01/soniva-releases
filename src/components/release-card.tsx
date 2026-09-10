"use client";

import Link from "next/link";
import { ChannelBadge } from "@/components/channel-badge";
import { useWebsiteLocale } from "@/hooks/use-website-locale";
import { siteCopy, useT } from "@/lib/i18n";
import type { ReleaseEntry } from "@/lib/content/types";

export function ReleaseCard({ release }: { release: ReleaseEntry }) {
  const t = useT(siteCopy);
  const { locale } = useWebsiteLocale();
  const title = locale === "zh-CN" ? release.titleZh : release.titleEn;
  const summary = locale === "zh-CN" ? release.summaryZh : release.summaryEn;
  const available = release.downloads.filter((asset) => asset.href).length;

  return (
    <Link
      href={`/releases/${release.version}`}
      className="group block rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/20 hover:bg-accent/40 sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-sm font-medium">v{release.version}</span>
        <ChannelBadge channel={release.channel} />
        <span className="ml-auto text-xs text-muted-foreground">
          {release.date ? t("releasePublishedOn", { date: release.date }) : t("releaseNotPublished")}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-semibold tracking-tight group-hover:text-foreground">{title}</h3>
      {summary && <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">{summary}</p>}
      <p className="mt-4 text-xs text-muted-foreground">
        {available > 0 ? `${t("releaseDownloads")} · ${available}` : t("releaseDownloadUnavailable")}
      </p>
    </Link>
  );
}

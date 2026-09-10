"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, Package } from "lucide-react";
import { MarkdownContent } from "@/components/markdown/markdown-content";
import { Button } from "@/components/ui/button";
import { useWebsiteLocale } from "@/hooks/use-website-locale";
import { siteCopy, useT } from "@/lib/i18n";
import type { TimelineEntry } from "@/lib/content/types";

type Bodies = Record<string, Record<"zh-CN" | "en-US", string>>;

type Props = {
  entry: TimelineEntry | null;
  entries: TimelineEntry[];
  bodies: Bodies;
  onSelect: (entry: TimelineEntry) => void;
};

/** 右栏 Markdown 详情阅读区：当前选中日志的完整正文 + 下载卡片 + 相关阅读。 */
export function DetailPanel({ entry, entries, bodies, onSelect }: Props) {
  const t = useT(siteCopy);
  const { locale } = useWebsiteLocale();
  if (!entry) return null;

  const title = locale === "zh-CN" ? entry.titleZh : entry.titleEn;
  const tag = entry.kind === "release" ? t("releaseTag") : locale === "zh-CN" ? entry.tagZh : entry.tagEn;
  const body = bodies[entry.href]?.[locale] ?? bodies[entry.href]?.["zh-CN"] ?? "";
  const related = entries.filter((item) => item.id !== entry.id).slice(0, 2);

  return (
    <article className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        {tag && (
          <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
            {tag}
          </span>
        )}
        <Link
          href={entry.href}
          className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("openFullPage")}
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <h3 className="mt-3 text-xl font-semibold leading-7 tracking-tight">{title}</h3>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-3.5" />
          {entry.date ?? t("releaseNotPublished")}
        </span>
        {entry.kind === "release" && (
          <span className="inline-flex items-center gap-1.5">
            <Package className="size-3.5" />
            {t("packageLabel")} v{entry.version}
          </span>
        )}
        {entry.kind === "doc" && entry.source && (
          <span className="truncate font-mono" title={entry.source}>
            {entry.source}
          </span>
        )}
      </div>

      <hr className="my-5 border-border" />

      <div className="text-sm">
        <MarkdownContent markdown={body} />
      </div>

      {entry.kind === "release" && (
        <section className="mt-6 rounded-xl border border-border bg-background p-4">
          <div className="flex items-center gap-3">
            <div className="min-w-0">
              <p className="font-mono text-sm font-medium">v{entry.version}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {entry.date ?? t("releaseNotPublished")}
                {entry.size ? ` · ${entry.size}` : ""}
              </p>
            </div>
            <div className="ml-auto">
              {entry.downloadAvailable ? (
                <Button
                  size="sm"
                  className="bg-foreground text-background hover:bg-foreground/90"
                  onClick={() => window.location.assign(entry.href)}
                >
                  {t("downloadNow")}
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled
                  title={t("homeComingSoon")}
                  className="bg-foreground text-background opacity-60"
                >
                  {t("downloadNow")}
                </Button>
              )}
            </div>
          </div>
          <Link
            href={entry.href}
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            {t("viewAllVersions")}
            <ArrowRight className="size-3.5" />
          </Link>
        </section>
      )}

      {entry.kind === "doc" && entry.source && (
        <p className="mt-5 font-mono text-xs text-muted-foreground">{t("devlogVerbatim")} · {entry.source}</p>
      )}

      {related.length > 0 && (
        <section className="mt-6 border-t border-border pt-4">
          <p className="text-xs font-medium text-muted-foreground">{t("relatedReading")}</p>
          <ul className="mt-2">
            {related.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  className="group flex w-full items-baseline gap-2 py-2 text-left text-sm transition-colors hover:text-primary"
                >
                  <span className="min-w-0 flex-1 truncate">
                    {locale === "zh-CN" ? item.titleZh : item.titleEn}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">{item.date}</span>
                  <ArrowRight className="size-3.5 shrink-0 self-center text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

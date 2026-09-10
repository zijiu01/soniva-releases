"use client";

import { CalendarDays, FileText, Package } from "lucide-react";
import { useWebsiteLocale } from "@/hooks/use-website-locale";
import { siteCopy, useT } from "@/lib/i18n";
import { formatDayLabel, formatMonthLabel, parseISODate } from "@/lib/date-format";
import type { TimelineEntry } from "@/lib/content/types";

type Props = {
  entries: TimelineEntry[];
  emptyLabel: string;
};

/** 核心时间线：一条贯穿的连接线，月度分组；整卡为新标签页链接。 */
export function TimelineList({ entries, emptyLabel }: Props) {
  const t = useT(siteCopy);
  const { locale } = useWebsiteLocale();
  const dateLocale = locale === "en-US" ? "en-US" : "zh-CN";
  const groups = groupByMonth(entries, dateLocale);

  return (
    <div className="relative">
      <h2 className="sr-only">{t("devlogTitle")}</h2>
      {/* 连接线：整条时间线从头贯到尾，不因年月分组断开 */}
      <span aria-hidden="true" className="absolute bottom-2 left-[5px] top-2 w-px bg-border" />

      {groups.map((group) => (
        <div
          key={group.key}
          id={group.key === "latest" ? "month-latest" : `month-${group.key}`}
          className="mb-10 scroll-mt-24 last:mb-0"
        >
          <h3 className="pl-7 text-lg font-semibold tracking-tight">
            {group.key === "latest" ? t("timelineLatest") : group.label}
          </h3>
          <ol className="mt-5 space-y-6">
            {group.entries.map((entry) => (
              <TimelineItem
                key={entry.id}
                entry={entry}
                dayLabel={entry.date ? dayLabel(entry.date, dateLocale) : t("releaseNotPublished")}
              />
            ))}
          </ol>
        </div>
      ))}
      {groups.length === 0 && <p className="text-sm text-muted-foreground">{emptyLabel}</p>}
    </div>
  );
}

function TimelineItem({ entry, dayLabel }: { entry: TimelineEntry; dayLabel: string }) {
  const t = useT(siteCopy);
  const { locale } = useWebsiteLocale();
  const title = locale === "zh-CN" ? entry.titleZh : entry.titleEn;
  const summary = locale === "zh-CN" ? entry.summaryZh : entry.summaryEn;
  const tag = entry.kind === "release" ? t("releaseTag") : locale === "zh-CN" ? entry.tagZh : entry.tagEn;

  return (
    <li className="relative pl-7">
      {/* 节点圆点：白底描边，11px 居中压在 left 5px 的 1px 连接线上 */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-1.5 size-[11px] rounded-full border-2 border-muted-foreground bg-background"
      />
      <p className="font-mono text-xs text-muted-foreground">{dayLabel}</p>
      <a
        id={`tl-${entry.id}`}
        href={entry.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-2 block scroll-mt-28 rounded-xl border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-sm sm:p-5"
      >
        <div className="flex items-stretch gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {tag && (
                <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                  {tag}
                </span>
              )}
              {entry.kind === "release" ? (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Package className="size-3.5" />
                  {t("packageLabel")} v{entry.version}
                </span>
              ) : null}
              {entry.date && (
                <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
                  <CalendarDays className="size-3.5" />
                  {entry.date}
                </span>
              )}
            </div>
            <h4 className="mt-2.5 line-clamp-2 text-[17px] font-semibold leading-6 tracking-tight">{title}</h4>
            {summary && <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted-foreground">{summary}</p>}
          </div>
          {/* 缩略图：所有卡片统一 112×80（7:5），缺图回退图标块 */}
          <span
            aria-hidden="true"
            className="h-20 w-28 shrink-0 self-center overflow-hidden rounded-lg border border-border bg-muted/50"
          >
            {entry.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={entry.image} alt="" loading="lazy" className="h-full w-full object-cover" />
            ) : (
              <span className="grid h-full w-full place-items-center text-muted-foreground">
                {entry.kind === "release" ? <Package className="size-5" /> : <FileText className="size-5" />}
              </span>
            )}
          </span>
        </div>
      </a>
    </li>
  );
}

function groupByMonth(entries: TimelineEntry[], locale: "zh-CN" | "en-US") {
  const groups: { key: string; label: string; entries: TimelineEntry[] }[] = [];
  const index = new Map<string, number>();
  for (const entry of entries) {
    const parsed = entry.date ? parseISODate(entry.date) : null;
    const key = parsed ? `${parsed.year}-${String(parsed.month).padStart(2, "0")}` : "latest";
    if (!index.has(key)) {
      const label = parsed ? formatMonthLabel(parsed.year, parsed.month, locale) : "";
      groups.push({ key, label, entries: [] });
      index.set(key, groups.length - 1);
    }
    groups[index.get(key)!].entries.push(entry);
  }
  return groups;
}

function dayLabel(date: string, locale: "zh-CN" | "en-US") {
  const parsed = parseISODate(date);
  if (!parsed) return date;
  return formatDayLabel(parsed.month, parsed.day, locale);
}

"use client";

import { CalendarDays, FileText, Package } from "lucide-react";
import { useWebsiteLocale } from "@/hooks/use-website-locale";
import { siteCopy, useT } from "@/lib/i18n";
import { formatDayLabel, formatMonthLabel, parseISODate } from "@/lib/date-format";
import type { TimelineEntry } from "@/lib/content/types";

type Props = {
  entries: TimelineEntry[];
  emptyLabel: string;
  selectedId: string | null;
  onSelect: (entry: TimelineEntry) => void;
};

/** 核心时间线：细蓝竖线 + 日期节点 + 日志卡片，月度分组，持续向下阅读。 */
export function TimelineList({ entries, emptyLabel, selectedId, onSelect }: Props) {
  const t = useT(siteCopy);
  const { locale } = useWebsiteLocale();
  const dateLocale = locale === "en-US" ? "en-US" : "zh-CN";
  const groups = groupByMonth(entries, dateLocale);

  return (
    <div>
      <h2 className="sr-only">{t("devlogTitle")}</h2>
      {groups.map((group) => (
        <div
          key={group.key}
          id={group.key === "latest" ? "month-latest" : `month-${group.key}`}
          className="mb-10 scroll-mt-24 last:mb-0"
        >
          <h3 className="text-lg font-semibold tracking-tight">
            {group.key === "latest" ? t("timelineLatest") : group.label}
          </h3>
          <ol className="relative mt-5 space-y-6">
            {/* 连接线：贯穿整月分组，压在圆点中心 */}
            <span aria-hidden className="absolute bottom-3 left-[5px] top-3 w-px bg-border" />
            {group.entries.map((entry) => (
              <TimelineItem
                key={entry.id}
                entry={entry}
                dayLabel={entry.date ? dayLabel(entry.date, dateLocale) : t("releaseNotPublished")}
                selected={entry.id === selectedId}
                onSelect={onSelect}
              />
            ))}
          </ol>
        </div>
      ))}
      {groups.length === 0 && <p className="text-sm text-muted-foreground">{emptyLabel}</p>}
    </div>
  );
}

function TimelineItem({
  entry,
  dayLabel,
  selected,
  onSelect,
}: {
  entry: TimelineEntry;
  dayLabel: string;
  selected: boolean;
  onSelect: (entry: TimelineEntry) => void;
}) {
  const t = useT(siteCopy);
  const { locale } = useWebsiteLocale();
  const title = locale === "zh-CN" ? entry.titleZh : entry.titleEn;
  const summary = locale === "zh-CN" ? entry.summaryZh : entry.summaryEn;
  const tag = entry.kind === "release" ? t("releaseTag") : locale === "zh-CN" ? entry.tagZh : entry.tagEn;

  return (
    <li className="relative pl-7">
      {/* 节点圆点：精确压在连接线上，选中加深 */}
      <span
        aria-hidden="true"
        className={`absolute left-0 top-1.5 size-2.5 rounded-full border-2 border-background transition-colors ${
          selected ? "bg-foreground" : "bg-muted-foreground/40"
        }`}
      />
      <p className="font-mono text-xs text-muted-foreground">{dayLabel}</p>
      <article
        id={`tl-${entry.id}`}
        onClick={() => onSelect(entry)}
        className={`group mt-2 scroll-mt-28 cursor-pointer rounded-xl border bg-card p-4 transition-all duration-200 sm:p-5 ${
          selected
            ? "border-foreground/60 shadow-sm"
            : "border-border hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-sm"
        }`}
      >
        <div className="flex items-start gap-4">
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
            <h4 className="mt-2.5 text-[17px] font-semibold leading-6 tracking-tight">{title}</h4>
            {summary && <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted-foreground">{summary}</p>}
          </div>
          <div className="flex shrink-0 flex-col items-end">
            <span
              aria-hidden="true"
              className="grid h-12 w-16 place-items-center rounded-lg border border-border bg-muted/50 text-muted-foreground"
            >
              {entry.kind === "release" ? <Package className="size-5" /> : <FileText className="size-5" />}
            </span>
          </div>
        </div>
      </article>
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

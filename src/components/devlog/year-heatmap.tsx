"use client";

import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useWebsiteLocale } from "@/hooks/use-website-locale";
import { siteCopy, useT } from "@/lib/i18n";
import { daysInMonth, parseISODate } from "@/lib/date-format";
import type { TimelineEntry } from "@/lib/content/types";

type Props = {
  entries: TimelineEntry[];
  onSelect: (entry: TimelineEntry) => void;
};

type DayInfo = { count: number; entries: TimelineEntry[] };

/** 「快速定位」：GitHub Contributions 风格频率图。每天一颗方块（空日灰色），
 *  有日志的按条数加深；每一年都是独立可折叠的区块，任意日期可点。 */
export function YearHeatmap({ entries, onSelect }: Props) {
  const t = useT(siteCopy);
  const { locale } = useWebsiteLocale();

  const days = useMemoDays(entries);
  const years = useMemoYears(entries);
  const monthNames = MONTH_NAMES[locale === "en-US" ? "en" : "zh"];
  const [expanded, setExpanded] = useState<number[]>(() => years.slice(0, 1));

  const toggle = (year: number) =>
    setExpanded((prev) => (prev.includes(year) ? prev.filter((item) => item !== year) : [...prev, year]));

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-medium">{t("quickLocate")}</p>
      <div className="mt-1">
        {years.map((year) => {
          const open = expanded.includes(year);
          return (
            <div key={year} className="border-b border-border last:border-b-0">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => toggle(year)}
                className="flex w-full items-center gap-1.5 py-2.5 text-sm text-foreground"
              >
                <ChevronRight
                  className={`size-3.5 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`}
                />
                <span className="font-mono">{year}</span>
                <span className="ml-auto font-mono text-xs text-muted-foreground">
                  {yearEntryCount(entries, year)} {locale === "en-US" ? "entries" : "条"}
                </span>
              </button>
              {open && (
                <div className="grid grid-cols-3 gap-x-3 gap-y-4 pb-4 pt-1">
                  {Array.from({ length: 12 }, (_, index) => (
                    <MonthGrid
                      key={index}
                      year={year}
                      month={index + 1}
                      label={monthNames[index]}
                      days={days}
                      onSelect={onSelect}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthGrid({
  year,
  month,
  label,
  days,
  onSelect,
}: {
  year: number;
  month: number;
  label: string;
  days: Map<string, DayInfo>;
  onSelect: (entry: TimelineEntry) => void;
}) {
  const { locale } = useWebsiteLocale();
  const total = daysInMonth(year, month);
  const cells = Array.from({ length: Math.ceil(total / 7) * 7 }, (_, index) => {
    const day = index + 1;
    return day <= total ? day : null;
  });
  return (
    <div>
      <p className="text-center text-[10px] leading-4 text-muted-foreground">{label}</p>
      <div className="mt-1.5 grid grid-cols-7 gap-[3px]">
        {cells.map((day, index) => {
          if (day === null) return <span key={`pad-${index}`} aria-hidden="true" className="size-2" />;
          const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const info = days.get(iso);
          const tip = info
            ? `${iso} · ${info.count} ${locale === "en-US" ? (info.count > 1 ? "entries" : "entry") : "条日志"}`
            : iso;
          return (
            <button
              key={iso}
              type="button"
              aria-label={tip}
              title={tip}
              onClick={() => {
                const target = info ? info.entries[0] : nearestEntry(days, iso);
                if (target) onSelect(target);
              }}
              className={`size-2 rounded-[2px] transition-transform hover:scale-125 ${
                info ? levelClass(info.count) : "bg-muted-foreground/20 hover:bg-muted-foreground/35"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

/** GitHub 风格深浅：当日日志越多，蓝色越深（chart Token，数据可视化专用）。 */
function levelClass(count: number): string {
  if (count >= 3) return "bg-chart-3";
  if (count === 2) return "bg-chart-2";
  return "bg-chart-1";
}

function useMemoDays(entries: TimelineEntry[]): Map<string, DayInfo> {
  const map = new Map<string, DayInfo>();
  for (const entry of entries) {
    if (!entry.date) continue;
    const info = map.get(entry.date) ?? { count: 0, entries: [] };
    info.count += 1;
    info.entries.push(entry);
    map.set(entry.date, info);
  }
  return map;
}

function useMemoYears(entries: TimelineEntry[]): number[] {
  const years = new Set<number>();
  for (const entry of entries) {
    const parsed = entry.date ? parseISODate(entry.date) : null;
    if (parsed) years.add(parsed.year);
  }
  if (years.size === 0) years.add(new Date().getFullYear());
  return [...years].sort((a, b) => b - a);
}

function yearEntryCount(entries: TimelineEntry[], year: number): number {
  return entries.filter((entry) => entry.date?.startsWith(String(year))).length;
}

/** 空白日期 → 最近的日志条目：优先同月最近一天，其次同年，再全局。 */
function nearestEntry(days: Map<string, DayInfo>, iso: string): TimelineEntry | undefined {
  const [y, m, d] = iso.split("-").map(Number);
  let best: { dist: number; entry: TimelineEntry } | null = null;
  for (const [date, info] of days) {
    const [yy, mm, dd] = date.split("-").map(Number);
    const dist =
      yy === y && mm === m
        ? Math.abs(dd - d)
        : yy === y
          ? 100 + Math.abs(mm * 31 + dd - (m * 31 + d))
          : 10000 + Math.abs(yy * 372 + mm * 31 + dd - (y * 372 + m * 31 + d));
    if (!best || dist < best.dist) best = { dist, entry: info.entries[0] };
  }
  return best?.entry;
}

const MONTH_NAMES = {
  zh: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
} as const;

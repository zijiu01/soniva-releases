"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { DetailPanel } from "@/components/devlog/detail-panel";
import { PackageList } from "@/components/devlog/package-list";
import { TimelineList } from "@/components/devlog/timeline-list";
import { YearHeatmap } from "@/components/devlog/year-heatmap";
import { Input } from "@/components/ui/input";
import { siteCopy, useT } from "@/lib/i18n";
import type { TimelineEntry } from "@/lib/content/types";

type Bodies = Record<string, Record<"zh-CN" | "en-US", string>>;

type Props = {
  entries: TimelineEntry[];
  bodies: Bodies;
};

/** 核心三栏：快速定位 + 最新发布包 ｜ 月度分组时间线 ｜ 详情阅读区。
 *  点卡片 → 卡片滚到视口顶部，右栏 sticky 面板与其对齐，持续可读。 */
export function TimelineView({ entries, bodies }: Props) {
  const t = useT(siteCopy);
  const [selectedId, setSelectedId] = useState(entries[0]?.id ?? null);
  const [query, setQuery] = useState("");
  const selected = entries.find((entry) => entry.id === selectedId) ?? entries[0] ?? null;

  const select = (entry: TimelineEntry) => {
    setSelectedId(entry.id);
    // 窄屏没有右栏阅读区，点击进该条目指向的详情页。
    if (typeof window !== "undefined" && !window.matchMedia("(min-width: 1280px)").matches) {
      window.location.href = entry.href;
    }
    // 宽屏只切换右栏预览，不自动滚动页面。
  };

  const scrollToEntry = (entry: TimelineEntry) => {
    select(entry);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((entry) =>
      [
        entry.titleZh, entry.titleEn, entry.summaryZh, entry.summaryEn,
        entry.tagZh, entry.tagEn, entry.date, entry.version ?? "",
      ].join(" ").toLowerCase().includes(q),
    );
  }, [entries, query]);

  return (
    <section className="marketing-grid-frame mx-auto max-w-none px-5 sm:px-8">
      <div className="section-pad-sm grid items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,8fr)_minmax(0,15fr)]">
        <div className="space-y-5 lg:sticky lg:top-20">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchPlaceholder")}
              className="pl-9"
            />
          </div>
          <YearHeatmap entries={entries} onSelect={scrollToEntry} />
          <PackageList entries={entries} />
        </div>

        <div id="timeline" className="scroll-mt-24">
          <TimelineList
            entries={filtered}
            emptyLabel={query.trim() ? t("searchEmpty") : t("homeEmpty")}
            selectedId={selected?.id ?? null}
            onSelect={select}
          />
        </div>

        <div className="hidden xl:block xl:self-stretch">
          <div className="xl:sticky xl:top-20 xl:max-h-[calc(100dvh-6rem)] xl:overflow-y-auto xl:pr-0.5">
            <DetailPanel entry={selected} entries={entries} bodies={bodies} onSelect={select} />
          </div>
        </div>
      </div>
    </section>
  );
}

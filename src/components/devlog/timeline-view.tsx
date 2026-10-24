"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PackageList } from "@/components/devlog/package-list";
import { TimelineList } from "@/components/devlog/timeline-list";
import { YearHeatmap } from "@/components/devlog/year-heatmap";
import { Input } from "@/components/ui/input";
import { siteCopy, useT } from "@/lib/i18n";
import type { TimelineEntry } from "@/lib/content/types";
import { downloadCopy } from "@/components/download/copy";

type Props = { entries: TimelineEntry[] };

/** 两栏布局：快速定位 + 最新发布包 ｜ 月度分组时间线。
 *  卡片与日期方块点击后在新标签页打开对应详情页。 */
export function TimelineView({ entries }: Props) {
  const t = useT(siteCopy);
  const d = useT(downloadCopy);
  const [query, setQuery] = useState("");

  // 频率图方块：滚动中间栏到对应卡片（不跳详情）。
  const scrollToEntry = (entry: TimelineEntry) => {
    document.getElementById(`tl-${entry.id}`)?.scrollIntoView({ block: "center" });
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
    <section data-download-timeline>
      <div className="site-rail marketing-grid-frame site-dotted-floor section-pad">
        <div className="home-section-heading">
          <h2 className="site-h2">{d("timelineTitle")}</h2>
          <p className="site-body mt-4 text-muted-foreground">{d("timelineLead")}</p>
        </div>
        <div className="grid items-start gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16">
          <div className="min-h-0 space-y-5 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-2">
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

          <div id="timeline" className="min-w-0 scroll-mt-24">
            <TimelineList entries={filtered} emptyLabel={query.trim() ? t("searchEmpty") : t("homeEmpty")} />
          </div>
        </div>
      </div>
    </section>
  );
}

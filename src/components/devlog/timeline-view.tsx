"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PackageList } from "@/components/devlog/package-list";
import { TimelineList } from "@/components/devlog/timeline-list";
import { YearHeatmap } from "@/components/devlog/year-heatmap";
import { Input } from "@/components/ui/input";
import { siteCopy, useT } from "@/lib/i18n";
import type { TimelineEntry } from "@/lib/content/types";

type Props = { entries: TimelineEntry[] };

/** 两栏布局：快速定位 + 最新发布包 ｜ 月度分组时间线。
 *  卡片与日期方块点击后在新标签页打开对应详情页。 */
export function TimelineView({ entries }: Props) {
  const t = useT(siteCopy);
  const [query, setQuery] = useState("");

  const openEntry = (entry: TimelineEntry) => {
    window.open(entry.href, "_blank", "noopener,noreferrer");
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
      <div className="section-pad-sm grid items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
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
          <YearHeatmap entries={entries} onSelect={openEntry} />
          <PackageList entries={entries} />
        </div>

        <div id="timeline" className="scroll-mt-24">
          <TimelineList entries={filtered} emptyLabel={query.trim() ? t("searchEmpty") : t("homeEmpty")} />
        </div>
      </div>
    </section>
  );
}

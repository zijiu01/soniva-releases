import { getDevlogPosts } from "@/lib/content/devlog";
import { getReleases } from "@/lib/content/releases";
import type { TimelineEntry } from "@/lib/content/types";

/** 版本发布 + 开发文档合成一条时间线，未定档的发布排最前，其余按日期倒序。
 *  卡片示意图已按用户要求停用（2026-09-20）——image 缺省时 timeline-list 回退图标块。 */
export function getTimelineEntries(): TimelineEntry[] {
  const releases: TimelineEntry[] = getReleases().map((release) => ({
    id: `/releases/${release.version}`,
    kind: "release",
    href: `/releases/${release.version}`,
    date: release.date,
    version: release.version,
    tagZh: null,
    tagEn: null,
    titleZh: release.titleZh,
    titleEn: release.titleEn,
    summaryZh: release.summaryZh,
    summaryEn: release.summaryEn,
    size: release.downloads[0]?.size ?? null,
    downloadAvailable: release.channel === "released" && release.downloads.some((asset) => asset.href),
  }));
  const docs: TimelineEntry[] = getDevlogPosts().map((post) => ({
    id: `/devlog/${post.slug}`,
    kind: "doc",
    href: `/devlog/${post.slug}`,
    date: post.date,
    tagZh: post.tagZh,
    tagEn: post.tagEn,
    titleZh: post.titleZh,
    titleEn: post.titleEn,
    summaryZh: post.summaryZh,
    summaryEn: post.summaryEn,
    source: post.source,
  }));
  return [...releases, ...docs].sort((a, b) =>
    (b.date ?? "9999-99-99").localeCompare(a.date ?? "9999-99-99"),
  );
}

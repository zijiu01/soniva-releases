import { getDevlogPosts, readDevlogBody } from "@/lib/content/devlog";
import { getReleases, readReleaseBody } from "@/lib/content/releases";
import { buildMockEntries } from "@/lib/content/mock-entries";
import type { TimelineEntry } from "@/lib/content/types";

type BodyLocale = "zh-CN" | "en-US";

/** 版本发布 + 开发文档（含演示占位）合成一条时间线，未定档的发布排最前，其余按日期倒序。 */
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
  return [...releases, ...docs, ...buildMockEntries()].sort(
    (a, b) => (b.date ?? "9999-99-99").localeCompare(a.date ?? "9999-99-99"),
  );
}

/** 一次性取出每条时间线条目的双语文档正文，供右侧 Markdown 阅读区使用。 */
export function getTimelineBodies(): Record<string, Record<BodyLocale, string>> {
  const bodies: Record<string, Record<BodyLocale, string>> = {};
  for (const release of getReleases()) {
    bodies[`/releases/${release.version}`] = {
      "zh-CN": readReleaseBody(release.version, "zh-CN"),
      "en-US": readReleaseBody(release.version, "en-US"),
    };
  }
  for (const post of getDevlogPosts()) {
    bodies[`/devlog/${post.slug}`] = {
      "zh-CN": readDevlogBody(post.slug, "zh-CN"),
      "en-US": readDevlogBody(post.slug, "en-US"),
    };
  }
  return bodies;
}

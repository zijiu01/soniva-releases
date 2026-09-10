import fs from "node:fs";
import path from "node:path";
import { getDevlogPosts } from "@/lib/content/devlog";
import { getReleases } from "@/lib/content/releases";
import { buildMockEntries } from "@/lib/content/mock-entries";
import type { TimelineEntry } from "@/lib/content/types";

/** 卡片示意图目录（.gitignore 的本地占位素材，不存在则回退图标块）。 */
const imageDir = path.join(process.cwd(), "public", "images", "posts");

function getImagePool(): string[] {
  try {
    return fs
      .readdirSync(imageDir)
      .filter((file) => /\.(jpe?g|png|webp|avif)$/i.test(file))
      .sort()
      .map((file) => `/images/posts/${file}`);
  } catch {
    return [];
  }
}

/** 由 id 确定性散列出图片下标：同一构建内分配稳定，观感随机。 */
function pickImage(pool: string[], id: string): string | null {
  if (pool.length === 0) return null;
  let hash = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return pool[(hash >>> 0) % pool.length];
}

/** 版本发布 + 开发文档（含演示占位）合成一条时间线，未定档的发布排最前，其余按日期倒序。 */
export function getTimelineEntries(): TimelineEntry[] {
  const pool = getImagePool();
  const assignImage = (entry: TimelineEntry): TimelineEntry => ({
    ...entry,
    image: pickImage(pool, entry.id),
  });

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
  return [...releases, ...docs, ...buildMockEntries()]
    .sort((a, b) => (b.date ?? "9999-99-99").localeCompare(a.date ?? "9999-99-99"))
    .map(assignImage);
}

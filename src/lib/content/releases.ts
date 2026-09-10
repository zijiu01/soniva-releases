import fs from "node:fs";
import path from "node:path";
import { parseMarkdownFile, extractTitleAndSummary } from "@/lib/content/parse";
import { stripLeadingTitle } from "@/lib/markdown";
import { releaseAssetUrl } from "@/lib/site";
import type { ReleaseChannel, ReleaseDownload, ReleaseEntry } from "@/lib/content/types";

const releasesDir = path.join(process.cwd(), "public", "releases");

type Locale = "zh-CN" | "en-US";

type FrontmatterDownload = {
  id?: string;
  platform?: string;
  arch?: string;
  filename?: string;
  size?: string;
  url?: string;
};

function readLocale(version: string, locale: Locale) {
  const file = locale === "en-US" ? `${version}.en.md` : `${version}.md`;
  const full = path.join(releasesDir, file);
  if (!fs.existsSync(full)) {
    const fallback = path.join(releasesDir, `${version}.md`);
    if (locale === "en-US" && fs.existsSync(fallback)) return parseMarkdownFile(fallback);
    return null;
  }
  return parseMarkdownFile(full);
}

function buildDownloads(data: Record<string, unknown>, tag: string, channel: ReleaseChannel): ReleaseDownload[] {
  const list = Array.isArray(data.downloads) ? (data.downloads as FrontmatterDownload[]) : [];
  return list
    .filter((item) => item && item.filename)
    .map((item, index) => {
      const filename = String(item.filename);
      const href = channel === "released" ? item.url || releaseAssetUrl(tag, filename) : null;
      return {
        id: item.id ? String(item.id) : `asset-${index + 1}`,
        platform: item.platform ? String(item.platform) : "",
        arch: item.arch ? String(item.arch) : "",
        filename,
        size: item.size ? String(item.size) : undefined,
        href: href || null,
      };
    });
}

function readRelease(version: string): ReleaseEntry | null {
  const zh = readLocale(version, "zh-CN");
  if (!zh) return null;
  const en = readLocale(version, "en-US") ?? zh;
  const data = zh.data;
  const channel = (data.channel as ReleaseChannel) ?? "upcoming";
  const tag = data.tag ? String(data.tag) : `v${version}`;
  const zhHead = extractTitleAndSummary(zh.content);
  const enHead = extractTitleAndSummary(en.content);
  return {
    version: data.version ? String(data.version) : version,
    tag,
    date: data.date ? String(data.date) : null,
    channel,
    titleZh: data.headline ? String(data.headline) : zhHead.title,
    titleEn: data.headline ? String(data.headline) : enHead.title,
    summaryZh: zhHead.summary,
    summaryEn: enHead.summary,
    downloads: buildDownloads(data, tag, channel),
  };
}

export function getReleases(): ReleaseEntry[] {
  if (!fs.existsSync(releasesDir)) return [];
  const versions = fs
    .readdirSync(releasesDir)
    .filter((file) => file.endsWith(".md") && !file.endsWith(".en.md"))
    .map((file) => file.slice(0, -3));
  return versions
    .map(readRelease)
    .filter((entry): entry is ReleaseEntry => Boolean(entry))
    .sort((a, b) => {
      const dateA = a.date ?? "9999-99-99";
      const dateB = b.date ?? "9999-99-99";
      return dateA === dateB ? b.version.localeCompare(a.version) : dateB.localeCompare(dateA);
    });
}

export function getRelease(version: string): ReleaseEntry | undefined {
  return getReleases().find((entry) => entry.version === version);
}

export function readReleaseBody(version: string, locale: Locale): string {
  const parsed = readLocale(version, locale) ?? readLocale(version, "zh-CN");
  return parsed ? stripLeadingTitle(parsed.content) : "";
}

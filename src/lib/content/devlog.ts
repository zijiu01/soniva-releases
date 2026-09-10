import fs from "node:fs";
import path from "node:path";
import { parseMarkdownFile, extractTitleAndSummary } from "@/lib/content/parse";
import { stripLeadingTitle } from "@/lib/markdown";
import type { DevLogEntry } from "@/lib/content/types";

const devlogDir = path.join(process.cwd(), "public", "devlog");

type Locale = "zh-CN" | "en-US";

function readLocale(slug: string, locale: Locale) {
  const file = locale === "en-US" ? `${slug}.en.md` : `${slug}.md`;
  const full = path.join(devlogDir, file);
  if (!fs.existsSync(full)) {
    const fallback = path.join(devlogDir, `${slug}.md`);
    if (locale === "en-US" && fs.existsSync(fallback)) return parseMarkdownFile(fallback);
    return null;
  }
  return parseMarkdownFile(full);
}

function readPost(slug: string): DevLogEntry | null {
  const zh = readLocale(slug, "zh-CN");
  if (!zh) return null;
  const en = readLocale(slug, "en-US") ?? zh;
  const zhHead = extractTitleAndSummary(zh.content);
  const enHead = extractTitleAndSummary(en.content);
  return {
    slug,
    date: zh.data.date ? String(zh.data.date) : null,
    tagZh: zh.data.tag ? String(zh.data.tag) : null,
    tagEn: en.data.tag ? String(en.data.tag) : null,
    source: zh.data.source ? String(zh.data.source) : null,
    titleZh: zh.data.title ? String(zh.data.title) : zhHead.title,
    titleEn: en.data.title ? String(en.data.title) : enHead.title,
    summaryZh: zhHead.summary,
    summaryEn: enHead.summary,
  };
}

export function getDevlogPosts(): DevLogEntry[] {
  if (!fs.existsSync(devlogDir)) return [];
  const slugs = fs
    .readdirSync(devlogDir)
    .filter((file) => file.endsWith(".md") && !file.endsWith(".en.md"))
    .map((file) => file.slice(0, -3));
  return slugs
    .map(readPost)
    .filter((entry): entry is DevLogEntry => Boolean(entry))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || a.slug.localeCompare(b.slug));
}

export function getDevlogPost(slug: string): DevLogEntry | undefined {
  return getDevlogPosts().find((entry) => entry.slug === slug);
}

export function readDevlogBody(slug: string, locale: Locale): string {
  const parsed = readLocale(slug, locale) ?? readLocale(slug, "zh-CN");
  return parsed ? stripLeadingTitle(parsed.content) : "";
}

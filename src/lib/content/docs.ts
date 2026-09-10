import fs from "node:fs";
import path from "node:path";
import { parseMarkdownFile, extractTitleAndSummary } from "@/lib/content/parse";
import { stripLeadingTitle } from "@/lib/markdown";
import type { DocEntry } from "@/lib/content/types";

const docsDir = path.join(process.cwd(), "public", "docs");

type Locale = "zh-CN" | "en-US";

function readLocale(slug: string, locale: Locale) {
  const file = locale === "en-US" ? `${slug}.en.md` : `${slug}.md`;
  const full = path.join(docsDir, file);
  if (!fs.existsSync(full)) {
    const fallback = path.join(docsDir, `${slug}.md`);
    if (locale === "en-US" && fs.existsSync(fallback)) return parseMarkdownFile(fallback);
    return null;
  }
  return parseMarkdownFile(full);
}

function readDoc(slug: string): (DocEntry & { order: number }) | null {
  const zh = readLocale(slug, "zh-CN");
  if (!zh) return null;
  const en = readLocale(slug, "en-US") ?? zh;
  const zhHead = extractTitleAndSummary(zh.content);
  const enHead = extractTitleAndSummary(en.content);
  const order = typeof zh.data.order === "number" ? zh.data.order : Number.MAX_SAFE_INTEGER;
  return {
    slug,
    order,
    titleZh: zh.data.title ? String(zh.data.title) : zhHead.title,
    titleEn: en.data.title ? String(en.data.title) : enHead.title,
    summaryZh: zhHead.summary,
    summaryEn: enHead.summary,
  };
}

export function getDocs(): DocEntry[] {
  if (!fs.existsSync(docsDir)) return [];
  const slugs = fs
    .readdirSync(docsDir)
    .filter((file) => file.endsWith(".md") && !file.endsWith(".en.md"))
    .map((file) => file.slice(0, -3));
  return slugs
    .map(readDoc)
    .filter((entry): entry is DocEntry & { order: number } => Boolean(entry))
    .sort((a, b) => (a.order === b.order ? a.slug.localeCompare(b.slug) : a.order - b.order))
    .map(({ order: _order, ...entry }) => entry);
}

export function getDoc(slug: string): DocEntry | undefined {
  return getDocs().find((entry) => entry.slug === slug);
}

export function readDocBody(slug: string, locale: Locale): string {
  const parsed = readLocale(slug, locale) ?? readLocale(slug, "zh-CN");
  return parsed ? stripLeadingTitle(parsed.content) : "";
}

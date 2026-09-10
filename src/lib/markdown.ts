import { slugifyHeading } from "@/lib/slugify";

/** 照录文档里的状态 emoji（✅❌⚠️🚨 等）在界面上显得杂乱，展示层统一滤掉。 */
const EMOJI_NOISE =
  /[\u2705\u274C\u26A0\uFE0F\u2714\u2611\u{1F6A8}\u{1F7E1}\u{1F534}\u{1F7E2}\u{27A1}\uFE0F]/gu;

export function stripEmojiNoise(markdown: string): string {
  return markdown.replace(EMOJI_NOISE, "");
}

/** 去掉正文开头的 `# 标题` 行——标题由页面单独渲染，避免正文里重复一个 H1。 */
export function stripLeadingTitle(markdown: string): string {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const titleIndex = lines.findIndex((line) => line.startsWith("# "));
  if (titleIndex === -1) return markdown;
  return lines.slice(titleIndex + 1).join("\n").replace(/^\s*\n/, "");
}

/** 扫描正文的 `## `/`### ` 标题，供目录使用；id 必须与 MarkdownContent 生成的 slug 一致。 */
export function extractHeadings(markdown: string): { id: string; text: string; level: 2 | 3 }[] {
  const lines = markdown.replace(/\r/g, "").split("\n");
  return lines
    .filter((line) => line.startsWith("## ") || line.startsWith("### "))
    .map((line) => {
      const level = line.startsWith("### ") ? 3 : 2;
      const text = line.slice(level === 3 ? 4 : 3).trim();
      return { id: slugifyHeading(text), text, level: level as 2 | 3 };
    });
}

import { slugifyHeading } from "@/lib/slugify";

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

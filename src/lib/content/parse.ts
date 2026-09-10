import fs from "node:fs";
import matter from "gray-matter";

export type ParsedMarkdown = { data: Record<string, unknown>; content: string };

/** 读取带 frontmatter 的 md。frontmatter 承载结构化元数据（版本、日期、下载资产），
 *  正文写更新说明——卡片摘要从正文首段摘录，避免把内容写死在 TS 里。 */
export function parseMarkdownFile(filePath: string): ParsedMarkdown {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  return { data: parsed.data as Record<string, unknown>, content: parsed.content.replace(/^\s*\n/, "") };
}

/** 标题优先取正文的 `# ` 一级标题；摘要取第一个 `##` 之前的首段正文（可含引用块）。 */
export function extractTitleAndSummary(markdown: string): { title: string; summary: string } {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const titleIndex = lines.findIndex((line) => line.startsWith("# "));
  const title = titleIndex >= 0 ? lines[titleIndex].slice(2).trim() : "";
  const firstHeadingIndex = lines.findIndex((line, index) => index > titleIndex && /^#{2,6} /.test(line));
  const introLines = lines.slice(titleIndex + 1, firstHeadingIndex === -1 ? undefined : firstHeadingIndex);
  const summaryLines: string[] = [];
  for (const rawLine of introLines) {
    const trimmed = rawLine.trim();
    if (trimmed.startsWith("**") && trimmed.endsWith("**")) continue;
    const stripped = trimmed.replace(/^>\s?/, "").trim();
    if (!stripped || stripped === "---") {
      if (summaryLines.length) break;
      continue;
    }
    summaryLines.push(stripped);
  }
  const summary = summaryLines
    .join(" ")
    .replace(/\*\*/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
  return { title, summary };
}

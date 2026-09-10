import fs from "node:fs";
import path from "node:path";
import { extractHeadings, stripLeadingTitle } from "@/lib/markdown";

const legalDir = path.join(process.cwd(), "public", "legal");

export type LegalLocale = "zh-CN" | "en-US";

export interface LegalSection {
  title: string;
  body: string;
}

export interface LegalDocumentData {
  title: string;
  effectiveDate?: string;
  intro: string;
  sections: LegalSection[];
  headings: { id: string; text: string }[];
}

/** 构建期读取 public/legal/<id>.md（官网照录），解析为 标题/生效日期/引言/编号小节。 */
export function getLegalDocument(id: string): Record<LegalLocale, LegalDocumentData> {
  return {
    "zh-CN": parse(readFile(id, "zh-CN")),
    "en-US": parse(readFile(id, "en-US")),
  };
}

function readFile(id: string, locale: LegalLocale): string {
  const file = locale === "en-US" ? `${id}.en.md` : `${id}.md`;
  const full = path.join(legalDir, file);
  if (!fs.existsSync(full)) return "";
  return fs.readFileSync(full, "utf8");
}

function parse(markdown: string): LegalDocumentData {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const title = lines.find((line) => line.startsWith("# "))?.slice(2).trim() ?? "Soniva";
  const body = stripLeadingTitle(markdown);
  const headings = extractHeadings(body);
  const bodyLines = body.split("\n");
  const firstH2 = bodyLines.findIndex((line) => line.startsWith("## "));

  const introLines = firstH2 === -1 ? bodyLines : bodyLines.slice(0, firstH2);
  const effectiveDate = introLines.find((line) => line.trim().startsWith("**") && line.trim().endsWith("**"))
    ?.trim()
    .slice(2, -2);
  const intro = introLines
    .filter((line) => !(line.trim().startsWith("**") && line.trim().endsWith("**")) && line.trim() !== "---")
    .join("\n")
    .trim();

  const sections: LegalSection[] = [];
  if (firstH2 !== -1) {
    let current: { title: string; lines: string[] } | null = null;
    for (const line of bodyLines.slice(firstH2)) {
      if (line.startsWith("## ")) {
        if (current) sections.push({ title: current.title, body: current.lines.join("\n").trim() });
        current = { title: line.slice(3).trim(), lines: [] };
        continue;
      }
      if (line.trim() === "---") continue;
      current?.lines.push(line);
    }
    if (current) sections.push({ title: current.title, body: current.lines.join("\n").trim() });
  }

  return { title, effectiveDate, intro, sections, headings };
}

#!/usr/bin/env node
// 把 AGENTS.md / code-style.md 里写的"单文件 300 行硬上限"变成机器执行的门禁。
// 入口文件（page/layout）另设 150 行建议线，超了只警告不失败。
import { readdirSync, readFileSync } from "node:fs";
import { join, extname, relative, sep } from "node:path";

const ROOT = join(import.meta.dirname, "..", "src");
const HARD_LIMIT = 300;
const ENTRY_LIMIT = 150;
const EXTS = new Set([".ts", ".tsx", ".css"]);
const ENTRY_RE = /(page|layout|template|not-found)\.tsx$/;

function walk(dir, out) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else if (EXTS.has(extname(entry.name))) out.push(path);
  }
}

const files = [];
walk(ROOT, files);

const offenders = [];
const warnings = [];
for (const path of files) {
  const rel = join("src", relative(ROOT, path)).split(sep).join("/");
  const lines = readFileSync(path, "utf8").split("\n").length;
  if (lines > HARD_LIMIT) offenders.push({ rel, lines });
  else if (ENTRY_RE.test(path) && lines > ENTRY_LIMIT) warnings.push({ rel, lines });
}

for (const { rel, lines } of warnings) {
  console.warn(`⚠️  入口文件偏长（建议 ≤ ${ENTRY_LIMIT} 行）：${lines} 行  ${rel}`);
}

if (offenders.length > 0) {
  console.error(`以下文件超过 ${HARD_LIMIT} 行硬上限，先拆再加：`);
  for (const { rel, lines } of offenders) console.error(`  ${lines} 行  ${rel}`);
  process.exit(1);
}

console.log(`file-size 检查通过：${files.length} 个文件。`);

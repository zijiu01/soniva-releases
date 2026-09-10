import { getDevlogPosts } from "@/lib/content/devlog";
import type { TimelineEntry } from "@/lib/content/types";

/**
 * 🟡 演示占位数据：真实开发日志积累起来之前，让活跃度频率图和时间线有可看的密度。
 *
 * 规则（用户约定）：不虚构内容——每条占位条目都复用现有真实文档的标题、摘要、
 * 正文与详情页，只铺开日期（2023-01 → 2026-08，9 月留白给真实条目）。
 * 真实日志就位后：删除本文件，并摘除 timeline.ts 里的 buildMockEntries 调用。
 *
 * 生成是确定性的（FNV 哈希伪随机），保证每次构建产物一致。
 */

const RANGE = { fromYear: 2023, toYear: 2026, toMonth: 8 };

export function buildMockEntries(): TimelineEntry[] {
  const sources = getDevlogPosts();
  if (sources.length === 0) return [];

  const entries: TimelineEntry[] = [];
  for (let year = RANGE.fromYear; year <= RANGE.toYear; year += 1) {
    const lastMonth = year === RANGE.toYear ? RANGE.toMonth : 12;
    for (let month = 1; month <= lastMonth; month += 1) {
      for (const slot of monthSlots(year, month)) {
        const source = sources[slot.index % sources.length];
        const date = `${year}-${pad(month)}-${pad(slot.day)}`;
        entries.push({
          id: `mock-${date}-${slot.index}`,
          kind: "doc",
          href: `/devlog/${source.slug}`,
          date,
          tagZh: source.tagZh,
          tagEn: source.tagEn,
          titleZh: source.titleZh,
          titleEn: source.titleEn,
          summaryZh: source.summaryZh,
          summaryEn: source.summaryEn,
          source: source.source,
        });
      }
    }
  }
  return entries;
}

/** 每月 0~4 条：确定性伪随机铺日期，尽量不重复同一天（同天多条可展示深蓝色）。 */
function monthSlots(year: number, month: number): { day: number; index: number }[] {
  const r = rand01(`${year}-${month}:count`);
  const count = r < 0.2 ? 0 : r < 0.5 ? 1 : r < 0.78 ? 2 : r < 0.93 ? 3 : 4;
  const taken = new Set<number>();
  const slots: { day: number; index: number }[] = [];
  for (let i = 0; i < count; i += 1) {
    let day = 1 + Math.floor(rand01(`${year}-${month}-${i}:day`) * 28);
    for (let attempt = 0; taken.has(day) && attempt < 28; attempt += 1) {
      day = (day % 28) + 1;
    }
    taken.add(day);
    slots.push({ day, index: monthIndex(year, month, i) });
  }
  return slots;
}

/** 轮换真实文档的序号：跨月递增，避免相邻卡片内容雷同。 */
function monthIndex(year: number, month: number, slot: number): number {
  return (year - RANGE.fromYear) * 12 + month + slot;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function rand01(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

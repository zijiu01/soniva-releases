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

/** 每月 0~6 条：确定性伪随机。忙碌月产 4~6 条且允许同日聚簇（35% 概率），
 *  从而出现 GitHub 梯度里的中蓝/深蓝档；清闲月 0~1 条。 */
function monthSlots(year: number, month: number): { day: number; index: number }[] {
  const r = rand01(`${year}-${month}:count`);
  const count = r < 0.08 ? 0 : r < 0.26 ? 1 : r < 0.46 ? 2 : r < 0.68 ? 3 : r < 0.84 ? 4 : r < 0.95 ? 5 : 6;
  const days: number[] = [];
  const slots: { day: number; index: number }[] = [];
  for (let i = 0; i < count; i += 1) {
    let day: number;
    if (count >= 5 && i >= 1 && i <= 2) {
      // 忙碌月强制一个「赶工日」：同一天压 3 条，出现最深蓝档
      day = days[0];
    } else if (i > 0 && rand01(`${year}-${month}-${i}:cluster`) < 0.35) {
      // 聚簇：贴着上一条的同一天或相邻天，形成「赶工」的深色块
      const prev = days[days.length - 1];
      day = rand01(`${year}-${month}-${i}:same`) < 0.5 ? prev : (prev % 28) + 1;
    } else {
      day = 1 + Math.floor(rand01(`${year}-${month}-${i}:day`) * 28);
      let guard = 0;
      while (days.includes(day) && guard++ < 28) {
        day = (day % 28) + 1;
      }
    }
    days.push(day);
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

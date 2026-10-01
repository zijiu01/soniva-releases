/**
 * 下载站的匿名统计出口（2026-10-02）：两个互不依赖的通道——
 * ① GA4：gtag.js 只在用户点了 Cookie 同意条「接受」之后才加载（components/legal/
 *    cookie-consent.tsx），没同意时 window.gtag 不存在，这里天然什么都不发；
 * ② 下载事件：点击下载按钮时向开发者 Supabase 的 site_download_events 表匿名
 *    INSERT（publishable key 只开 insert、RLS 保证公网读不到，与谷歌插件 Talkdown
 *    的 report.js 同一安全模型）。这条不写任何 Cookie / 本地存储、不带任何
 *    用户标识，属于运营计数，不需要等同意条。
 *
 * 建表 SQL：supabase/analytics-tables.sql（Supabase Dashboard 里跑一次）。
 * 表没建时插入静默失败，绝不影响下载本身。
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-MY14R4KCP5";

// 与 Talkdown 插件同一个生产 Supabase 项目；publishable key 本就是公开凭证
// （插件公开仓库里也带着），能做什么全由库内 RLS 决定。
const SUPABASE_URL = "https://lktsblmcvyddksrstkuu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_2hUnakuKbiSxNDvVn4XFzw_lzAVqHt4";
const DOWNLOAD_EVENTS_TABLE = "site_download_events";

type GtagFn = (...args: unknown[]) => void;

function getGtag(): GtagFn | null {
  if (typeof window === "undefined") return null;
  const gtag = (window as unknown as { gtag?: GtagFn }).gtag;
  return typeof gtag === "function" ? gtag : null;
}

/** GA4 事件（需同意条已接受，否则 gtag 未加载、这里什么都不发）。 */
export function trackGtagEvent(eventName: string, params: Record<string, string | number>) {
  const gtag = getGtag();
  if (!gtag) return;
  gtag("event", eventName, params);
}

export interface DownloadEventData {
  version: string;
  platform: string;
  arch: string;
  filename: string;
  locale: string;
}

/** 点击真实下载资产时的匿名写库 + GA4 双报。全站唯一调用点是 DownloadLink。 */
export function reportDownloadEvent(data: DownloadEventData): void {
  if (typeof window === "undefined") return;
  const row = {
    version: data.version.slice(0, 32),
    platform: data.platform.slice(0, 32),
    arch: data.arch.slice(0, 32),
    filename: data.filename.slice(0, 128),
    locale: data.locale.slice(0, 8),
    page_path: window.location.pathname.slice(0, 256),
    referrer: document.referrer ? document.referrer.slice(0, 256) : null,
  };
  trackGtagEvent("download_click", {
    version: row.version,
    platform: row.platform,
    arch: row.arch,
    file_name: row.filename,
    page_path: row.page_path,
  });
  // keepalive：点击后立刻跳 GitHub，请求也得活着发出去
  void fetch(`${SUPABASE_URL}/rest/v1/${DOWNLOAD_EVENTS_TABLE}`, {
    method: "POST",
    keepalive: true,
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify([row]),
  }).catch(() => {
    // 统计尽力而为，失败静默
  });
}

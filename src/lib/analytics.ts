/**
 * 下载站的匿名统计出口（2026-10-02）：两个互不依赖的通道——
 * ① GA4：gtag.js 只在用户点了 Cookie 同意条「接受」之后才加载（components/legal/
 *    cookie-consent.tsx），没同意时 window.gtag 不存在，这里天然什么都不发；
 * ② 下载事件：POST web 生产的 /api/downloads/track（对接契约见 web 仓库
 *    src/app/api/downloads/track/route.ts 顶部注释），由服务端写 download_events
 *    表——那张表刻意不给 anon 任何权限（只收服务端写入），所以站点必须走这条
 *    API 通道、不能直连 PostgREST。sendBeacon 发出去就忘（永远 204，IP 限流
 *    30/分），web 尚未部署该路由时静默丢失，不影响下载本身。
 * 建表与迁移一律走 web/supabase/migrations 迁移链，不在本仓库散装 SQL。
 */

import { site } from "@/lib/site";
import { trackWebsiteEvent, measurementId } from "@/lib/website-analytics";

export const GA_MEASUREMENT_ID = measurementId;

export interface DownloadEventData {
  version: string;
  platform: string;
  arch: string;
  filename: string;
  locale: string;
}

/** 契约枚举：macos=Intel、macos-arm=Apple Silicon。产物文件名里的 arm64 最稳。 */
function platformFor(filename: string): string {
  return /arm64/i.test(filename) ? "macos-arm" : "macos";
}

/** 点击真实下载资产时的双报：web API 计数 + GA4 事件。全站唯一调用点是 DownloadLink。 */
export function reportDownloadEvent(data: DownloadEventData): void {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify({
    platform: platformFor(data.filename),
    version: data.version.slice(0, 32),
    referrer: `${window.location.pathname} [${data.locale}]`.slice(0, 200),
  });
  const from = new URLSearchParams(window.location.search).get("from");
  trackWebsiteEvent("installer_download", {
    source: from && /^[a-z0-9-]{1,64}$/i.test(from) ? from : "direct",
    arch: /arm64/i.test(data.filename) ? "arm64" : "x64",
  });
  const url = `${site.appUrl}/api/downloads/track`;
  // sendBeacon：字符串 body 以 text/plain 发送（简单请求无预检），跳转不丢请求；
  // 服务端 req.json() 不挑 Content-Type。失败再退一格 keepalive fetch。
  if (navigator.sendBeacon(url, payload)) return;
  void fetch(url, {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "text/plain" },
    body: payload,
  }).catch(() => {
    // 统计尽力而为，失败静默
  });
}

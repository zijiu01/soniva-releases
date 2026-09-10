export type ReleaseChannel = "released" | "testing" | "upcoming";

export interface ReleaseDownload {
  id: string;
  platform: string;
  arch: string;
  filename: string;
  size?: string;
  /** 只有产物真正上传后才会有值；否则为 null，页面据此显示"未开放"。 */
  href: string | null;
}

export interface ReleaseEntry {
  version: string;
  tag: string;
  date: string | null;
  channel: ReleaseChannel;
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  summaryEn: string;
  downloads: ReleaseDownload[];
}

export interface DocEntry {
  slug: string;
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  summaryEn: string;
}

export interface DevLogEntry {
  slug: string;
  date: string | null;
  tagZh: string | null;
  tagEn: string | null;
  /** 文档在桌面端仓库中的原始路径，详情页展示「原文照录」出处。 */
  source: string | null;
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  summaryEn: string;
}

/** 首页时间线的统一条目：版本发布与开发文档混排在一条时间线里。 */
export type TimelineKind = "release" | "doc";

export interface TimelineEntry {
  /** 全局唯一选择键：真实条目与 href 相同，演示占位条目各有独立 id。 */
  id: string;
  kind: TimelineKind;
  /** 详情页路由（/releases/<version> 或 /devlog/<slug>），演示条目指向其复用的真实文档。 */
  href: string;
  date: string | null;
  version?: string;
  tagZh: string | null;
  tagEn: string | null;
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  summaryEn: string;
  /** 仅发布条目：首个下载资产的大小与可用状态。 */
  size?: string | null;
  downloadAvailable?: boolean;
  source?: string | null;
}

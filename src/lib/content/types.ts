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

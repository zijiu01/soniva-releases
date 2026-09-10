import { releaseAssetUrl, site } from "./site";

export type ReleaseChannel = "released" | "testing" | "upcoming";

export interface DownloadAsset {
  id: string;
  platform: string;
  arch: string;
  filename: string;
  size?: string;
  /** 只有已真正上传 Release 的产物才填 URL。 */
  url?: string;
}

export interface ReleaseNoteGroup {
  title: string;
  items: string[];
}

export interface ReleaseEntry {
  version: string;
  tag: string;
  date: string | null;
  channel: ReleaseChannel;
  headline: string;
  summary: string;
  notes: ReleaseNoteGroup[];
  downloads: DownloadAsset[];
}

export const channelLabel: Record<ReleaseChannel, string> = {
  released: "已发布",
  testing: "内测中",
  upcoming: "开发中",
};

export const releases: ReleaseEntry[] = [
  {
    version: "0.1.0",
    tag: "v0.1.0",
    date: null,
    channel: "testing",
    headline: "首个桌面内测版本",
    summary:
      "Soniva 桌面端第一次完整打包。当前正在做签名、公证与安装包验证，产物尚未上传到 Releases，下载通道暂未开放。",
    notes: [
      {
        title: "桌面客户端外壳",
        items: [
          "加载 Soniva 云端工作台，Google / Apple 账号直接登录",
          "单实例锁、外链交给系统浏览器打开、断网显示本地离线页",
          "窗口标题栏适配 macOS，支持拖拽与隐藏式标题栏",
        ],
      },
      {
        title: "本地资源库（.sonivalib）",
        items: [
          "独立资源库文件，基于 SQLite 与全文检索，随库携带、可迁移",
          "音频指纹去重，重复导入不产生副本",
          "回收站软删除、按侧车文件重建索引、多库注册与切换",
        ],
      },
      {
        title: "创作与预览",
        items: [
          "与网页版一致的工作室界面与长文本分段朗读",
          "图片、视频、PDF 缩略图与空格快速预览",
          "PDF 点选 / 框选标注并接入画板",
        ],
      },
      {
        title: "分享、分发与更新",
        items: [
          "支持 .sonivapack 素材分享包",
          "Developer ID 代码签名 + Apple 公证，DMG 双架构（Apple Silicon / Intel）",
          "内置 electron-updater，后续版本可在应用内自动更新",
        ],
      },
    ],
    downloads: [
      {
        id: "macos-arm64",
        platform: "macOS",
        arch: "Apple Silicon",
        filename: "Soniva-0.1.0-arm64.dmg",
        size: "约 151 MB",
      },
      {
        id: "macos-x64",
        platform: "macOS",
        arch: "Intel",
        filename: "Soniva-0.1.0-x64.dmg",
        size: "约 151 MB",
      },
    ],
  },
];

export const currentRelease = releases[0];

/**
 * 未上传产物前，下载入口一律返回 null，页面据此保持"即将发布"状态。
 * 只有 channel === "released" 的版本才会生成可点击链接。
 */
export function resolveDownloadUrl(
  release: ReleaseEntry,
  asset: DownloadAsset,
): string | null {
  if (release.channel !== "released") return null;
  if (asset.url) return asset.url;
  if (!site.githubRepo) return null;
  return releaseAssetUrl(release.tag, asset.filename);
}

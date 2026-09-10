export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export const features: Feature[] = [
  {
    id: "library",
    icon: "database",
    title: "本地音频资源库",
    description:
      "独立的 .sonivalib 资源库文件，随库携带、可迁移；音频指纹去重，重复导入不产生副本。",
  },
  {
    id: "studio",
    icon: "sparkling",
    title: "与网页版一致的工作室",
    description:
      "桌面端内置与 Soniva 网页版一致的创作工作台，支持 AI 会话与长文本分段朗读。",
  },
  {
    id: "preview",
    icon: "file",
    title: "素材预览与标注",
    description:
      "图片、视频、PDF 缩略图与空格快速预览，PDF 支持点选 / 框选标注并接入画板。",
  },
  {
    id: "share",
    icon: "share",
    title: "素材分享包",
    description:
      "通过 .sonivapack 分享包在设备之间传递素材，双击即可导入本地资源库。",
  },
  {
    id: "security",
    icon: "shield",
    title: "签名与公证",
    description:
      "Developer ID 代码签名并提交 Apple 公证，安装包通过 Gatekeeper 校验后才会开放下载。",
  },
  {
    id: "update",
    icon: "refresh",
    title: "应用内自动更新",
    description:
      "内置 electron-updater，正式发布后新版本可在应用内提示并一键重启更新。",
  },
];

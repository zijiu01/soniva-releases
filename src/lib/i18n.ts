import { useCallback } from "react";
import { useWebsiteLocale } from "@/hooks/use-website-locale";

export type Locale = "zh-CN" | "en-US";
export type Dictionary = Record<Locale, Record<string, string>>;

// 与 Web 营销站同一套思路：缺 key 时按 zh-CN 兜底，再没有就直接显示 key，
// 方便一眼看出漏翻的条目；t 用 useCallback 稳定引用，避免放进依赖数组时反复重建。
export function useT(dictionary: Dictionary) {
  const { locale } = useWebsiteLocale();
  return useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const table = dictionary[locale] || dictionary["zh-CN"];
      const fallback = dictionary["zh-CN"];
      let text = table[key] ?? fallback[key] ?? key;
      if (vars) {
        for (const [name, value] of Object.entries(vars)) {
          text = text.replaceAll(`{${name}}`, String(value));
        }
      }
      return text;
    },
    [locale, dictionary],
  );
}

export const siteCopy: Dictionary = {
  "zh-CN": {
    navHome: "首页",
    navReleases: "版本记录",
    navDocs: "文档",
    navDownload: "下载",
    navVisitApp: "进入应用",
    footerTagline: "Soniva 桌面端：把云端工作台、本地资源库与素材预览整合进一个原生应用。",
    footerProduct: "产品",
    footerPricing: "定价",
    footerHelp: "帮助中心",
    footerDocs: "安装与排障",
    footerLegal: "协议",
    footerTerms: "使用协议",
    footerPrivacy: "隐私政策",
    footerRefund: "退款政策",
    footerResourceTitle: "资源",
    footerResourceBilling: "账单与积分",
    footerLanguage: "语言",
    footerVisit: "进入应用",
    homeBadge: "桌面端 · 内测中",
    homeTitle: "下载 Soniva 桌面端",
    homeSubtitle: "选择你的 Mac 芯片架构下载安装包。当前为首次打包内测版本，产物上传后下载通道即开放。",
    homeDownload: "下载",
    homeComingSoon: "即将发布",
    homeViewReleases: "查看版本记录",
    homeTimelineTitle: "版本时间线",
    homeTimelineSubtitle: "按时间倒序排列的历史版本，点击卡片查看该版本的完整更新说明。",
    homeEmpty: "暂无发布记录。",
    releaseBack: "返回版本记录",
    releasePublishedOn: "发布于 {date}",
    releaseNotPublished: "尚未发布",
    channelReleased: "已发布",
    channelTesting: "内测中",
    channelUpcoming: "开发中",
    releaseDownloads: "下载",
    releaseNotes: "更新内容",
    releaseNoDownloads: "该版本暂无可下载的产物。",
    releaseDownloadUnavailable: "产物尚未上传，下载通道未开放。",
    releaseFileSize: "大小",
    releaseArch: "架构",
    releasePlatform: "平台",
    releaseViewOnGithub: "在 GitHub 查看",
    releaseLoading: "正在加载更新说明…",
    docsTitle: "安装与排障文档",
    docsSubtitle: "从下载安装到首次启动的常见问题与排查步骤。",
    docsEmpty: "暂无文档。",
    docsLoading: "正在加载…",
  },
  "en-US": {
    navHome: "Home",
    navReleases: "Releases",
    navDocs: "Docs",
    navDownload: "Download",
    navVisitApp: "Open app",
    footerTagline: "Soniva Desktop brings the cloud studio, a local asset library and previews into one native app.",
    footerProduct: "Product",
    footerPricing: "Pricing",
    footerHelp: "Help Center",
    footerDocs: "Install & Troubleshooting",
    footerLegal: "Policies",
    footerTerms: "Terms of Service",
    footerPrivacy: "Privacy Policy",
    footerRefund: "Refund Policy",
    footerResourceTitle: "Resources",
    footerResourceBilling: "Billing & Credits",
    footerLanguage: "Language",
    footerVisit: "Open app",
    homeBadge: "Desktop · Beta",
    homeTitle: "Download Soniva Desktop",
    homeSubtitle: "Pick the build for your Mac. This is the first beta package; the download channel opens once artifacts are uploaded.",
    homeDownload: "Download",
    homeComingSoon: "Coming soon",
    homeViewReleases: "View releases",
    homeTimelineTitle: "Release timeline",
    homeTimelineSubtitle: "Versions in reverse chronological order. Click a card to read the full release notes.",
    homeEmpty: "No releases yet.",
    releaseBack: "Back to releases",
    releasePublishedOn: "Published {date}",
    releaseNotPublished: "Not published yet",
    channelReleased: "Released",
    channelTesting: "Beta",
    channelUpcoming: "In development",
    releaseDownloads: "Downloads",
    releaseNotes: "What's new",
    releaseNoDownloads: "No downloadable artifacts for this version yet.",
    releaseDownloadUnavailable: "Artifacts are not uploaded yet; downloads are closed.",
    releaseFileSize: "Size",
    releaseArch: "Arch",
    releasePlatform: "Platform",
    releaseViewOnGithub: "View on GitHub",
    releaseLoading: "Loading release notes…",
    docsTitle: "Install & troubleshooting",
    docsSubtitle: "Common questions and steps from download to first launch.",
    docsEmpty: "No documents yet.",
    docsLoading: "Loading…",
  },
};

import { withWebsiteLanguage } from "@/lib/website-language";
import { marketingUrl, appUrl, downloadUrl, pluginUrl } from "@/lib/website-urls";
export type ShellLocale = "zh-CN" | "en-US";
export type ShellSite = "home" | "help" | "download" | "plugin";
export type ShellSection = "product" | "pricing" | "download" | "help" | "plugin";

export const shellCopy = {
  "zh-CN": {
    product: "产品", pricing: "价格", download: "下载", help: "帮助中心", plugin: "浏览器插件",
    desktop: "下载桌面端", mobileDownload: "下载桌面端", browser: "在浏览器打开",
    navigation: "主导航", menu: "打开导航", language: "切换至 English",
    theme: { light: "切换至浅色", dark: "切换至深色", system: "跟随系统" },
    helpColumn: "帮助", termsColumn: "条款", changelog: "开发日志", contact: "联系方式",
    terms: "使用协议", privacy: "隐私政策", refund: "退款政策", home: "Soniva 官网",
    copyright: "保留所有权利。",
  },
  "en-US": {
    product: "Product", pricing: "Pricing", download: "Download", help: "Help center", plugin: "Browser extension",
    desktop: "Download for desktop", mobileDownload: "Download", browser: "Open in browser",
    navigation: "Main navigation", menu: "Open navigation", language: "切换至中文",
    theme: { light: "Switch to light", dark: "Switch to dark", system: "Use system theme" },
    helpColumn: "Help", termsColumn: "Policies", changelog: "Changelog", contact: "Contact",
    terms: "Terms of service", privacy: "Privacy policy", refund: "Refund policy", home: "Soniva home",
    copyright: "All rights reserved.",
  },
};

const origins = {
  home: marketingUrl, help: marketingUrl,
  download: downloadUrl, plugin: pluginUrl,
  app: appUrl,
};

export function shellHref(site: ShellSite, target: keyof typeof origins, path: string, position: string, locale?: ShellLocale) {
  if (site === "download" && target === "download" && path === "/") return "/#download";
  if (origins[site] === origins[target]) return locale && (site === "home" || site === "help") ? withWebsiteLanguage(path, locale) : path;
  const url = new URL(path, origins[target]);
  url.searchParams.set("from", `${site}-${position}`);
  return url.toString();
}

export function shellNavigation(site: ShellSite, position: string, locale?: ShellLocale) {
  return [
    { id: "product", href: shellHref(site, "home", "/#product", position, locale) },
    { id: "pricing", href: shellHref(site, "home", "/pricing", position, locale) },
    { id: "download", href: shellHref(site, "download", "/", position, locale) },
    { id: "help", href: shellHref(site, "help", "/help", position, locale) },
    { id: "plugin", href: shellHref(site, "plugin", "/", position, locale) },
  ] satisfies { id: ShellSection; href: string }[];
}

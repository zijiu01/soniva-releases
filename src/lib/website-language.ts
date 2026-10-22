export type WebsiteLanguage = "zh-CN" | "en-US";

export function withWebsiteLanguage(href: string, locale: WebsiteLanguage) {
  const url = new URL(href, "https://www.soniva.uk");
  url.searchParams.set("lang", locale);
  return href.startsWith("/") ? `${url.pathname}${url.search}${url.hash}` : url.toString();
}

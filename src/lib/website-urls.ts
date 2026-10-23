// Local previews must not jump into the unchanged production sites.
const preview = process.env.NODE_ENV === "development";
export const marketingUrl = preview ? "http://localhost:3001" : "https://www.soniva.uk";
export const appUrl = preview ? "http://localhost:3000" : "https://app.soniva.uk";
export const downloadUrl = preview ? "http://localhost:3002" : "https://download.soniva.uk";
export const pluginUrl = preview ? "http://localhost:3003" : "https://plugin.soniva.uk";

export function previewWebsiteHref(href: string) {
  if (!preview) return href;
  for (const [origin, target] of [["https://www.soniva.uk", marketingUrl], ["https://app.soniva.uk", appUrl], ["https://download.soniva.uk", downloadUrl], ["https://plugin.soniva.uk", pluginUrl]]) {
    if (href === origin || href.startsWith(`${origin}/`)) return href.replace(origin, target);
  }
  return href;
}

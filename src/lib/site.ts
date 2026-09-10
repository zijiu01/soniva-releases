export const site = {
  name: "Soniva",
  product: "Soniva 桌面端",
  tagline: "让文字自然发声",
  description:
    "Soniva 桌面端把网页版工作室、本地音频资源库与素材预览整合进一个原生应用，支持离线资源管理、指纹去重与自动更新。",
  officialUrl: "https://soniva.uk",
  appUrl: "https://app.soniva.uk",
  /** GitHub 仓库 slug，形如 "owner/repo"。未配置时页面隐藏相关外链。 */
  githubRepo: process.env.NEXT_PUBLIC_GITHUB_REPO ?? "",
  /** 页面展示的当前版本，必须与源码仓库 desktop/package.json 一致。 */
  currentVersion: "0.1.0",
} as const;

export function githubUrl(path = ""): string | null {
  if (!site.githubRepo) return null;
  return `https://github.com/${site.githubRepo}${path}`;
}

export function releaseAssetUrl(tag: string, filename: string): string | null {
  if (!site.githubRepo) return null;
  return `https://github.com/${site.githubRepo}/releases/download/${tag}/${filename}`;
}

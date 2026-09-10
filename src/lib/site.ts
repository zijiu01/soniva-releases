export const site = {
  name: "Soniva",
  product: "Soniva 桌面端",
  description: "Soniva 桌面端的公开发布仓库：下载安装包、阅读开发日志、版本时间线与安装排障文档。",
  officialUrl: "https://www.soniva.uk",
  appUrl: "https://app.soniva.uk",
  /** GitHub 仓库 slug，形如 "owner/repo"。未配置时页面隐藏相关外链。 */
  githubRepo: process.env.NEXT_PUBLIC_GITHUB_REPO ?? "",
} as const;

export function githubUrl(path = ""): string | null {
  if (!site.githubRepo) return null;
  return `https://github.com/${site.githubRepo}${path}`;
}

export function releaseAssetUrl(tag: string, filename: string): string | null {
  if (!site.githubRepo) return null;
  return `https://github.com/${site.githubRepo}/releases/download/${tag}/${filename}`;
}

export function releasesPageUrl(): string | null {
  return githubUrl("/releases");
}

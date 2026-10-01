"use client";

import { buttonVariants } from "@/components/ui/button";
import { reportDownloadEvent } from "@/lib/analytics";
import { useWebsiteLocale } from "@/hooks/use-website-locale";

/** 带匿名下载计数的资产链接。目前全站唯一挂载点是 release-detail.tsx 的下载按钮；
 *  将来新增任何指向 GitHub Releases 资产的入口都必须走这里，裸 <a href> 会让
 *  site_download_events 静默漏数。 */
export function DownloadLink({
  href,
  version,
  platform,
  arch,
  filename,
  className,
  children,
}: {
  href: string;
  version: string;
  platform: string;
  arch: string;
  filename: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { locale } = useWebsiteLocale();
  return (
    <a
      href={href}
      className={className ?? buttonVariants({ size: "sm", variant: "default" })}
      onClick={() => reportDownloadEvent({ version, platform, arch, filename, locale })}
    >
      {children}
    </a>
  );
}

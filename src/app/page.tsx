import type { Metadata } from "next";
import { DownloadHero } from "@/components/download/download-hero";
import { InstallSteps } from "@/components/download/install-steps";
import { TimelineView } from "@/components/devlog/timeline-view";
import { getTimelineEntries } from "@/lib/content/timeline";
import { getReleases } from "@/lib/content/releases";

export const metadata: Metadata = {
  title: "下载 Soniva · macOS",
  description: "下载 Soniva Mac 桌面端，选择 Apple 芯片或 Intel 安装包。查看安装指引、版本更新和真实开发记录。",
  alternates: { canonical: "https://download.soniva.uk/" },
  openGraph: { title: "下载 Soniva · macOS", url: "https://download.soniva.uk/", description: "选择适合你的 Mac 安装包，三步开启本地素材库。" },
};

export default function HomePage() {
  const latest = getReleases().find((release) => release.channel === "released" && release.downloads.some((asset) => asset.href));
  return (
    <>
      <DownloadHero release={latest} />
      <InstallSteps />
      <TimelineView entries={getTimelineEntries()} />
    </>
  );
}

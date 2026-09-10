import { RiInformationLine, RiShieldCheckLine } from "@remixicon/react";
import { DownloadCard } from "./download-card";
import { SectionHeading } from "./section-heading";
import { Badge } from "@/components/ui/badge";
import { currentRelease, channelLabel } from "@/lib/releases";

const requirements = [
  "macOS 12 或更高版本",
  "Apple Silicon 或 Intel 处理器",
  "约 400 MB 可用磁盘空间",
];

export function DownloadPanel() {
  const released = currentRelease.channel === "released";

  return (
    <section id="download" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <SectionHeading
          eyebrow="下载"
          title="下载 Soniva 桌面端"
          description="安装包通过 Developer ID 签名与 Apple 公证后，才会在这里开放下载。"
        />

        {!released && (
          <div className="mt-8 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
            <RiInformationLine className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-muted-foreground">
              当前版本 <span className="font-medium text-foreground">{currentRelease.version}</span>{" "}
              正在打包验证，产物尚未上传，下载通道暂未开放（
              {channelLabel[currentRelease.channel]}）。
            </p>
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {currentRelease.downloads.map((asset) => (
            <DownloadCard
              key={asset.id}
              release={currentRelease}
              asset={asset}
            />
          ))}
        </div>

        <div className="mt-8 grid gap-6 rounded-xl border border-border bg-muted/30 p-6 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <RiShieldCheckLine className="h-4 w-4" />
              系统要求
            </div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {requirements.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <RiShieldCheckLine className="h-4 w-4" />
              安全说明
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              正式产物均经过 Developer ID 签名与 Apple 公证，安装时不会出现
              「来自身份不明的开发者」提示。在公证完成前，请勿从任何第三方渠道
              下载安装包。
            </p>
            <Badge variant="outline" className="mt-3">
              未公证的产物不具备可用性
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
}

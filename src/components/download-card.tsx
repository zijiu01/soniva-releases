import { RiAppleFill, RiDownloadLine } from "@remixicon/react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  resolveDownloadUrl,
  type DownloadAsset,
  type ReleaseEntry,
} from "@/lib/releases";
import { cn } from "@/lib/utils";

interface DownloadCardProps {
  release: ReleaseEntry;
  asset: DownloadAsset;
}

export function DownloadCard({ release, asset }: DownloadCardProps) {
  const url = resolveDownloadUrl(release, asset);
  const available = Boolean(url);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground">
            <RiAppleFill className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">{asset.platform}</p>
            <p className="text-xs text-muted-foreground">{asset.arch}</p>
          </div>
        </div>
        <Badge variant={available ? "success" : "outline"}>
          {available ? "可下载" : "即将发布"}
        </Badge>
      </div>

      <dl className="space-y-1.5 text-xs text-muted-foreground">
        <div className="flex justify-between gap-4">
          <dt>文件名</dt>
          <dd className="truncate font-mono text-foreground/80">
            {asset.filename}
          </dd>
        </div>
        {asset.size && (
          <div className="flex justify-between gap-4">
            <dt>大小</dt>
            <dd>{asset.size}</dd>
          </div>
        )}
      </dl>

      {available && url ? (
        <a
          href={url}
          className={cn(buttonVariants({ className: "w-full" }))}
        >
          <RiDownloadLine />
          下载 DMG
        </a>
      ) : (
        <Button className="w-full" disabled>
          <RiDownloadLine />
          即将发布
        </Button>
      )}
    </div>
  );
}

"use client";

import { useT, siteCopy } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { ReleaseChannel } from "@/lib/content/types";

const channelKey: Record<ReleaseChannel, string> = {
  released: "channelReleased",
  testing: "channelTesting",
  upcoming: "channelUpcoming",
};

const channelClass: Record<ReleaseChannel, string> = {
  released: "border-border bg-muted text-muted-foreground",
  testing: "border-border bg-muted text-muted-foreground",
  upcoming: "border-border bg-muted text-muted-foreground",
};

export function ChannelBadge({ channel, className }: { channel: ReleaseChannel; className?: string }) {
  const t = useT(siteCopy);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        channelClass[channel],
        className,
      )}
    >
      {t(channelKey[channel])}
    </span>
  );
}

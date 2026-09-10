import { RiCheckLine } from "@remixicon/react";
import { Badge } from "@/components/ui/badge";
import {
  channelLabel,
  type ReleaseChannel,
  type ReleaseEntry,
} from "@/lib/releases";

const channelVariant: Record<
  ReleaseChannel,
  "success" | "warning" | "outline"
> = {
  released: "success",
  testing: "warning",
  upcoming: "outline",
};

export function ReleaseEntryCard({ release }: { release: ReleaseEntry }) {
  return (
    <article className="relative border-l border-border pl-8">
      <span className="absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-primary" />

      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-lg font-semibold">v{release.version}</h3>
        <Badge variant={channelVariant[release.channel]}>
          {channelLabel[release.channel]}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {release.date ?? "发布日期待定"}
        </span>
      </div>

      <p className="mt-1.5 text-sm font-medium">{release.headline}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {release.summary}
      </p>

      <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {release.notes.map((group) => (
          <div key={group.title}>
            <h4 className="text-sm font-semibold">{group.title}</h4>
            <ul className="mt-2.5 space-y-1.5">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-sm text-muted-foreground"
                >
                  <RiCheckLine className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </article>
  );
}

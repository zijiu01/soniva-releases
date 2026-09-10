import { ReleaseEntryCard } from "./release-entry-card";
import { SectionHeading } from "./section-heading";
import { releases } from "@/lib/releases";

export function ReleaseTimeline() {
  return (
    <section id="releases" className="border-t border-border bg-muted/20">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <SectionHeading
          eyebrow="版本记录"
          title="发布版本记录"
          description="每个版本的更新内容与发布状态都在此登记。正式发版后，这里会同步开放对应版本的下载。"
        />

        <div className="mt-10 space-y-12">
          {releases.map((release) => (
            <ReleaseEntryCard key={release.tag} release={release} />
          ))}

          <div className="relative border-l border-dashed border-border pl-8">
            <span className="absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              更多版本
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              后续版本将在完成打包、签名与公证后陆续登记。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

import { RiCheckLine, RiCircleLine, RiLoader4Line } from "@remixicon/react";
import { SectionHeading } from "./section-heading";
import { pipeline, type PipelineState } from "@/lib/pipeline";
import { cn } from "@/lib/utils";

const stateStyle: Record<PipelineState, string> = {
  done: "text-emerald-600 dark:text-emerald-400",
  active: "text-amber-600 dark:text-amber-400",
  pending: "text-muted-foreground",
};

const stateLabel: Record<PipelineState, string> = {
  done: "已完成",
  active: "进行中",
  pending: "待处理",
};

function StateIcon({ state }: { state: PipelineState }) {
  if (state === "done") return <RiCheckLine className="h-4 w-4" />;
  if (state === "active")
    return <RiLoader4Line className="h-4 w-4 animate-spin" />;
  return <RiCircleLine className="h-4 w-4" />;
}

export function PipelineStatus() {
  const done = pipeline.filter((step) => step.state === "done").length;

  return (
    <section id="pipeline" className="border-t border-border bg-muted/20">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <SectionHeading
          eyebrow="发布进度"
          title="发布流水线状态"
          description="从编译到公开下载的每一步都如实展示。产物未真正上传前，上传环节保持待处理。"
        />

        <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <p className="text-sm font-medium">macOS 首发构建</p>
            <p className="text-xs text-muted-foreground">
              {done} / {pipeline.length} 步已完成
            </p>
          </div>
          <ol className="divide-y divide-border">
            {pipeline.map((step) => (
              <li
                key={step.id}
                className="flex items-center gap-4 px-6 py-4"
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted",
                    stateStyle[step.state],
                  )}
                >
                  <StateIcon state={step.state} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{step.label}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {step.detail}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 text-xs font-medium",
                    stateStyle[step.state],
                  )}
                >
                  {stateLabel[step.state]}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

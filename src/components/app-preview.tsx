import { cn } from "@/lib/utils";

const sidebarItems = ["全部素材", "收藏", "最近导入", "回收站"];

const tiles = [
  "h-28",
  "h-20",
  "h-24",
  "h-20",
  "h-28",
  "h-24",
];

export function AppPreview({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/5",
        className,
      )}
      aria-hidden
    >
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-muted-foreground/25" />
        <span className="h-3 w-3 rounded-full bg-muted-foreground/25" />
        <span className="h-3 w-3 rounded-full bg-muted-foreground/25" />
        <span className="mx-auto rounded-md bg-background/70 px-3 py-1 text-[11px] text-muted-foreground">
          Soniva · 本地资源库
        </span>
      </div>

      <div className="flex">
        <aside className="hidden w-44 shrink-0 flex-col gap-1 border-r border-border p-3 sm:flex">
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-accent px-2.5 py-2">
            <span className="h-5 w-5 rounded-md bg-foreground/80" />
            <span className="h-2 w-16 rounded-full bg-foreground/50" />
          </div>
          {sidebarItems.map((item, index) => (
            <div
              key={item}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2.5 py-2",
                index === 0 && "bg-muted",
              )}
            >
              <span className="h-4 w-4 rounded bg-muted-foreground/25" />
              <span className="h-2 w-14 rounded-full bg-muted-foreground/30" />
            </div>
          ))}
        </aside>

        <div className="flex-1 p-4">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-8 flex-1 rounded-lg border border-border bg-background/60" />
            <div className="h-8 w-20 rounded-lg bg-primary/90" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {tiles.map((height, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-lg border border-border/70",
                  height,
                  index % 2 === 0 ? "bg-muted" : "bg-secondary",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { RiDownloadLine, RiHistoryLine, RiTimeLine } from "@remixicon/react";
import { AppPreview } from "./app-preview";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { currentRelease } from "@/lib/releases";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const meta = [
  { icon: RiTimeLine, text: `版本 ${site.currentVersion} · 内测中` },
  { icon: RiDownloadLine, text: "macOS · Apple Silicon / Intel" },
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:py-24 lg:grid-cols-[1.05fr_1fr]">
        <div className="rise-in">
          <Badge variant="warning" className="mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            首个内测版本 · 打包验证中
          </Badge>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {site.product}
          </h1>
          <p className="mt-4 text-lg font-medium text-muted-foreground">
            {site.tagline}
          </p>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {site.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" disabled>
              <RiDownloadLine />
              即将发布
            </Button>
            <a
              href="#releases"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              <RiHistoryLine />
              查看版本记录
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            {meta.map((item) => (
              <span
                key={item.text}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.text}
              </span>
            ))}
          </div>
        </div>

        <div className="rise-in [animation-delay:120ms]">
          <AppPreview />
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {currentRelease.headline} · 界面以实际版本为准
          </p>
        </div>
      </div>
    </section>
  );
}

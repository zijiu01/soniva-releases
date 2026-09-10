"use client";

import { Code, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { siteCopy, useT } from "@/lib/i18n";

/** 首屏 Hero：高约 300px，左文右图；主按钮深色、次按钮描边，克制不抢视线。 */
export function DevlogHero() {
  const t = useT(siteCopy);
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-none px-5 sm:px-8">
        <div className="grid items-center gap-10 py-16 lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)]">
          <div>
            <span className="inline-flex items-center rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              {t("heroBadge")}
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-[44px] sm:leading-[1.15]">
              {t("heroTitle")}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">{t("heroSubtitle")}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#timeline"
                className={buttonVariants({ size: "lg" }) + " bg-foreground text-background hover:bg-foreground/90"}
              >
                {t("heroViewLatest")}
              </a>
              <a href="#download" className={buttonVariants({ size: "lg", variant: "outline" })}>
                {t("heroDownload")}
              </a>
            </div>
          </div>
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}

/** 抽象产品视觉：半透明层叠文档窗口 + 淡蓝光晕，纯 Token 配色，对读屏隐藏。 */
function HeroIllustration() {
  return (
    <div className="relative hidden h-56 select-none lg:block" aria-hidden="true">
      <div className="absolute right-6 top-2 size-40 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute right-0 top-8 h-40 w-64 rotate-6 rounded-xl border border-border bg-card/70 p-4">
        <SkeletonBars />
      </div>
      <div className="absolute right-14 top-0 h-44 w-64 -rotate-3 rounded-xl border border-border bg-card/90 p-4 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-muted-foreground/25" />
          <span className="size-2 rounded-full bg-muted-foreground/25" />
          <span className="ml-auto h-2 w-10 rounded-full bg-primary/25" />
        </div>
        <SkeletonBars className="mt-4" long />
      </div>
      <div className="absolute left-0 top-14 grid size-10 place-items-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm">
        <Code className="size-4" />
      </div>
      <div className="absolute bottom-1 left-20 grid size-8 place-items-center rounded-md border border-border bg-card text-muted-foreground shadow-sm">
        <Plus className="size-4" />
      </div>
      <div className="absolute bottom-2 right-8 flex gap-1.5">
        <span className="size-1.5 rounded-full bg-primary" />
        <span className="size-1.5 rounded-full bg-muted-foreground/25" />
        <span className="size-1.5 rounded-full bg-muted-foreground/25" />
      </div>
    </div>
  );
}

function SkeletonBars({ className = "", long = false }: { className?: string; long?: boolean }) {
  const widths = long ? ["w-full", "w-5/6", "w-full", "w-2/3", "w-4/5"] : ["w-5/6", "w-full", "w-3/5"];
  return (
    <div className={`space-y-2.5 ${className}`}>
      {widths.map((width) => (
        <div key={width} className={`h-2 ${width} rounded-full bg-muted`} />
      ))}
    </div>
  );
}

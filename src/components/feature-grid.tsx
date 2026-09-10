import type { ComponentType } from "react";
import {
  RiDatabase2Line,
  RiImageLine,
  RiRefreshLine,
  RiShareForwardLine,
  RiShieldCheckLine,
  RiSparkling2Line,
} from "@remixicon/react";
import { SectionHeading } from "./section-heading";
import { features } from "@/lib/features";

type IconType = ComponentType<{ className?: string }>;

const icons: Record<string, IconType> = {
  database: RiDatabase2Line,
  sparkling: RiSparkling2Line,
  file: RiImageLine,
  share: RiShareForwardLine,
  shield: RiShieldCheckLine,
  refresh: RiRefreshLine,
};

export function FeatureGrid() {
  return (
    <section id="features" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <SectionHeading
          eyebrow="功能"
          title="为桌面创作场景打造"
          description="在网页版能力之上，桌面端补齐本地资源管理与原生体验。以下能力随首个内测版本提供，实际以发布版本为准。"
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = icons[feature.icon] ?? RiSparkling2Line;
            return (
              <div
                key={feature.id}
                className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-foreground/20"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-sm font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

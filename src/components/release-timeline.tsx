"use client";

import { ReleaseCard } from "@/components/release-card";
import { siteCopy, useT } from "@/lib/i18n";
import type { ReleaseEntry } from "@/lib/content/types";

export function ReleaseTimeline({ releases }: { releases: ReleaseEntry[] }) {
  const t = useT(siteCopy);
  return (
    <section id="timeline" className="marketing-grid-frame mx-auto max-w-6xl px-5 sm:px-8">
      <div className="section-pad">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("homeTimelineTitle")}</h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">{t("homeTimelineSubtitle")}</p>
        </div>

        {releases.length === 0 ? (
          <p className="mt-12 text-center text-sm text-muted-foreground">{t("homeEmpty")}</p>
        ) : (
          <ol className="relative mx-auto mt-12 max-w-3xl border-l border-border pl-6 sm:pl-8">
            {releases.map((release) => (
              <li key={release.version} className="relative pb-8 last:pb-0">
                <span
                  aria-hidden="true"
                  className="absolute -left-[calc(1.5rem+5px)] top-1.5 size-2.5 rounded-full border-2 border-background bg-foreground sm:-left-[calc(2rem+5px)]"
                />
                <ReleaseCard release={release} />
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

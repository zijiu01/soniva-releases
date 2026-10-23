"use client";

import type { ReleaseEntry } from "@/lib/content/types";
import { useT } from "@/lib/i18n";
import { downloadCopy } from "./copy";
import { MacDownloadCard } from "./mac-download-card";

export function DownloadHero({ release }: { release?: ReleaseEntry }) {
  const t = useT(downloadCopy);
  return <section className="home-section" data-download-hero>
    <div className="site-rail marketing-grid-frame section-pad">
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="site-eyebrow mb-6 text-muted-foreground">{t("eyebrow")}</p>
          <h1 className="site-h1">{t("title")}</h1>
          <p className="site-lead mt-6 max-w-md text-muted-foreground">{t("lead")}</p>
          <div className="site-caption mt-10 flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
            {release && <><span>{t("version")} <span className="font-mono text-foreground">v{release.version}</span></span>
              {release.date && <time dateTime={release.date}>{release.date}</time>}</>}
            <span>{t("mac")}</span>
          </div>
        </div>
        <div className="lg:col-span-7"><MacDownloadCard release={release} /></div>
      </div>
    </div>
  </section>;
}

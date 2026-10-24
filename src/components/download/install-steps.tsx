"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useT } from "@/lib/i18n";
import { pluginUrl } from "@/lib/website-urls";
import { downloadCopy } from "./copy";

export function InstallSteps() {
  const t = useT(downloadCopy);
  return <section className="home-section" data-tone="canvas" data-install-steps>
    <div className="site-rail marketing-grid-frame section-pad">
      <h2 className="site-h2 home-section-heading">{t("installTitle")}</h2>
      <ol className="grid gap-8 md:grid-cols-3 md:gap-0 md:divide-x md:divide-border">
        {[1, 2, 3].map((step) => <li key={step} className="md:px-8 md:first:pl-0 md:last:pr-0">
          <p className="site-caption mb-5 font-mono text-muted-foreground">0{step}</p>
          <h3 className="site-h3">{t(`step${step}`)}</h3>
          <p className="site-body mt-3 text-muted-foreground">{t(`detail${step}`)}</p>
        </li>)}
      </ol>
      <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-sm">
        <Link className="inline-flex items-center gap-1 hover:text-muted-foreground" href="/docs/first-launch/">{t("nextHelp")}<ArrowUpRight className="size-4" /></Link>
        <Link target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-muted-foreground" href={`${pluginUrl}/?from=download-install`}>{t("extension")}<ArrowUpRight className="size-4" /></Link>
      </div>
    </div>
  </section>;
}

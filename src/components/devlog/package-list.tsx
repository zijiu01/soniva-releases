"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { buttonVariants, Button } from "@/components/ui/button";
import { siteCopy, useT } from "@/lib/i18n";
import type { TimelineEntry } from "@/lib/content/types";

/** 「最新发布包」：版本列表，产物未上传前下载图标置灰。 */
export function PackageList({ entries }: { entries: TimelineEntry[] }) {
  const t = useT(siteCopy);
  const releases = entries.filter((entry) => entry.kind === "release");

  return (
    <div id="download" className="scroll-mt-24 rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-medium">{t("latestPackages")}</p>
      {releases.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{t("homeEmpty")}</p>
      ) : (
        <ul className="mt-2 divide-y divide-border">
          {releases.map((release) => (
            <li key={release.id} className="flex items-center gap-2 py-2.5">
              <Link href={release.href} className="min-w-0 flex-1">
                <p className="font-mono text-sm font-medium">v{release.version}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {release.date ?? t("releaseNotPublished")}
                </p>
              </Link>
              {release.downloadAvailable ? (
                <Link
                  href={release.href}
                  aria-label={t("heroDownload")}
                  className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                >
                  <Download className="size-4" />
                </Link>
              ) : (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled
                  title={t("homeComingSoon")}
                  aria-label={t("homeComingSoon")}
                >
                  <Download className="size-4" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

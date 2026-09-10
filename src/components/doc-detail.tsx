"use client";

import Link from "next/link";
import { MarkdownContent } from "@/components/markdown/markdown-content";
import { useWebsiteLocale } from "@/hooks/use-website-locale";
import { siteCopy, useT } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import type { DocEntry } from "@/lib/content/types";

export function DocDetail({ doc, bodies }: { doc: DocEntry; bodies: Record<Locale, string> }) {
  const t = useT(siteCopy);
  const { locale } = useWebsiteLocale();
  const title = locale === "zh-CN" ? doc.titleZh : doc.titleEn;
  const summary = locale === "zh-CN" ? doc.summaryZh : doc.summaryEn;

  return (
    <article className="marketing-grid-frame mx-auto max-w-4xl px-5 sm:px-8">
      <div className="section-pad">
        <Link href="/docs" className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline">
          ← {t("docsTitle")}
        </Link>
        <h1 className="mt-8 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {summary && <p className="mt-5 text-base leading-8 text-muted-foreground">{summary}</p>}
        <div className="mt-6">
          <MarkdownContent markdown={bodies[locale]} />
        </div>
      </div>
    </article>
  );
}

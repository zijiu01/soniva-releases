"use client";

import { useWebsiteLocale } from "@/hooks/use-website-locale";
import { siteCopy, useT } from "@/lib/i18n";
import type { DocEntry } from "@/lib/content/types";

export function DocList({ docs }: { docs: DocEntry[] }) {
  const t = useT(siteCopy);
  const { locale } = useWebsiteLocale();

  return (
    <section className="marketing-grid-frame mx-auto max-w-4xl px-5 sm:px-8">
      <div className="section-pad">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("docsTitle")}</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">{t("docsSubtitle")}</p>

        {docs.length === 0 ? (
          <p className="mt-12 text-sm text-muted-foreground">{t("docsEmpty")}</p>
        ) : (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {docs.map((doc) => {
              const title = locale === "zh-CN" ? doc.titleZh : doc.titleEn;
              const summary = locale === "zh-CN" ? doc.summaryZh : doc.summaryEn;
              return (
                <li key={doc.slug}>
                  <a
                    href={`/docs/${doc.slug}`}
                    className="block h-full rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/20 hover:bg-accent/40"
                  >
                    <h2 className="text-base font-medium">{title}</h2>
                    {summary && <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">{summary}</p>}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

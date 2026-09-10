"use client";

import Link from "next/link";
import { MarkdownContent } from "@/components/markdown/markdown-content";
import { useWebsiteLocale } from "@/hooks/use-website-locale";
import { siteCopy, useT } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import type { DevLogEntry } from "@/lib/content/types";

export function DevlogDetail({ post, bodies }: { post: DevLogEntry; bodies: Record<Locale, string> }) {
  const t = useT(siteCopy);
  const { locale } = useWebsiteLocale();
  const title = locale === "zh-CN" ? post.titleZh : post.titleEn;
  const tag = locale === "zh-CN" ? post.tagZh : post.tagEn;

  return (
    <article className="marketing-grid-frame mx-auto max-w-4xl px-5 sm:px-8">
      <div className="section-pad">
        <Link
          href="/#devlog"
          className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          ← {t("devlogBack")}
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          {tag && (
            <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {tag}
            </span>
          )}
          {post.date && <span className="font-mono text-xs text-muted-foreground">{post.date}</span>}
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 font-mono text-xs text-muted-foreground">
          {post.source ? `${post.source} · ${t("devlogVerbatim")}` : t("devlogVerbatim")}
        </p>
        <div className="mt-6">
          <MarkdownContent markdown={bodies[locale]} />
        </div>
      </div>
    </article>
  );
}

"use client";

import { MarkdownContent } from "@/components/markdown/markdown-content";
import { useWebsiteLocale } from "@/hooks/use-website-locale";
import { siteCopy, useT } from "@/lib/i18n";
import type { LegalDocumentData } from "@/lib/content/legal";

type Props = { doc: Record<"zh-CN" | "en-US", LegalDocumentData> };

/** 使用条款：内容照录官网 legal markdown，构建期静态渲染，右侧锚点目录。 */
export function TermsDocument({ doc }: Props) {
  const t = useT(siteCopy);
  const { locale } = useWebsiteLocale();
  const data = doc[locale] ?? doc["zh-CN"];

  return (
    <article className="marketing-grid-frame mx-auto max-w-none px-5 sm:px-8">
      <div className="section-pad-sm grid gap-12 lg:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Soniva / {t("termsCategory")}</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{data.title}</h1>
          {data.effectiveDate && <p className="mt-4 text-sm text-muted-foreground">{data.effectiveDate}</p>}
          <div className="mt-10 max-w-3xl">
            {data.intro && <MarkdownContent markdown={data.intro} />}
            {data.sections.map((section, index) => (
              <section id={data.headings[index]?.id} key={section.title} className="scroll-mt-28 border-t border-border py-9 first:mt-12">
                <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">{section.title}</h2>
                <MarkdownContent markdown={section.body} />
              </section>
            ))}
          </div>
        </div>

        {data.headings.length > 0 && (
          <aside className="hidden lg:block">
            <nav className="sticky top-24 border-l border-border pl-4">
              {data.headings.map((heading) => (
                <a
                  key={heading.id}
                  href={`#${heading.id}`}
                  className="-ml-[17px] block border-l border-transparent py-1.5 pl-4 text-sm leading-5 text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                >
                  {heading.text}
                </a>
              ))}
            </nav>
          </aside>
        )}
      </div>
    </article>
  );
}

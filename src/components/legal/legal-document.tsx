"use client";

import { useEffect, useState } from "react";
import { MarkdownContent } from "@/components/markdown/markdown-content";
import { useWebsiteLocale } from "@/hooks/use-website-locale";
import { siteCopy, useT } from "@/lib/i18n";
import type { LegalDocumentData } from "@/lib/content/legal";

export type LegalSource = "terms" | "privacy" | "refund-policy";

type Props = {
  source: LegalSource;
  doc: Record<"zh-CN" | "en-US", LegalDocumentData>;
};

const categoryKey: Record<LegalSource, string> = {
  terms: "termsCategory",
  privacy: "privacyCategory",
  "refund-policy": "refundCategory",
};

/** 法务文档详情模块（照录官网 LegalDocument）：编号小节 + 滚动导航（TOC 随滚动高亮）。 */
export function LegalDocument({ source, doc }: Props) {
  const t = useT(siteCopy);
  const { locale } = useWebsiteLocale();
  const data = doc[locale] ?? doc["zh-CN"];
  const [active, setActive] = useState(0);

  // 滚动导航：IntersectionObserver 高亮当前小节；接近页底锁定最后一节。
  useEffect(() => {
    setActive(0);
    const nodes = data.headings
      .map((heading) => document.getElementById(heading.id))
      .filter((node): node is HTMLElement => Boolean(node));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(data.headings.findIndex((heading) => heading.id === visible.target.id));
      },
      { rootMargin: "-18% 0px -70% 0px", threshold: 0 },
    );
    nodes.forEach((node) => observer.observe(node));
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        setActive(data.headings.length - 1);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [data]);

  return (
    <article className="mx-auto max-w-none px-5 sm:px-8">
      <div className="section-pad-sm grid gap-12 lg:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Soniva / {t(categoryKey[source])}</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{data.title}</h1>
          {data.effectiveDate && <p className="mt-4 text-sm text-muted-foreground">{data.effectiveDate}</p>}
          <div className="mt-10 max-w-3xl">
            {data.intro && <MarkdownContent markdown={data.intro} />}
            {data.sections.map((section, index) => (
              <section
                id={data.headings[index]?.id}
                key={section.title}
                className="scroll-mt-28 border-t border-border py-9 first:mt-12"
              >
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
              {data.headings.map((heading, index) => (
                <a
                  key={heading.id}
                  href={`#${heading.id}`}
                  aria-current={active === index ? "location" : undefined}
                  className={`-ml-[17px] block border-l py-1.5 pl-4 text-sm leading-5 transition-colors ${
                    active === index
                      ? "border-foreground font-medium text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
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

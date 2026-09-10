"use client";

import type { ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { slugifyHeading } from "@/lib/slugify";

import { stripEmojiNoise } from "@/lib/markdown";

export function MarkdownContent({ markdown }: { markdown: string }) {
  const clean = stripEmojiNoise(markdown);
  const components: Components = {
    h2: ({ children }) => (
      <h2 id={slugifyHeading(flattenText(children))} className="mt-12 scroll-mt-28 text-2xl font-semibold tracking-tight first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 id={slugifyHeading(flattenText(children))} className="mt-8 scroll-mt-28 text-lg font-semibold tracking-tight">
        {children}
      </h3>
    ),
    p: ({ children }) => <p className="mt-4 leading-8 text-muted-foreground">{children}</p>,
    strong: ({ children }) => <strong className="font-medium text-foreground">{children}</strong>,
    ul: ({ children }) => (
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground marker:text-muted-foreground/60">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-muted-foreground marker:text-muted-foreground/60">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="[&>p]:mt-0">{children}</li>,
    a: ({ href, children }) => {
      const isExternal = href ? /^https?:\/\//i.test(href) : false;
      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer" : undefined}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {children}
        </a>
      );
    },
    blockquote: ({ children }) => (
      <blockquote className="mt-5 border-l-2 border-border pl-4 text-sm leading-7 text-muted-foreground">{children}</blockquote>
    ),
    hr: () => <hr className="my-9 border-border" />,
    code: ({ children }) => (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">{children}</code>
    ),
    pre: ({ children }) => (
      <pre className="mt-5 overflow-x-auto rounded-lg border border-border bg-muted p-4 font-mono text-sm leading-6 [&_code]:rounded-none [&_code]:bg-transparent [&_code]:p-0">
        {children}
      </pre>
    ),
    table: ({ children }) => (
      <div className="mt-5 overflow-x-auto">
        <table className="w-full border-collapse text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="border-b border-border text-left text-xs font-medium tracking-wide text-muted-foreground">{children}</thead>
    ),
    th: ({ children }) => <th className="py-2 pr-4 font-medium">{children}</th>,
    td: ({ children }) => <td className="border-t border-border py-2 pr-4 text-muted-foreground">{children}</td>,
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {clean}
    </ReactMarkdown>
  );
}

function flattenText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(flattenText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return flattenText((children as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

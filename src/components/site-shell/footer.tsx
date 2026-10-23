"use client";

import Link from "next/link";
import { SonivaLogo } from "../soniva-logo";
import { shellCopy, shellHref, type ShellSite } from "./copy";
import { ShellPreferences, type PreferenceProps } from "./preferences";

type Props = PreferenceProps & { site: ShellSite; onDownload: (position: string) => void };

export function SiteFooter(props: Props) {
  const { locale, site, onDownload } = props;
  const t = shellCopy[locale];
  const link = (target: "home" | "help" | "download" | "plugin" | "app", path: string) => shellHref(site, target, path, "footer", locale);
  const columns = [
    { title: t.product, links: [
      { label: t.desktop, href: link("download", "/"), download: true },
      { label: t.browser, href: link("app", "/") }, { label: t.plugin, href: link("plugin", "/") },
      { label: t.pricing, href: link("home", "/pricing") },
    ] },
    { title: t.helpColumn, links: [
      { label: t.help, href: link("help", "/help") },
      { label: t.changelog, href: link("download", "/#timeline") },
      { label: t.contact, href: "mailto:soniva.cde@gmail.com" },
    ] },
    { title: t.termsColumn, links: [
      { label: t.terms, href: link("home", "/terms") }, { label: t.privacy, href: link("home", "/privacy") },
      { label: t.refund, href: link("home", "/refund-policy") },
    ] },
  ];
  return <footer className="border-t border-border bg-background">
    <div className="site-rail py-12">
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
        {columns.map((column) => <div key={column.title}>
          <p className="text-sm font-medium">{column.title}</p>
          <ul className="mt-4 space-y-1">{column.links.map((item) => <li key={item.href}>
            <Link href={item.href} onClick={"download" in item && item.download ? () => onDownload("footer") : undefined}
              className="inline-flex min-h-11 items-center text-sm text-muted-foreground hover:text-foreground">{item.label}</Link>
          </li>)}</ul>
        </div>)}
      </div>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-5 border-t border-border pt-6">
        <Link href={link("home", "/")} className="flex items-center gap-1" aria-label={t.home}><SonivaLogo /><span>Soniva</span></Link>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Soniva. {t.copyright}</p>
        <ShellPreferences {...props} />
      </div>
    </div>
  </footer>;
}

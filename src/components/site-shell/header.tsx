"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { SonivaLogo } from "../soniva-logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { shellCopy, shellHref, shellNavigation, type ShellSection, type ShellSite } from "./copy";
import { ShellPreferences, type PreferenceProps } from "./preferences";

type Props = PreferenceProps & {
  site: ShellSite;
  active?: ShellSection;
  onProduct?: () => void;
  onDownload: (position: string) => void;
};

export function SiteHeader(props: Props) {
  const { locale, site, active, onProduct, onDownload } = props;
  const t = shellCopy[locale];
  const nav = shellNavigation(site, "header", locale);
  return <header className="sticky top-0 z-[300] shrink-0 border-b border-border bg-background">
    <div className="site-rail flex h-14 items-center gap-2 md:h-16">
      <Link href={shellHref(site, "home", "/", "logo", locale)} className="soniva-brand flex shrink-0 items-center gap-1" aria-label={t.home}>
        <SonivaLogo animated /><span className="text-lg font-medium">Soniva</span>
      </Link>
      <nav className="ml-auto hidden items-center xl:flex" aria-label={t.navigation}>
        {nav.map((item) => <Link key={item.id} href={item.href} aria-current={active === item.id ? "page" : undefined}
          onClick={(e) => {
            if (item.id === "product" && onProduct) { e.preventDefault(); onProduct(); }
            if (item.id === "download") onDownload("header-nav");
          }}
          className={buttonVariants({ variant: "ghost", className: active === item.id ? "text-foreground underline underline-offset-8" : "text-muted-foreground" })}>
          {t[item.id]}
        </Link>)}
      </nav>
      <div className="ml-auto hidden xl:block"><ShellPreferences {...props} /></div>
      <div className="ml-auto xl:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="size-11" aria-label={t.menu} />}><Menu className="size-4" /></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            {nav.map((item) => <DropdownMenuItem key={item.id}
              onClick={() => { if (item.id === "download") onDownload("header-mobile"); }}
              render={<Link href={item.href} aria-current={active === item.id ? "page" : undefined} />}>{t[item.id]}</DropdownMenuItem>)}
            <DropdownMenuItem render={<a href={shellHref(site, "app", "/", "header")} />}>{t.browser}</DropdownMenuItem>
            <ShellPreferences {...props} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <a href={shellHref(site, "app", "/", "header")} className={buttonVariants({ variant: "outline", className: "hidden h-9 sm:inline-flex" })}>{t.browser}</a>
      <a href={shellHref(site, "download", "/", "header")} onClick={() => onDownload("header")}
        className={buttonVariants({ className: "h-9" })}>
        <span className="sm:hidden">{t.mobileDownload}</span><span className="hidden sm:inline">{t.desktop}</span>
      </a>
    </div>
  </header>;
}

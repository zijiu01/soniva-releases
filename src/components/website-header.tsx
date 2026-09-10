"use client";

import Link from "next/link";
import { ArrowRight } from "@/components/animate-ui/icons/arrow-right";
import { AnimatedLucide } from "@/components/animate-ui/icons/animated-lucide";
import { SonivaLogo } from "@/components/soniva-logo";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useT, siteCopy } from "@/lib/i18n";
import { appUrl, marketingUrl } from "@/lib/website-urls";

export function WebsiteHeader() {
  const t = useT(siteCopy);
  const pricing = `${marketingUrl}/pricing`;
  return (
    <header className="sticky top-0 z-[300] bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center px-5 sm:px-8">
        <Link href="/" className="soniva-brand flex w-fit items-center gap-1 font-semibold tracking-tight" aria-label="Soniva home">
          <SonivaLogo animated />
          <span className="text-lg font-medium">Soniva</span>
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            <Link href="/#download" className={buttonVariants({ variant: "ghost", size: "default" })}>
              {t("navDownload")}
            </Link>
            <Link href="/#timeline" className={buttonVariants({ variant: "ghost", size: "default" })}>
              {t("navReleases")}
            </Link>
            <Link href="/docs" className={buttonVariants({ variant: "ghost", size: "default" })}>
              {t("navDocs")}
            </Link>
            <a href={pricing} className={buttonVariants({ variant: "ghost", size: "default" })}>
              {t("footerPricing")}
            </a>
            <LegalMenu
              label={t("footerLegal")}
              terms={t("footerTerms")}
              privacy={t("footerPrivacy")}
              refund={t("footerRefund")}
            />
          </nav>
          <MobileNav
            download={t("navDownload")}
            releases={t("navReleases")}
            docs={t("navDocs")}
            pricing={t("footerPricing")}
            terms={t("footerTerms")}
            privacy={t("footerPrivacy")}
            refund={t("footerRefund")}
            pricingHref={pricing}
          />
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={() => window.open(appUrl, "_blank", "noopener,noreferrer")}
            className="ml-2 inline-flex md:ml-3"
          >
            {t("navVisitApp")}
            <ArrowRight className="size-3.5" animateOnHover />
          </Button>
        </div>
      </div>
    </header>
  );
}

export function LegalMenu({ label, terms, privacy, refund }: { label: string; terms: string; privacy: string; refund: string }) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="h-8 px-2.5 text-sm font-medium">{label}</NavigationMenuTrigger>
          <NavigationMenuContent className="min-w-40">
            <NavigationMenuLink render={<a href={`${marketingUrl}/terms`} target="_blank" rel="noreferrer" />}>
              {terms}
            </NavigationMenuLink>
            <NavigationMenuLink render={<a href={`${marketingUrl}/privacy`} target="_blank" rel="noreferrer" />}>
              {privacy}
            </NavigationMenuLink>
            <NavigationMenuLink render={<a href={`${marketingUrl}/refund-policy`} target="_blank" rel="noreferrer" />}>
              {refund}
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function MobileNav({
  download,
  releases,
  docs,
  pricing,
  terms,
  privacy,
  refund,
  pricingHref,
}: {
  download: string;
  releases: string;
  docs: string;
  pricing: string;
  terms: string;
  privacy: string;
  refund: string;
  pricingHref: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button type="button" variant="ghost" size="icon-sm" className="md:hidden" aria-label="Open navigation" />}
      >
        <AnimatedLucide name="Menu" className="size-4" animateOnHover />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuItem render={<Link href="/#download" />}>{download}</DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/#timeline" />}>{releases}</DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/docs" />}>{docs}</DropdownMenuItem>
        <DropdownMenuItem render={<a href={pricingHref} />}>{pricing}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<a href={`${marketingUrl}/terms`} target="_blank" rel="noreferrer" />}>{terms}</DropdownMenuItem>
        <DropdownMenuItem render={<a href={`${marketingUrl}/privacy`} target="_blank" rel="noreferrer" />}>{privacy}</DropdownMenuItem>
        <DropdownMenuItem render={<a href={`${marketingUrl}/refund-policy`} target="_blank" rel="noreferrer" />}>{refund}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

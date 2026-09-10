import { RiGithubFill } from "@remixicon/react";
import { BrandMark } from "./brand-mark";
import { ThemeToggle } from "./theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { githubUrl, site } from "@/lib/site";

const nav = [
  { href: "#features", label: "功能" },
  { href: "#pipeline", label: "发布进度" },
  { href: "#download", label: "下载" },
  { href: "#releases", label: "版本记录" },
  { href: "#faq", label: "常见问题" },
];

export function SiteHeader() {
  const repo = githubUrl();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#top" className="flex items-center gap-2.5">
          <BrandMark className="h-8 w-8" />
          <span className="text-sm font-semibold tracking-tight">
            {site.name}
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            桌面端
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {repo && (
            <a
              href={repo}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub 仓库"
              className={buttonVariants({ variant: "ghost", size: "icon" })}
            >
              <RiGithubFill className="h-5 w-5" />
            </a>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

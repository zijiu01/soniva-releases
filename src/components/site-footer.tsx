import { BrandMark } from "./brand-mark";
import { githubUrl, site } from "@/lib/site";

const columns = [
  {
    title: "产品",
    links: [
      { label: "Soniva 官网", href: site.officialUrl, external: true },
      { label: "网页版工作台", href: site.appUrl, external: true },
      { label: "版本记录", href: "#releases", external: false },
    ],
  },
  {
    title: "资源",
    links: [
      { label: "GitHub 仓库", href: githubUrl() ?? site.officialUrl, external: true },
      { label: "下载", href: "#download", external: false },
      { label: "常见问题", href: "#faq", external: false },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <BrandMark className="h-8 w-8" />
            <span className="text-sm font-semibold">{site.product}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {site.description}
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-semibold">{column.title}</h3>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    {...(link.external
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Soniva. 保留所有权利。</p>
          <p>桌面端当前处于内测阶段，发布状态以本页面为准。</p>
        </div>
      </div>
    </footer>
  );
}

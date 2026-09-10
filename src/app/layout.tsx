import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site } from "@/lib/site";

const themeScript = `(function(){try{var t=localStorage.getItem('soniva-theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL(site.officialUrl),
  title: {
    default: `${site.product} · 发布版本记录`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: ["Soniva", "桌面端", "下载", "发布记录", "语音合成"],
  openGraph: {
    type: "website",
    title: `${site.product} · 发布版本记录`,
    description: site.description,
    siteName: site.name,
    locale: "zh_CN",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfdfd" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="page-glow min-h-screen antialiased">{children}</body>
    </html>
  );
}

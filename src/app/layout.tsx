import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WebsiteFooter } from "@/components/website-footer";
import { WebsiteHeader } from "@/components/website-header";
import { WebsiteLocaleProvider } from "@/hooks/use-website-locale";
import { site } from "@/lib/site";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// 首屏前同步主题，避免闪烁。本站按视觉规范默认浅色；只有用户显式选过深色/系统
// 才跟随。与 Web 营销站同一套 Cookie 键，跨子域保持一致。
const themeScript = `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)soniva_theme_mode=([^;]*)/);var t=m?decodeURIComponent(m[1]):localStorage.getItem('soniva-releases-theme');var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL(site.officialUrl),
  title: {
    default: `${site.product} · 发布版本记录`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: ["Soniva", "桌面端", "下载", "发布记录", "版本时间线"],
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
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <WebsiteLocaleProvider initialLocale="zh-CN">
          <WebsiteHeader />
          <main className="flex-1">{children}</main>
          <WebsiteFooter />
        </WebsiteLocaleProvider>
      </body>
    </html>
  );
}

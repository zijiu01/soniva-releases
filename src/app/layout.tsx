import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WebsiteFooter } from "@/components/website-footer";
import { WebsiteHeader } from "@/components/website-header";
import { CookieConsent } from "@/components/legal/cookie-consent";
import { WebsiteLocaleProvider } from "@/hooks/use-website-locale";
import { site } from "@/lib/site";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// 与官网同一共享偏好；无显式设置时跟随系统，首屏和水合后的默认一致。
const themeScript = `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)soniva_theme_mode=([^;]*)/);var t=m?decodeURIComponent(m[1]):localStorage.getItem('soniva-releases-theme');var d=t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL("https://download.soniva.uk"),
  title: {
    default: `下载中心 · ${site.name}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  keywords: ["Soniva", "桌面端", "下载", "发布记录", "版本时间线"],
  openGraph: {
    type: "website",
    title: `下载中心 · ${site.name}`,
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
          <CookieConsent />
        </WebsiteLocaleProvider>
      </body>
    </html>
  );
}

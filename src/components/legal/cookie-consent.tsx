"use client";

import { CookieConsent as SharedCookieConsent } from "../site-shell/cookie-consent";



// 与 web 主站同一个键名，但这里只能存 localStorage：本站部署在 vercel.app /
// github.io，写不进 .soniva.uk 的共享 Cookie（浏览器会拒绝第三方 Domain）。
// 将来若迁到 soniva.uk 子域，把 readConsent/writeConsent 换成主站的
// shared-domain-storage 即可，键名不用动。

// 同 web 主站的机制：GA 只在用户点「接受」之后才加载；客户端路由跳转不整页
// 加载，config 只记落地页一页，后续 page_view 在这里按 pathname 逐次补发
// （lastPath 逐次记录，保证每个路由恰好一条；刚点接受那一次 window.gtag 还
// 不存在，那次 page_view 由 config 负责，这里不发就是避免双份）。
export function CookieConsent() { return <SharedCookieConsent />; }

import { readSharedCookie, writeSharedCookie } from "./shared-domain-storage";

export const measurementId = "G-MY14R4KCP5";
export const consentKey = "soniva_cookie_consent";
export const consentEvent = "soniva-consent-change";
export type Consent = "accepted" | "rejected" | "unset";

type AnalyticsEvents = {
  desktop_download_click: { source: string; position: string };
  installer_download: { source: string; arch: "arm64" | "x64" };
  chrome_install_click: { source: string; position: string };
  showcase_view_change: { view: "rendered" | "clay" | "wire" | "clay-wire" };
  video_play: { video_id: string; position: string };
  help_feedback: { article: string; helpful: boolean };
  page_view: { page_path: string };
};

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  "ga-disable-G-MY14R4KCP5"?: boolean;
};
let initialized = false;

export function readConsent(): Consent {
  if (typeof document === "undefined") return "unset";
  const value = readSharedCookie(consentKey);
  return value === "accepted" || value === "rejected" ? value : "unset";
}

export function setConsent(value: Exclude<Consent, "unset">) {
  writeSharedCookie(consentKey, value);
  try { localStorage.removeItem("soniva_marketing_cookie_consent"); } catch { /* Storage may be blocked. */ }
  if (value === "rejected") disableAnalytics();
  window.dispatchEvent(new Event(consentEvent));
}

export function initializeAnalytics() {
  if (readConsent() !== "accepted") return false;
  const target = window as AnalyticsWindow;
  target[`ga-disable-${measurementId}`] = false;
  if (!initialized) {
    target.dataLayer ??= [];
    target.gtag = function () { target.dataLayer!.push(arguments); };
    target.gtag("js", new Date());
    target.gtag("config", measurementId, { send_page_view: false, cookie_domain: "auto" });
    initialized = true;
  }
  return true;
}

export function disableAnalytics() {
  const target = window as AnalyticsWindow;
  target[`ga-disable-${measurementId}`] = true;
  target.dataLayer = [];
  for (const part of document.cookie.split(";")) {
    const key = part.trim().split("=")[0];
    if (!/^_ga(?:_|$)/.test(key)) continue;
    for (const domain of ["", window.location.hostname, ".soniva.uk"]) {
      document.cookie = `${key}=; path=/; max-age=0${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

/** No buffering before consent/readiness; only named, non-content parameters. */
export function trackWebsiteEvent<K extends keyof AnalyticsEvents>(name: K, params: AnalyticsEvents[K]) {
  if (typeof window === "undefined" || !initialized || readConsent() !== "accepted") return;
  (window as AnalyticsWindow).gtag?.("event", name, params);
}

const rootDomain = "soniva.uk";

export function readSharedCookie(key: string) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${escapedKey}=([^;]*)`));
  try { return match ? decodeURIComponent(match[1]) : null; } catch { return null; }
}

export function writeSharedCookie(key: string, value: string) {
  const hostname = window.location.hostname;
  const shared = hostname === rootDomain || hostname.endsWith(`.${rootDomain}`);
  document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
  const domain = shared ? `; domain=.${rootDomain}` : "";
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000${domain}; SameSite=Lax${secure}`;
}

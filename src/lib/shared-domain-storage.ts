const rootDomain = "soniva.uk";

export function readSharedCookie(key: string) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${escapedKey}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function writeSharedCookie(key: string, value: string) {
  const domain = window.location.hostname.endsWith(rootDomain) ? `; domain=.${rootDomain}` : "";
  document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000${domain}; SameSite=Lax`;
}

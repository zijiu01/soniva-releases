export type MacArchitecture = "arm64" | "x64";
export type DeviceHint = { mac: boolean; architecture: MacArchitecture; detected: boolean };
type NavigatorHint = {
  userAgent: string; platform: string; maxTouchPoints?: number;
  userAgentData?: { platform?: string; getHighEntropyValues: (hints: string[]) => Promise<{ architecture?: string }> };
};

/** MacIntel is reported by Apple Silicon too. Never infer Intel from that string. */
export async function detectDevice(nav: NavigatorHint): Promise<DeviceHint> {
  const platform = nav.userAgentData?.platform || nav.platform;
  const mac = /mac/i.test(platform) && !/iphone|ipad|ipod/i.test(nav.userAgent) && (nav.maxTouchPoints ?? 0) < 2;
  const fallback: DeviceHint = { mac, architecture: "arm64", detected: false };
  if (!mac || !nav.userAgentData) return fallback;
  try {
    const { architecture } = await nav.userAgentData.getHighEntropyValues(["architecture"]);
    if (/^arm/i.test(architecture ?? "")) return { mac, architecture: "arm64", detected: true };
    if (/^(x86|x64|amd64)$/i.test(architecture ?? "")) return { mac, architecture: "x64", detected: true };
  } catch { /* Safari and privacy-restricted browsers retain the explicit fallback. */ }
  return fallback;
}

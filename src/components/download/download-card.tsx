"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowDownToLine, ArrowUpRight, Check } from "lucide-react";
import { RiAppleFill, RiWindowsFill } from "@remixicon/react";
import { DownloadLink } from "@/components/download-link";
import { Button, buttonVariants } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { appUrl } from "@/lib/website-urls";
import type { ReleaseEntry } from "@/lib/content/types";
import { useDeviceKind, type MacArchitecture } from "./architecture";
import { downloadCopy } from "./copy";

/** 下载卡片按访客系统分两态：Mac 出芯片选择 + .dmg；其他系统出 Windows 安装包 /
 *  便携版（无资产时退回"筹备中 + 浏览器入口"，措辞跟着事实走）。 */
export function DownloadCard({ release }: { release?: ReleaseEntry }) {
  const t = useT(downloadCopy);
  const [architecture, setArchitecture] = useState<MacArchitecture>("arm64");
  const device = useDeviceKind();
  const [hint, setHint] = useState("defaultChip");
  const [helpOpen, setHelpOpen] = useState(false);
  const manuallySelected = useRef(false);
  const showMac = device !== "other";
  const macAsset = release?.downloads.find((item) => /mac/i.test(item.platform) &&
    (architecture === "arm64" ? /arm64|apple|silicon/i : /x64|x86|intel/i).test(`${item.id} ${item.arch}`));
  const winAssets = release?.downloads.filter((item) => /windows/i.test(item.platform)) ?? [];
  const winSetup = winAssets.find((item) => /setup/i.test(item.filename)) ?? winAssets[0];
  const winPortable = winAssets.find((item) => /portable/i.test(item.filename));
  const hasWin = winAssets.length > 0;

  return <div id="download" data-download-card className="scroll-mt-24 rounded-xl border border-border bg-background p-6 md:p-10">
    <div className="flex items-center gap-3">
      {showMac ? <RiAppleFill className="size-7 shrink-0" aria-hidden /> : <RiWindowsFill className="size-7 shrink-0" aria-hidden />}
      <h2 className="site-h2">{showMac ? t("cardTitle") : t("cardTitleWin")}</h2>
    </div>
    {showMac && <>
      <div className="my-6 grid grid-cols-2 gap-2" role="group" aria-label={t("cardTitle")}>
        {(["arm64", "x64"] as const).map((arch) => <Button key={arch} variant={architecture === arch ? "default" : "outline"}
          className="h-12" aria-pressed={architecture === arch} onClick={() => {
            manuallySelected.current = true; setArchitecture(arch); setHint("manualChip");
          }}>
          {architecture === arch && <Check aria-hidden />}{t(arch === "arm64" ? "apple" : "intel")}
        </Button>)}
      </div>
      <p className="site-caption mb-4 min-h-6 text-muted-foreground" aria-live="polite">{t(hint)}</p>
      {macAsset?.href && release ? <DownloadLink href={macAsset.href} version={release.version} platform={macAsset.platform}
        arch={macAsset.arch} filename={macAsset.filename} className={buttonVariants({ size: "lg", className: "h-12 w-full" })}>
        <ArrowDownToLine aria-hidden />{t("download")}
      </DownloadLink> : <Button disabled className="h-12 w-full">{t("unavailable")}</Button>}
      <p className="site-caption mt-3 break-all text-muted-foreground">{macAsset?.filename}{macAsset?.size ? ` · ${macAsset.size}` : ""}</p>
    </>}
    {!showMac && (hasWin && winSetup?.href && release ? <div className="space-y-3">
      <DownloadLink href={winSetup.href} version={release.version} platform={winSetup.platform}
        arch={winSetup.arch ?? ""} filename={winSetup.filename} className={buttonVariants({ size: "lg", className: "h-12 w-full" })}>
        <ArrowDownToLine aria-hidden />{t("downloadWin")}
      </DownloadLink>
      {winPortable?.href && <DownloadLink href={winPortable.href} version={release.version} platform={winPortable.platform}
        arch={winPortable.arch ?? ""} filename={winPortable.filename} className={buttonVariants({ size: "lg", variant: "outline", className: "h-12 w-full" })}>
        <ArrowDownToLine aria-hidden />{t("portableWin")}
      </DownloadLink>}
      <p className="site-caption text-muted-foreground">{t("smartScreen")}</p>
    </div> : <div className="space-y-4">
      <p className="site-body text-muted-foreground">{t("otherDevices")}</p>
      <Link href={`${appUrl}/?from=download-card`} className={buttonVariants({ size: "lg", className: "h-12 w-full" })}>{t("browser")}<ArrowUpRight /></Link>
    </div>)}
    <div className="mt-6 border-t border-border pt-4">
      {showMac && <>
        <Button variant="link" className="h-auto whitespace-normal px-0 py-2 text-muted-foreground" aria-expanded={helpOpen}
          aria-controls="chip-help" onClick={() => setHelpOpen(!helpOpen)}>{t("chipHelp")}</Button>
        <p id="chip-help" hidden={!helpOpen} className="site-caption mt-1 text-muted-foreground">{t("chipTip")}</p>
      </>}
      <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
        {showMac && <Link className="underline underline-offset-4 hover:text-muted-foreground" href="/docs/install-macos/">{t("installHelp")}</Link>}
        {release && <Link className="text-muted-foreground hover:text-foreground" href={`/releases/${release.version}/`}>{t("releaseNotes")}</Link>}
      </div>
      <p className="site-caption mt-4 text-muted-foreground">{t("packageNote")}</p>
      {showMac && <div className="mt-5 flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-muted-foreground">
        <RiWindowsFill className="size-5 shrink-0" aria-hidden /><p className="site-caption">{hasWin ? t("windowsReady") : t("windows")}</p>
      </div>}
    </div>
  </div>;
}

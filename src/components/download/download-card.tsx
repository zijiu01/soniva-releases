"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowDownToLine, ArrowUpRight, Check, ChevronDown } from "lucide-react";
import { RiAppleFill, RiWindowsFill } from "@remixicon/react";
import { DownloadLink } from "@/components/download-link";
import { Button, buttonVariants } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useT } from "@/lib/i18n";
import { appUrl } from "@/lib/website-urls";
import type { ReleaseEntry } from "@/lib/content/types";
import { useDeviceKind, type MacArchitecture } from "./architecture";
import { downloadCopy } from "./copy";

/** 下载卡片：标题行就是平台选择器（系统图标 + 标题 + 下拉箭头，点整行弹出
 *  Mac / Windows 菜单，默认选中访客当前系统）——Mac 用户发 Windows 包给朋友
 *  从这里切。资产缺失的一侧显示"筹备中"措辞，绝不摆死按钮。 */
export function DownloadCard({ release }: { release?: ReleaseEntry }) {
  const t = useT(downloadCopy);
  const [architecture, setArchitecture] = useState<MacArchitecture>("arm64");
  const device = useDeviceKind();
  const [tabOverride, setTabOverride] = useState<null | "mac" | "windows">(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hint, setHint] = useState("defaultChip");
  const [helpOpen, setHelpOpen] = useState(false);
  const manuallySelected = useRef(false);
  const winAssets = release?.downloads.filter((item) => /windows/i.test(item.platform)) ?? [];
  const winSetup = winAssets.find((item) => /setup/i.test(item.filename)) ?? winAssets[0];
  const winPortable = winAssets.find((item) => /portable/i.test(item.filename));
  const hasWin = winAssets.length > 0;
  const tab: "mac" | "windows" = tabOverride ?? (device === "other" && hasWin ? "windows" : "mac");
  const macAsset = release?.downloads.find((item) => /mac/i.test(item.platform) &&
    (architecture === "arm64" ? /arm64|apple|silicon/i : /x64|x86|intel/i).test(`${item.id} ${item.arch}`));

  return <div id="download" data-download-card className="scroll-mt-24 rounded-xl border border-border bg-background p-6 md:p-10">
    <DropdownMenu onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger render={
        <button type="button" className="group -mx-1.5 flex items-center gap-3 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {tab === "mac" ? <RiAppleFill className="size-7 shrink-0" aria-hidden /> : <RiWindowsFill className="size-7 shrink-0" aria-hidden />}
          <span className="site-h2">{tab === "mac" ? t("cardTitle") : t("cardTitleWin")}</span>
          <ChevronDown aria-hidden className="size-5 shrink-0 text-muted-foreground transition-transform duration-100 data-[popup-open]:rotate-180 group-data-[popup-open]:rotate-180" />
        </button>
      } />
      <DropdownMenuContent align="start" className="w-auto min-w-44">
        <DropdownMenuItem onClick={() => setTabOverride("mac")}>
          <RiAppleFill aria-hidden />{t("tabMac")}{tab === "mac" && <Check aria-hidden className="ml-auto" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTabOverride("windows")}>
          <RiWindowsFill aria-hidden />{t("tabWindows")}{tab === "windows" && <Check aria-hidden className="ml-auto" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    {tab === "mac" && <>
      <div className="mt-6 grid grid-cols-2 gap-2" role="group" aria-label={t("apple")}>
        {(["arm64", "x64"] as const).map((arch) => <Button key={arch} variant={architecture === arch ? "default" : "outline"}
          className="h-12" aria-pressed={architecture === arch} onClick={() => {
            manuallySelected.current = true; setArchitecture(arch); setHint("manualChip");
          }}>
          {architecture === arch && <Check aria-hidden />}{t(arch === "arm64" ? "apple" : "intel")}
        </Button>)}
      </div>
      <p className="site-caption mb-4 mt-3 min-h-6 text-muted-foreground" aria-live="polite">{t(hint)}</p>
      {macAsset?.href && release ? <DownloadLink href={macAsset.href} version={release.version} platform={macAsset.platform}
        arch={macAsset.arch ?? ""} filename={macAsset.filename} className={buttonVariants({ size: "lg", className: "h-12 w-full" })}>
        <ArrowDownToLine aria-hidden />{t("download")}
      </DownloadLink> : <Button disabled className="h-12 w-full">{t("unavailable")}</Button>}
      <p className="site-caption mt-3 break-all text-muted-foreground">{macAsset?.filename}{macAsset?.size ? ` · ${macAsset.size}` : ""}</p>
    </>}
    {tab === "windows" && (hasWin && winSetup?.href && release ? <div className="mt-6 space-y-3">
      <DownloadLink href={winSetup.href} version={release.version} platform={winSetup.platform}
        arch={winSetup.arch ?? ""} filename={winSetup.filename} className={buttonVariants({ size: "lg", className: "h-12 w-full" })}>
        <ArrowDownToLine aria-hidden />{t("downloadWin")}
      </DownloadLink>
      {winPortable?.href && <DownloadLink href={winPortable.href} version={release.version} platform={winPortable.platform}
        arch={winPortable.arch ?? ""} filename={winPortable.filename} className={buttonVariants({ size: "lg", variant: "outline", className: "h-12 w-full" })}>
        <ArrowDownToLine aria-hidden />{t("portableWin")}
      </DownloadLink>}
      <p className="site-caption text-muted-foreground">{t("smartScreen")}</p>
    </div> : <div className="mt-6 space-y-4">
      <p className="site-body text-muted-foreground">{t("otherDevices")}</p>
      <Link href={`${appUrl}/?from=download-card`} className={buttonVariants({ size: "lg", className: "h-12 w-full" })}>{t("browser")}<ArrowUpRight /></Link>
    </div>)}
    <div className="mt-6 border-t border-border pt-4">
      {tab === "mac" && <>
        <Button variant="link" className="h-auto whitespace-normal px-0 py-2 text-muted-foreground" aria-expanded={helpOpen}
          aria-controls="chip-help" onClick={() => setHelpOpen(!helpOpen)}>{t("chipHelp")}</Button>
        <p id="chip-help" hidden={!helpOpen} className="site-caption mt-1 text-muted-foreground">{t("chipTip")}</p>
      </>}
      <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
        {tab === "mac" && <Link className="underline underline-offset-4 hover:text-muted-foreground" href="/docs/install-macos/">{t("installHelp")}</Link>}
        {release && <Link className="text-muted-foreground hover:text-foreground" href={`/releases/${release.version}/`}>{t("releaseNotes")}</Link>}
      </div>
      <p className="site-caption mt-4 text-muted-foreground">{t("packageNote")}</p>
    </div>
  </div>;
}

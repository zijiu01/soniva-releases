"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDownToLine, ArrowUpRight, Check } from "lucide-react";
import { RiAppleFill, RiWindowsFill } from "@remixicon/react";
import { DownloadLink } from "@/components/download-link";
import { Button, buttonVariants } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { appUrl } from "@/lib/website-urls";
import type { ReleaseEntry } from "@/lib/content/types";
import { detectDevice, type MacArchitecture } from "./architecture";
import { downloadCopy } from "./copy";

export function MacDownloadCard({ release }: { release?: ReleaseEntry }) {
  const t = useT(downloadCopy);
  const [architecture, setArchitecture] = useState<MacArchitecture>("arm64");
  const [device, setDevice] = useState<"unknown" | "mac" | "other">("unknown");
  const [hint, setHint] = useState("defaultChip");
  const [helpOpen, setHelpOpen] = useState(false);
  const manuallySelected = useRef(false);
  useEffect(() => {
    let active = true;
    void detectDevice(navigator).then((result) => {
      if (!active) return;
      setDevice(result.mac ? "mac" : "other");
      if (!manuallySelected.current && result.mac) {
        setArchitecture(result.architecture); setHint(result.detected ? "detectedChip" : "defaultChip");
      }
    });
    return () => { active = false; };
  }, []);
  const asset = release?.downloads.find((item) => /mac/i.test(item.platform) &&
    (architecture === "arm64" ? /arm64|apple|silicon/i : /x64|x86|intel/i).test(`${item.id} ${item.arch}`));

  return <div id="download" data-download-card className="scroll-mt-24 rounded-xl border border-border bg-background p-6 md:p-10">
    <div className="flex items-center gap-3"><RiAppleFill className="size-7 shrink-0" aria-hidden /><h2 className="site-h2">{t("cardTitle")}</h2></div>
    <div className="my-6 grid grid-cols-2 gap-2" role="group" aria-label={t("cardTitle")}>
      {(["arm64", "x64"] as const).map((arch) => <Button key={arch} variant={architecture === arch ? "default" : "outline"}
        className="h-12" aria-pressed={architecture === arch} onClick={() => {
          manuallySelected.current = true; setArchitecture(arch); setHint("manualChip");
        }}>
        {architecture === arch && <Check aria-hidden />}{t(arch === "arm64" ? "apple" : "intel")}
      </Button>)}
    </div>
    <p className="site-caption mb-4 min-h-6 text-muted-foreground" aria-live="polite">{t(hint)}</p>
    {device === "other" ? <div className="space-y-4">
      <p className="site-body text-muted-foreground">{t("otherDevices")}</p>
      <Link href={`${appUrl}/?from=download-card`} className={buttonVariants({ size: "lg", className: "h-12 w-full" })}>{t("browser")}<ArrowUpRight /></Link>
    </div> : asset?.href && release ? <DownloadLink href={asset.href} version={release.version} platform={asset.platform}
      arch={asset.arch} filename={asset.filename} className={buttonVariants({ size: "lg", className: "h-12 w-full" })}>
      <ArrowDownToLine aria-hidden />{t("download")}
    </DownloadLink> : <Button disabled className="h-12 w-full">{t("unavailable")}</Button>}
    <p className="site-caption mt-3 break-all text-muted-foreground">{asset?.filename}{asset?.size ? ` · ${asset.size}` : ""}</p>
    <div className="mt-6 border-t border-border pt-4">
      <Button variant="link" className="h-auto whitespace-normal px-0 py-2 text-muted-foreground" aria-expanded={helpOpen}
        aria-controls="chip-help" onClick={() => setHelpOpen(!helpOpen)}>{t("chipHelp")}</Button>
      <p id="chip-help" hidden={!helpOpen} className="site-caption mt-1 text-muted-foreground">{t("chipTip")}</p>
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-3 text-sm">
        <Link className="underline underline-offset-4 hover:text-muted-foreground" href="/docs/install-macos/">{t("installHelp")}</Link>
        {release && <Link className="text-muted-foreground hover:text-foreground" href={`/releases/${release.version}/`}>{t("releaseNotes")}</Link>}
      </div>
      <p className="site-caption mt-4 text-muted-foreground">{t("packageNote")}</p>
      <div className="mt-5 flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-muted-foreground">
        <RiWindowsFill className="size-5 shrink-0" aria-hidden /><p className="site-caption">{t("windows")}</p>
      </div>
    </div>
  </div>;
}

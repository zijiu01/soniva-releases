"use client";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ShellLocale } from "./copy";
export const cookieSettingsEvent = "soniva-cookie-settings-open";

export function CookieSettingsButton({ locale }: { locale: ShellLocale }) {
  return <Button variant="ghost" className="size-11" aria-label={locale === "zh-CN" ? "Cookie 设置" : "Cookie settings"}
    onClick={() => window.dispatchEvent(new Event(cookieSettingsEvent))}><Cookie className="size-4" /></Button>;
}

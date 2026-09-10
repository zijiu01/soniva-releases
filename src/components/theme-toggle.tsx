"use client";

import { useState } from "react";
import { AnimatedLucide } from "@/components/animate-ui/icons/animated-lucide";
import { Button } from "@/components/ui/button";
import { useWebsiteTheme } from "@/hooks/use-website-theme";

export function ThemeToggle({ size = "icon-lg" }: { size?: "icon-sm" | "icon-lg" } = {}) {
  const { mode, toggleTheme } = useWebsiteTheme();
  const [animationId, setAnimationId] = useState(0);
  const next = mode === "light" ? "dark" : mode === "dark" ? "system" : "light";
  const label = next === "light" ? "切换至浅色主题" : next === "dark" ? "切换至深色主题" : "切换至跟随系统主题";
  const icon = mode === "light" ? "Sun" : mode === "dark" ? "Moon" : "SunMoon";
  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      onClick={() => {
        setAnimationId((id) => id + 1);
        toggleTheme();
      }}
      aria-label={label}
      title={label}
      className="text-muted-foreground"
    >
      <AnimatedLucide key={animationId} name={icon} className="size-3.5" animate={animationId > 0} animateOnHover initialOnAnimateEnd />
    </Button>
  );
}

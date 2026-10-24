"use client";
import { Tooltip as Primitive } from "@base-ui/react/tooltip";
import type { ReactNode } from "react";

export const TooltipProvider = Primitive.Provider;
export const Tooltip = Primitive.Root;
export const TooltipTrigger = Primitive.Trigger;

export function TooltipContent({ children }: { children: ReactNode }) {
  return <Primitive.Portal><Primitive.Positioner side="top" sideOffset={7} className="z-[500]">
    <Primitive.Popup className="rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      {children}
    </Primitive.Popup>
  </Primitive.Positioner></Primitive.Portal>;
}

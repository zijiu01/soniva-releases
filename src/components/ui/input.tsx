import * as React from "react";
import { cn } from "@/lib/utils";

// shadcn 风格 Input：与 ui/button 同一套语义 Token。
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-1 text-sm",
        "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "transition-[color,box-shadow] outline-none",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

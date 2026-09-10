import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-3/5 w-3/5" fill="none">
        <rect x="3" y="9" width="2.6" height="6" rx="1.3" fill="currentColor" />
        <rect x="8" y="6" width="2.6" height="12" rx="1.3" fill="currentColor" />
        <rect x="13" y="4" width="2.6" height="16" rx="1.3" fill="currentColor" />
        <rect x="18" y="8" width="2.6" height="8" rx="1.3" fill="currentColor" />
      </svg>
    </span>
  );
}

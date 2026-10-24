"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

type Point = { x: number; y: number };
/** A plain surface-coloured eraser above the header, never an outlined ornament. */
export function GridJunctionOverlay() {
  const pathname = usePathname();
  const [points, setPoints] = useState<Point[]>([]);
  useEffect(() => {
    let frame = 0, signature = "\0";
    const seen = new WeakSet<Element>();
    const resize = new ResizeObserver(() => schedule());
    const update = () => {
      frame = 0;
      const next = new Map<string, Point>();
      if (innerWidth >= 640) for (const rail of document.querySelectorAll<HTMLElement>(".marketing-grid-frame")) {
        if (!seen.has(rail)) { seen.add(rail); resize.observe(rail); }
        const rect = rail.getBoundingClientRect();
        if (!rect.width || rect.bottom < 0 || rect.top > innerHeight) continue;
        for (const y of [rect.top - 0.5, rect.bottom + 0.5]) for (const x of [rect.left + 0.5, rect.right - 0.5]) {
          if (y < -4 || y > innerHeight + 4) continue;
          next.set(`${x.toFixed(2)}:${y.toFixed(2)}`, { x, y });
        }
      }
      const key = [...next.keys()].join("|");
      if (key !== signature) { signature = key; setPoints([...next.values()]); }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const mutation = new MutationObserver((records) => {
      if (records.some((record) => !(record.target as Element).closest?.("[data-grid-junction-layer]"))) schedule();
    });
    mutation.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", schedule, true); window.addEventListener("resize", schedule);
    schedule();
    return () => { cancelAnimationFrame(frame); resize.disconnect(); mutation.disconnect(); window.removeEventListener("scroll", schedule, true); window.removeEventListener("resize", schedule); };
  }, [pathname]);
  if (typeof document === "undefined") return null;
  return createPortal(<div data-grid-junction-layer aria-hidden="true" className="pointer-events-none fixed inset-0 z-[10000] overflow-hidden">
    {points.map(({ x, y }) => <span key={`${x}:${y}`} className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background" style={{ left: x, top: y }} />)}
  </div>, document.body);
}

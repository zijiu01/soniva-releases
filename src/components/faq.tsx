"use client";

import { useState } from "react";
import { RiAddLine } from "@remixicon/react";
import { SectionHeading } from "./section-heading";
import { Button } from "@/components/ui/button";
import { faqs } from "@/lib/faq";
import { cn } from "@/lib/utils";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="border-t border-border">
      <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
        <SectionHeading
          align="center"
          eyebrow="常见问题"
          title="关于下载与安装"
        />

        <div className="mt-10 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {faqs.map((item, index) => {
            const isOpen = open === index;
            return (
              <div key={item.question}>
                <Button
                  variant="ghost"
                  onClick={() => setOpen(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="h-auto w-full justify-between gap-4 rounded-none px-6 py-5 text-left text-sm font-medium hover:bg-transparent"
                >
                  {item.question}
                  <RiAddLine
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-45",
                    )}
                  />
                </Button>
                {isOpen && (
                  <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

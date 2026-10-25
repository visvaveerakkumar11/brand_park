"use client";

import { useRef } from "react";
import { ArrowLeftLongIcon, ArrowRightLongIcon } from "@/components/icons";
import { SectionHeader } from "@/components/section-header";

/** Horizontally scrollable row with previous/next controls. Children are server-rendered cards. */
export function ProductRail({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };
  const button = "flex size-10 items-center justify-center border border-line text-ink transition-colors hover:border-ink";
  return (
    <div>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        aside={
          <div className="flex gap-1">
            <button type="button" onClick={() => scroll(-1)} aria-label={`Scroll ${title} back`} className={button}>
              <ArrowLeftLongIcon />
            </button>
            <button type="button" onClick={() => scroll(1)} aria-label={`Scroll ${title} forward`} className={button}>
              <ArrowRightLongIcon />
            </button>
          </div>
        }
      />
      <div
        ref={track}
        role="region"
        aria-label={title}
        tabIndex={0}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:gap-6 sm:px-0 [&>*]:w-[calc(50%-8px)] [&>*]:shrink-0 [&>*]:snap-start md:[&>*]:w-[calc(33.333%-16px)] lg:[&>*]:w-[calc(25%-18px)]"
      >
        {children}
      </div>
    </div>
  );
}

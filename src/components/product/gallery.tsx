"use client";

import Image from "next/image";
import { useState } from "react";

export function Gallery({ images, name }: { images: { url: string; alt: string }[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];
  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {images.length > 1 && (
        <ul className="flex gap-2 md:flex-col" aria-label={`${name} images`}>
          {images.map((img, i) => (
            <li key={img.url}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-current={i === active || undefined}
                className={`relative block h-24 w-18 overflow-hidden border bg-stone ${i === active ? "border-ink" : "border-line"}`}
              >
                <Image src={img.url} alt="" fill sizes="72px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="relative aspect-[3/4] flex-1 overflow-hidden border border-line bg-stone">
        {current && (
          <Image src={current.url} alt={current.alt} fill priority sizes="(min-width: 1024px) 640px, 100vw" className="object-cover" />
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { ButtonLink, buttonClass } from "@/components/ui/button";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="heading-section mt-2">We couldn&apos;t load this page</h1>
      <p className="mt-3 max-w-md text-sm text-ink-muted">Please try again. If the problem continues, contact us and we&apos;ll help.</p>
      <div className="mt-8 flex gap-2">
        <button type="button" onClick={() => retry()} className={buttonClass("dark")}>Try again</button>
        <ButtonLink href="/" variant="outline">Go home</ButtonLink>
      </div>
    </div>
  );
}

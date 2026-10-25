import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";

export function SectionHeader({
  eyebrow,
  title,
  dot = false,
  aside,
}: {
  eyebrow: string;
  title: string;
  dot?: boolean;
  aside?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <p className="eyebrow flex items-center gap-2">
          {dot && <span className="size-2 rounded-full bg-forest" aria-hidden="true" />}
          {eyebrow}
        </p>
        <h2 className="heading-section text-[22px] leading-7 sm:text-[28px] sm:leading-9">{title}</h2>
      </div>
      {aside}
    </div>
  );
}

export function TextLink({ href, children, light = false }: { href: string; children: React.ReactNode; light?: boolean }) {
  return (
    <Link
      href={href}
      className={`label-caps inline-flex items-center gap-1 border-b pb-0.5 ${light ? "border-white text-white" : "border-ink text-ink"} hover:opacity-70`}
    >
      {children}
      <ArrowRightIcon />
    </Link>
  );
}

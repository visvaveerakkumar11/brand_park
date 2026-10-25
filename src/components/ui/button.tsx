import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "dark" | "outline" | "forest" | "light";

const base =
  "label-caps inline-flex items-center justify-center gap-2 rounded-[2px] px-10 h-12 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  dark: "bg-ink text-white hover:bg-black",
  outline: "border border-ink bg-white text-ink hover:bg-ink hover:text-white",
  forest: "bg-forest-600 text-white hover:bg-forest",
  light: "bg-white text-ink border border-ink hover:bg-surface",
};

export function buttonClass(variant: Variant = "dark", extra = "") {
  return `${base} ${variants[variant]} ${extra}`.trim();
}

export function ButtonLink({
  variant = "dark",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}

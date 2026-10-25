import Image from "next/image";
import Link from "next/link";
import { cacheLife } from "next/cache";
import { SITE } from "@/lib/config";
import { FOOTER_LINKS } from "@/lib/navigation";
import { NewsletterForm } from "@/components/newsletter-form";
import { isRazorpayConfigured } from "@/lib/razorpay";

const PAYMENT_METHODS = ["UPI", "RuPay", "Visa", "Mastercard", "Netbanking"];

async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-8">
        <div className="max-w-[310px]">
          <Link href="/" aria-label="Brand Park home">
            <Image src="/images/brand/logo.png" alt="Brand Park" width={160} height={32} unoptimized className="h-8 w-auto" />
          </Link>
          <p className="mt-5 text-sm leading-5 text-ink-muted">
            {SITE.tagline} Contemporary essentials crafted for modern everyday living.
          </p>
          <NewsletterForm className="mt-6" />
        </div>
        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
          <nav key={title} aria-label={title}>
            <h2 className="text-[11px] leading-[14px] font-semibold tracking-[0.1em] text-ink uppercase">{title}</h2>
            <ul className="mt-4 space-y-2">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={`text-sm leading-5 hover:text-ink ${l.label === "Sale" ? "text-sale" : "text-ink-muted"}`}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line bg-surface">
        <div className="container-page flex flex-col gap-3 py-5 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CopyrightYear /> Brand Park. All rights reserved.
          </p>
          {isRazorpayConfigured() && (
            <ul className="flex flex-wrap gap-1.5" aria-label="Accepted payment methods">
              {PAYMENT_METHODS.map((m) => (
                <li key={m} className="rounded-[2px] border border-line bg-white px-1.5 py-0.5 text-[10px] font-medium tracking-[0.08em] text-ink uppercase">
                  {m}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}

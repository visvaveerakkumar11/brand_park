import type { Metadata } from "next";
import Link from "next/link";
import { FREE_SHIPPING_THRESHOLD, RETURN_WINDOW_DAYS, STANDARD_SHIPPING_FEE } from "@/lib/config";
import { formatPrice } from "@/lib/money";
import { PAYMENT_HOLD_MINUTES } from "@/lib/orders";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "FAQs & Size Guide",
  description: "Answers about orders, delivery, returns and sizing at Brand Park.",
  alternates: { canonical: "/faq" },
};

const FAQS = [
  {
    q: "Do I need an account to order?",
    a: <>No. You can check out as a guest. An account lets you save addresses, keep your wishlist across devices and see all your orders in one place.</>,
  },
  {
    q: "How much does delivery cost?",
    a: (
      <>
        Delivery is free on orders of {formatPrice(FREE_SHIPPING_THRESHOLD)} or more after discounts. Smaller orders have a{" "}
        {formatPrice(STANDARD_SHIPPING_FEE)} delivery charge, shown before you pay. See our <Link href="/shipping-policy">shipping policy</Link>.
      </>
    ),
  },
  {
    q: "Can I return something?",
    a: <>Yes — returns are accepted within {RETURN_WINDOW_DAYS} days of delivery. See our <Link href="/return-policy">return policy</Link> for how to start one.</>,
  },
  {
    q: "How do I use a discount code?",
    a: <>Enter it in the discount code box at checkout. The discount is checked and applied when you place your order.</>,
  },
  {
    q: "What happens if I don't finish paying online?",
    a: (
      <>
        Items in an unpaid online order are held for {PAYMENT_HOLD_MINUTES} minutes. If payment isn&apos;t completed, the order is
        cancelled and the items are released. Your bag stays saved so you can try again.
      </>
    ),
  },
  {
    q: "Where can I see my order?",
    a: (
      <>
        After ordering you&apos;ll see a confirmation page — keep its link or your order number. Signed-in customers can also view
        orders under <Link href="/account/orders">My account → Orders</Link>.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <ContentPage eyebrow="Help centre" title="FAQs" intro="Quick answers about ordering, delivery, returns and fit.">
      {FAQS.map((f) => (
        <section key={f.q}>
          <h2>{f.q}</h2>
          <p>{f.a}</p>
        </section>
      ))}

      <section id="size-guide" className="scroll-mt-28">
        <h2>Size guide</h2>
        <p>Every product page lists the garment&apos;s fit (for example regular, relaxed or slim tapered). To choose a size:</p>
        <ul>
          <li>
            <strong>Tops (S–XXL):</strong> measure around the fullest part of your chest, under the arms, keeping the tape level.
          </li>
          <li>
            <strong>Jeans and trousers (30–38):</strong> sizes are waist measurements in inches. Measure around your natural waist,
            where you usually wear your trousers.
          </li>
          <li>
            <strong>Between sizes?</strong> Choose the larger size for relaxed and regular fits, or contact us for advice on a
            specific style.
          </li>
        </ul>
        <p>
          Need help with a particular piece? <Link href="/contact">Ask our team</Link>.
        </p>
      </section>
    </ContentPage>
  );
}

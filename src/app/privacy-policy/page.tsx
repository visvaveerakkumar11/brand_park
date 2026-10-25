import type { Metadata } from "next";
import Link from "next/link";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy-policy" } };

export default function PrivacyPolicyPage() {
  return (
    <ContentPage eyebrow="Brand & policies" title="Privacy policy" intro="What information Brand Park collects, why, and how it is used.">
      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account details</strong> — your name, email, optional mobile number and a securely hashed password (we never
          store your password itself).
        </li>
        <li>
          <strong>Order details</strong> — the items you buy, your delivery address, contact email and mobile number.
        </li>
        <li>
          <strong>Saved addresses, bag and wishlist</strong> — so they are there when you come back.
        </li>
        <li>
          <strong>Messages and subscriptions</strong> — what you send through our contact form, and your email if you subscribe to
          updates.
        </li>
      </ul>
      <h2>Payments</h2>
      <p>
        Online payments are processed by Razorpay. Your card, UPI or bank details are entered with Razorpay and are not stored by
        Brand Park; we keep only the payment reference and status for your order.
      </p>
      <h2>Cookies</h2>
      <p>We use a small number of essential cookies:</p>
      <ul>
        <li>
          <strong>bp_session</strong> — keeps you signed in.
        </li>
        <li>
          <strong>bp_cart</strong> and <strong>bp_wishlist</strong> — remember your bag and saved items when you shop as a guest.
        </li>
      </ul>
      <p>These cookies are required for the store to work and are not used for advertising.</p>
      <h2>How we use your information</h2>
      <p>
        To process and deliver your orders, provide your account, reply to your messages and, if you subscribe, send you updates
        from Brand Park.
      </p>
      <h2>Your choices</h2>
      <p>
        You can update your name and mobile number in <Link href="/account/profile">your profile</Link> and manage saved addresses
        in your account. To ask about your data, <Link href="/contact">contact us</Link>.
      </p>
    </ContentPage>
  );
}

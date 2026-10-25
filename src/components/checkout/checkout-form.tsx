"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { abandonPayment, confirmPayment, placeOrder, previewCoupon, type PlaceOrderResult } from "@/actions/checkout";
import { INDIAN_STATES } from "@/lib/validation";
import { formatPrice } from "@/lib/money";
import { Field, FormMessage, SelectField } from "@/components/ui/field";
import { buttonClass } from "@/components/ui/button";
import { SummaryRows } from "@/components/cart/order-summary";
import { useSessionState } from "@/components/session-state";

type Address = { id: string; fullName: string; phone: string; line1: string; line2: string | null; city: string; state: string; postalCode: string; isDefault: boolean };
type Totals = { subtotal: number; discount: number; shipping: number; total: number };

type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayInstance = { open: () => void; on: (event: string, cb: (r: { error?: { description?: string } }) => void) => void };
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

function loadRazorpay(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function CheckoutForm({
  email,
  addresses,
  totals: baseTotals,
  methods,
  signedIn,
}: {
  email: string;
  addresses: Address[];
  totals: Totals;
  methods: { razorpay: boolean; cod: boolean };
  signedIn: boolean;
}) {
  const router = useRouter();
  const { refreshState } = useSessionState();
  const form = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const initialAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const [address, setAddress] = useState<Partial<Address>>(initialAddress ?? {});

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; totals: Totals } | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const totals = coupon?.totals ?? baseTotals;

  const defaultMethod = methods.razorpay ? "RAZORPAY" : methods.cod ? "COD" : "";
  const noPayment = !methods.razorpay && !methods.cod;

  function applyCoupon() {
    startTransition(async () => {
      const result = await previewCoupon(couponInput);
      if (result.ok) {
        setCoupon({ code: result.code, totals: { subtotal: baseTotals.subtotal, discount: result.discount, shipping: result.shipping, total: result.total } });
        setCouponMessage(`Code ${result.code} applied.`);
      } else {
        setCoupon(null);
        setCouponMessage(result.error);
      }
    });
  }

  async function pay(result: Extract<PlaceOrderResult, { kind: "pay" }>) {
    if (!(await loadRazorpay()) || !window.Razorpay) {
      await abandonPayment({ orderId: result.orderId, token: result.token });
      setError("The payment window couldn't load. Check your connection and try again — you have not been charged.");
      return;
    }
    const rp = result.razorpay;
    const instance = new window.Razorpay({
      key: rp.keyId,
      order_id: rp.orderId,
      amount: rp.amount,
      currency: "INR",
      name: "Brand Park",
      description: `Order ${rp.orderNumber}`,
      prefill: { name: rp.name, email: rp.email, contact: rp.phone },
      theme: { color: "#0a3525" },
      handler: (response: RazorpayResponse) => {
        startTransition(async () => {
          const confirmed = await confirmPayment({ orderId: result.orderId, token: result.token, ...response });
          if (confirmed.ok) {
            await refreshState();
            router.push(confirmed.redirectTo);
          } else {
            setError(confirmed.error);
          }
        });
      },
      modal: {
        ondismiss: () => {
          startTransition(async () => {
            await abandonPayment({ orderId: result.orderId, token: result.token });
            setError("Payment was cancelled. Your bag is still saved — you can try again.");
          });
        },
      },
    });
    instance.on("payment.failed", (r) => setError(r.error?.description ?? "The payment failed. Please try again."));
    instance.open();
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    if (coupon) data.set("couponCode", coupon.code);
    startTransition(async () => {
      const result = await placeOrder(data);
      if (!result.ok) {
        setError(result.error);
        setFields(result.fields ?? {});
        if (result.fields) form.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
        return;
      }
      setFields({});
      if (result.kind === "confirmed") {
        await refreshState();
        router.push(result.redirectTo);
      } else {
        await pay(result);
      }
    });
  }

  return (
    <form ref={form} onSubmit={submit} noValidate className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="flex flex-col gap-10">
        <fieldset className="flex flex-col gap-5">
          <legend className="label-caps mb-5">1. Contact information</legend>
          <Field label="Email" name="email" type="email" autoComplete="email" required defaultValue={email} error={fields.email} />
        </fieldset>

        <fieldset className="flex flex-col gap-5">
          <legend className="label-caps mb-5">2. Shipping address</legend>
          {addresses.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="eyebrow">Saved addresses</p>
              <div className="flex flex-wrap gap-2">
                {addresses.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAddress(a)}
                    className={`rounded-[2px] border px-3 py-2 text-left text-xs ${address.id === a.id ? "border-ink" : "border-line hover:border-ink-subtle"}`}
                  >
                    <span className="block font-medium">{a.fullName}</span>
                    {a.line1}, {a.city} {a.postalCode}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Keyed so choosing a saved address refills the inputs. */}
          <div key={address.id ?? "new"} className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" name="fullName" autoComplete="name" required defaultValue={address.fullName} error={fields.fullName} />
            <Field label="Mobile number" name="phone" type="tel" inputMode="tel" autoComplete="tel" required defaultValue={address.phone} error={fields.phone} hint="For delivery updates." />
            <Field className="sm:col-span-2" label="Address" name="line1" autoComplete="address-line1" required defaultValue={address.line1} error={fields.line1} />
            <Field className="sm:col-span-2" label="Apartment, landmark (optional)" name="line2" autoComplete="address-line2" defaultValue={address.line2 ?? ""} error={fields.line2} />
            <Field label="City" name="city" autoComplete="address-level2" required defaultValue={address.city} error={fields.city} />
            <SelectField label="State" name="state" placeholder="Select state" options={INDIAN_STATES} required defaultValue={address.state ?? ""} error={fields.state} />
            <Field label="PIN code" name="postalCode" inputMode="numeric" autoComplete="postal-code" maxLength={6} required defaultValue={address.postalCode} error={fields.postalCode} />
          </div>
          {signedIn && !address.id && (
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" name="saveAddress" className="size-4 accent-forest" defaultChecked />
              Save this address to my account
            </label>
          )}
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="label-caps mb-5">3. Payment</legend>
          {noPayment && <FormMessage error="No payment method is available at the moment, so orders can't be placed. Please try again later." />}
          {methods.razorpay && (
            <label className="flex cursor-pointer items-start gap-3 border border-line p-4 has-[:checked]:border-ink">
              <input type="radio" name="paymentMethod" value="RAZORPAY" defaultChecked={defaultMethod === "RAZORPAY"} className="mt-0.5 size-4 accent-forest" />
              <span>
                <span className="block text-sm font-medium">Pay online</span>
                <span className="text-xs text-ink-muted">UPI, cards, netbanking and wallets via Razorpay secure checkout.</span>
              </span>
            </label>
          )}
          {methods.cod && (
            <label className="flex cursor-pointer items-start gap-3 border border-line p-4 has-[:checked]:border-ink">
              <input type="radio" name="paymentMethod" value="COD" defaultChecked={defaultMethod === "COD"} className="mt-0.5 size-4 accent-forest" />
              <span>
                <span className="block text-sm font-medium">Cash on delivery</span>
                <span className="text-xs text-ink-muted">Pay when your order arrives.</span>
              </span>
            </label>
          )}
          {fields.paymentMethod && <p className="text-xs text-sale">{fields.paymentMethod}</p>}
        </fieldset>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start" aria-label="Order total">
        <div className="border border-line p-6">
          <h2 className="label-caps mb-4">Discount code</h2>
          <div className="flex gap-2">
            <label htmlFor="coupon" className="sr-only">Discount code</label>
            <input
              id="coupon"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyCoupon();
                }
              }}
              className="h-10 min-w-0 flex-1 rounded-[2px] border border-line px-3 text-sm uppercase"
              placeholder="Enter code"
              autoComplete="off"
            />
            <button type="button" onClick={applyCoupon} disabled={pending || !couponInput.trim()} className={buttonClass("outline", "h-10 px-4")}>
              Apply
            </button>
          </div>
          {couponMessage && <p role="status" className={`mt-2 text-xs ${coupon ? "text-forest" : "text-sale"}`}>{couponMessage}</p>}
          {coupon && (
            <button type="button" className="mt-1 text-xs underline" onClick={() => { setCoupon(null); setCouponMessage(null); setCouponInput(""); }}>
              Remove code
            </button>
          )}
        </div>
        <div className="border border-line p-6">
          <h2 className="label-caps mb-4">Summary</h2>
          <SummaryRows {...totals} couponCode={coupon?.code} />
          {error && <div className="mt-4"><FormMessage error={error} /></div>}
          <button type="submit" disabled={pending || noPayment} className={buttonClass("forest", "mt-6 w-full")}>
            {pending ? "Processing…" : `Place order · ${formatPrice(totals.total)}`}
          </button>
          <p className="mt-3 text-xs text-ink-muted">Prices, stock and discounts are confirmed when you place your order.</p>
        </div>
      </aside>
    </form>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AddressActions, AddressForm } from "@/components/account/address-forms";

export const metadata: Metadata = { title: "My Addresses", robots: { index: false } };

export default function AddressesPage() {
  return (
    <>
      <h1 className="heading-section">Addresses</h1>
      <p className="mt-1 mb-6 text-sm text-ink-muted">Saved addresses appear at checkout.</p>
      <Suspense fallback={<div className="h-64 animate-pulse bg-surface" aria-busy="true" />}>
        <Addresses />
      </Suspense>
    </>
  );
}

async function Addresses() {
  const user = await requireUser("/account/addresses");
  const addresses = await db.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] });
  return (
    <div className="flex flex-col gap-10">
      {addresses.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <li key={a.id} className="flex flex-col justify-between gap-4 border border-line p-5">
              <address className="text-sm leading-6 text-ink-muted not-italic">
                <span className="flex items-center gap-2 text-ink">
                  {a.fullName}
                  {a.isDefault && <span className="bg-forest px-1.5 py-0.5 text-[10px] font-medium tracking-[0.05em] text-white uppercase">Default</span>}
                </span>
                {a.line1}
                {a.line2 && <>, {a.line2}</>}
                <br />
                {a.city}, {a.state} {a.postalCode}
                <br />
                {a.phone}
              </address>
              <AddressActions id={a.id} isDefault={a.isDefault} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="border border-line bg-canvas p-6 text-sm text-ink-muted">You have no saved addresses yet.</p>
      )}
      <section className="border border-line p-6">
        <h2 className="label-caps mb-6">Add a new address</h2>
        <AddressForm />
      </section>
    </div>
  );
}

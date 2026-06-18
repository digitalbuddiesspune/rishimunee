import { CompanyDetails } from "../../components/layout/CompanyDetails.jsx";

export const metadata = {
  title: "Refund Policy | RisheeMuni",
};

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <article className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-8">
        <h1 className="text-3xl font-semibold text-[color:var(--color-text)]">Refund Policy</h1>
        <p className="mt-2 text-sm text-[color:var(--color-text-soft)]">Last updated: February 17, 2026</p>

        <section className="mt-8 space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)]">1. General</h2>
          <p>This Refund Policy applies to services and purchases made through RisheeMuni.</p>
          <p>All refund decisions are subject to verification of transaction and service logs.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)]">2. Wallet Recharges</h2>
          <p>Wallet top-ups are generally non-refundable after successful credit to your account, except in case of duplicate or failed technical settlement.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)]">3. Digital Astrology Services</h2>
          <p>For completed digital services (including AI consultations, reports, and generated outputs), refunds are generally not available once delivery is successful.</p>
          <p>If a paid service fails due to a confirmed technical issue and no usable service is delivered, you may be eligible for a credit or refund.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)]">4. Duplicate Charges</h2>
          <p>Verified duplicate payments are eligible for full refund of the duplicate amount.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)]">5. Processing Timeline</h2>
          <p>Approved refunds are typically processed within 7-10 business days, subject to bank/payment partner timelines.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)]">6. Raise a Refund Request</h2>
          <p>To raise a refund request, contact support with your transaction ID, service details, and issue description.</p>
          <p>You may also send legal correspondence to:</p>
          <CompanyDetails />
        </section>
      </article>
    </div>
  );
}

import { company } from "../../lib/company.js";
import { CompanyDetails } from "../../components/layout/CompanyDetails.jsx";

export const metadata = {
  title: "Privacy Policy | RisheeMuni",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <article className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-8">
        <h1 className="text-3xl font-semibold text-[color:var(--color-text)]">Privacy Policy</h1>
        <p className="mt-2 text-sm text-[color:var(--color-text-soft)]">Last updated: February 17, 2026</p>

        <section className="mt-8 space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)]">1. Who We Are</h2>
          <p>{company.brandName} is operated by {company.legalName}.</p>
          <CompanyDetails />
        </section>

        <section className="mt-8 space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)]">2. Information We Collect</h2>
          <p>We may collect information you provide directly, including your name, email, phone number, birth details, and profile information.</p>
          <p>When you use paid services, payment processing is handled by payment partners. We may receive payment status, transaction references, and limited billing metadata.</p>
          <p>We also collect usage and technical information such as device type, log data, service interactions, and error diagnostics.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)]">3. How We Use Information</h2>
          <p>We use your information to provide astrology services, process bookings/orders, support wallet and payment flows, improve product quality, and keep the platform secure.</p>
          <p>We may use your contact details to send important account and transaction updates.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)]">4. Sharing and Disclosure</h2>
          <p>We do not sell your personal data. We may share information with service providers that support hosting, analytics, communication, and payments, subject to confidentiality and legal obligations.</p>
          <p>We may disclose information when required by law or lawful government request.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)]">5. Data Retention and Security</h2>
          <p>We retain data only as long as required for operational, legal, and accounting purposes. We use reasonable technical and organizational safeguards to protect your information.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)]">6. Your Rights</h2>
          <p>You may request access, correction, or deletion of your personal data, subject to applicable law and legitimate business requirements.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)]">7. Contact</h2>
          <p>For privacy-related requests, write to us at our registered office:</p>
          <CompanyDetails />
        </section>
      </article>
    </div>
  );
}

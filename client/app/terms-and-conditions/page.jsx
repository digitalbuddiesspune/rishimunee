import { company } from "../../lib/company.js";
import { CompanyDetails } from "../../components/layout/CompanyDetails.jsx";

export const metadata = {
  title: "Terms and Conditions | RisheeMuni",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12">
      <article className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-8">
        <h1 className="text-3xl font-semibold text-[color:var(--color-text)]">Terms and Conditions</h1>
        <p className="mt-2 text-sm text-[color:var(--color-text-soft)]">Last updated: February 17, 2026</p>

        <section className="mt-8 space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)]">1. Acceptance of Terms</h2>
          <p>By accessing or using RisheeMuni, you agree to these Terms and Conditions.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)]">2. Service Nature</h2>
          <p>RisheeMuni provides astrology-related digital services, AI-assisted guidance, consultations, reports, and related offerings.</p>
          <p>Content is for informational and spiritual guidance purposes and is not medical, legal, financial, or emergency advice.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)]">3. User Accounts</h2>
          <p>You are responsible for account credentials and activities under your account. You must provide accurate information while registering and using services.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)]">4. Payments and Wallet</h2>
          <p>Certain services are paid. Charges, wallet deductions, and payment gateway processing will be displayed before confirmation.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)]">5. Prohibited Use</h2>
          <p>You agree not to misuse the platform, attempt unauthorized access, infringe intellectual property, or use services for unlawful activities.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)]">6. Intellectual Property</h2>
          <p>Platform content, design, and software are owned by or licensed to the company and protected under applicable law.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)]">7. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, the company is not liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)]">8. Governing Law and Jurisdiction</h2>
          <p>These terms are governed by Indian law. Courts in {company.jurisdiction} shall have jurisdiction, subject to applicable law.</p>
        </section>

        <section className="mt-8 space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <h2 className="text-xl font-semibold text-[color:var(--color-text)]">9. Legal Entity Details</h2>
          <CompanyDetails />
        </section>
      </article>
    </div>
  );
}

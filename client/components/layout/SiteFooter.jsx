import Link from "next/link";
import { Logo } from "../ui/Logo.jsx";
import { company } from "../../lib/company.js";
import { CompanyDetails } from "./CompanyDetails.jsx";

const quickLinks = [
  { href: "/services/kundli", label: "Kundli" },
  { href: "/services/matching", label: "Kundli Matching" },
  { href: "/services/panchang", label: "Panchang" },
  { href: "/services/horoscope", label: "Daily Horoscope" },
];

export const SiteFooter = () => {
  return (
    <footer className="bg-[color:var(--color-surface)] border-t border-[color:var(--color-border)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-md space-y-3">
          <Logo size="xl" href="/" />
          <p className="text-sm text-[color:var(--color-text-soft)]">
            Guided by Vedic wisdom, powered by modern AI. Receive personalised
            astrology, gemstone recommendations, and life guidance curated for
            Indian audiences.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-[color:var(--color-text-soft)] sm:grid-cols-4">
          <div>
            <p className="mb-2 font-semibold text-[color:var(--color-text)]">
              Quick Links
            </p>
            <ul className="space-y-2">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    className="hover:text-[color:var(--color-primary)]"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 font-semibold text-[color:var(--color-text)]">
              Support
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/store">Shop</Link>
              </li>
              <li>
                <Link href="/bookings">Bookings</Link>
              </li>
              <li>
                <Link href="/payments/status">Payments</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-2 font-semibold text-[color:var(--color-text)]">
              Legal
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy-policy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms-and-conditions">Terms and Conditions</Link>
              </li>
              <li>
                <Link href="/refund-policy">Refund Policy</Link>
              </li>
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="mb-2 font-semibold text-[color:var(--color-text)]">Company</p>
            <CompanyDetails />
          </div>
        </div>
      </div>
      <div className="border-t border-[color:var(--color-border)] py-4 text-center text-xs text-[color:var(--color-muted-foreground)]">
        © {new Date().getFullYear()} {company.legalName}. All rights reserved.
      </div>
    </footer>
  );
};

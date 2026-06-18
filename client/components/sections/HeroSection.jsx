import Link from "next/link";
import { Button } from "../ui/Button.jsx";
import { Badge } from "../ui/Badge.jsx";
import AuthenticatedOnly from "../auth/AuthenticatedOnly.jsx";

export const HeroSection = () => (
  <section
    className="relative overflow-hidden rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] px-6 py-16 sm:px-12"
    style={{
      backgroundImage: 'url("/assets/bgAstro2.png")',
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}
  >
    <div className="absolute top-0 left-0 w-full h-full bg-black/30 z-10"></div>
    <div className="max-w-4xl space-y-6 relative z-15">
      <Badge>Powered by Vedic Expertise + OpenAI</Badge>
      <p className="text-sm uppercase tracking-wide text-[color:var(--color-card)]">
        भारत की पहली समग्र AI ज्योतिष सेवा
      </p>
      <h1 className="text-3xl font-semibold leading-[1.4] text-white sm:text-5xl">
        Personalised astrology for modern Bharat. Recharge your ज्योतिष wallet,
        unlock दशक भर की राहनुमाई.
      </h1>
      <p className="text-base text-[color:var(--color-card)] sm:text-lg">
        Chat with curated AI astrologers, generate instant Kundli, book real
        consultations, explore gemstone remedies, and manage every premium सेवा
        through your secure RisheeMuni Wallet.
      </p>
      <div className="flex flex-wrap gap-3 text-[color:var(--color-card)]">
        <AuthenticatedOnly>
          <Button as={Link} href="/wallet" size="lg">
            Recharge Wallet
          </Button>
        </AuthenticatedOnly>
        <Button as={Link} href="/services" variant="outline" size="lg">
          Browse All सेवाएँ
        </Button>
      </div>
    </div>
    <div className="pointer-events-none absolute z-12 -right-24 bottom-0 hidden h-64 w-64 rounded-full bg-[color:var(--color-secondary)]/30 blur-3xl sm:block" />
  </section>
);

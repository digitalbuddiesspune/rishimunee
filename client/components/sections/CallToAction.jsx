import Link from "next/link";
import { Button } from "../ui/Button.jsx";
import AuthenticatedOnly from "../auth/AuthenticatedOnly.jsx";

export const CallToAction = () => (
  <section className="rounded-3xl border border-[color:var(--color-border)] bg-gradient-to-r from-[color:var(--color-secondary)]/20 to-[color:var(--color-primary)]/20 px-6 py-12 text-center">
    <h2 className="text-2xl font-semibold text-[color:var(--color-text)]">
      Ready for cosmic clarity?
    </h2>
    <p className="text-lg font-semibold text-[color:var(--color-secondary)]">
      अब भविष्य की तैयारी हिंदी में
    </p>
    <p className="mx-auto mt-3 max-w-3xl text-sm text-[color:var(--color-text-soft)]">
      चाहे आप कुंडली बनवाना चाहें, गोचर फल जानना हो या रत्न खरीदना हो — पहले
      RisheeMuni Wallet रिचार्ज करें और फिर हर सेवा को एक क्लिक में सक्रिय करें।
      Secure Stripe, Razorpay और UPI सपोर्ट के साथ हर भुगतान आसान।
    </p>
    <div className="mt-6 flex flex-wrap justify-center gap-3">
      <AuthenticatedOnly>
        <Button as={Link} href="/wallet" size="lg">
          Recharge Wallet
        </Button>
      </AuthenticatedOnly>
      <Button as={Link} href="/services" variant="outline" size="lg">
        Browse Services
      </Button>
    </div>
  </section>
);

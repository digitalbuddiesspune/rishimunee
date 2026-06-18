import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card.jsx";
import { Button } from "../ui/Button.jsx";
import AuthenticatedOnly from "../auth/AuthenticatedOnly.jsx";

const benefits = [
  {
    title: "One wallet for हर सेवा",
    description:
      "Recharge once, pay for AI chats, gemstone orders, and personalised reports instantly.",
  },
  {
    title: "Instant cashback rewards",
    description:
      "Earn cosmic coins on every recharge and redeem against premium दोष निवारण services.",
  },
  {
    title: "UPI • Cards • Netbanking",
    description:
      "Supports Razorpay and Stripe for global as well as भारत आधारित भुगतान.",
  },
];

export const WalletSection = () => (
  <section className="space-y-6 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-8">
    <div className="space-y-2">
      <p className="text-sm uppercase tracking-wide text-[color:var(--color-secondary)]">
        RisheeMuni Wallet
      </p>
      <h2 className="text-2xl font-semibold text-[color:var(--color-text)]">
        Recharge • Manage • Redeem
      </h2>
      <p className="text-sm text-[color:var(--color-text-soft)]">
        अपना बैलेंस जोड़ें और बिना हर बार भुगतान की चिंता किए किसी भी सेवा का
        आनंद लें। Wallet balance automatically deducts when you book reports,
        gemstones, or AI consultations.
      </p>
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      {benefits.map((item) => (
        <Card key={item.title}>
          <CardHeader>
            <CardTitle>{item.title}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[color:var(--color-text-soft)]">
            {item.description}
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="flex flex-wrap items-center gap-3">
      <AuthenticatedOnly>
        <Button as={Link} href="/wallet" size="lg">
          Recharge अब
        </Button>
        <Button as={Link} href="/dashboard" variant="outline" size="lg">
          Track Wallet History
        </Button>
      </AuthenticatedOnly>
    </div>
  </section>
);

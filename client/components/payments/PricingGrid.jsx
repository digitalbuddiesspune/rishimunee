import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/Card.jsx";
import { Button } from "../ui/Button.jsx";

const plans = [
  {
    name: "Starter",
    price: "₹499",
    description: "Perfect for monthly horoscope and one AI chat session",
    features: ["Daily horoscope", "One AI chat session", "Panchang insights"],
    recommended: false
  },
  {
    name: "Premium",
    price: "₹1999",
    description: "Full Kundli, gemstone suggestions, and unlimited AI chat",
    features: ["Unlimited AI chat", "Detailed Kundli", "Gemstone consultation", "Priority support"],
    recommended: true
  },
  {
    name: "Elite",
    price: "₹4999",
    description: "Everything in Premium plus dedicated astrologer sessions",
    features: ["Dedicated astrologer", "Quarterly life report", "Personalised rituals"],
    recommended: false
  }
];

export const PricingGrid = () => (
  <div className="grid gap-6 md:grid-cols-3">
    {plans.map((plan) => (
      <Card key={plan.name} className={plan.recommended ? "border-[color:var(--color-primary)]" : undefined}>
        <CardHeader>
          <CardTitle>{plan.name}</CardTitle>
          <CardDescription>{plan.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-3xl font-semibold text-[color:var(--color-text)]">{plan.price}</p>
          <ul className="space-y-2 text-sm text-[color:var(--color-text-soft)]">
            {plan.features.map((feature) => (
              <li key={feature}>• {feature}</li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Choose plan</Button>
        </CardFooter>
      </Card>
    ))}
  </div>
);

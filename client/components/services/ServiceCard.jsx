"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card.jsx";
import { Button } from "../ui/Button.jsx";
import { Badge } from "../ui/Badge.jsx";
import { useRouter } from "next/navigation";
import { useAppSelector } from "../../lib/store/hooks.js";
import { selectAuthToken } from "../../lib/store/slices/authSlice.js";

const routeForService = (service) => {
  const slug = service.slug || service.serviceType;
  switch (service.serviceType || slug) {
    case "kundli":
      return "/services/kundli";
    case "kundli_matching":
    case "matching":
      return "/services/matching";
    case "panchang":
      return "/services/panchang";
    case "daily_horoscope":
    case "horoscope":
      return "/services/horoscope";
    case "mangal_dosha":
      return "/services/mangal-dosha";
    case "kal_sarp_dosh":
      return "/services/kal-sarp-dosh";
    case "lal_kitab":
      return "/services/lal-kitab";
    case "baby_name":
      return "/services/baby-name";
    case "horoscope_gochar":
      return "/services/gochar-phal";
    case "career_counselling":
      return "/services/career-counselling";
    default:
      return `/services/${encodeURIComponent(slug)}`;
  }
};

const getServiceEmoji = (service) => {
  const key = (service.slug || service.serviceType || "").toLowerCase();
  const map = {
    kundli: "📜",
    matching: "💞",
    kundli_matching: "💞",
    panchang: "🗓️",
    horoscope: "🔮",
    daily_horoscope: "🔮",
    mangal_dosha: "🔥",
    kal_sarp_dosh: "🐍",
    lal_kitab: "📕",
    baby_name: "👶",
    horoscope_gochar: "🪐",
    gochar_phal: "🪐",
    career_counselling: "🎯",
  };
  return map[key] || "✨";
};

export const ServiceCard = ({ service }) => {
  const router = useRouter();
  const token = useAppSelector(selectAuthToken);
  const targetHref = service?.isPaid
    ? `/payments/checkout?service=${encodeURIComponent(service.slug || service.serviceType)}`
    : routeForService(service);

  const bookNow = () => {
    if (!token) {
      router.push(`/login?next=${encodeURIComponent(targetHref)}`);
      return;
    }
    router.push(targetHref);
  };

  const priceLabel = service.isPaid ? `Starts ₹${service.basePrice}` : "Complimentary";
  const serviceHref = routeForService(service);
  const learnMoreTarget = service?.isPaid ? targetHref : serviceHref;
  const learnMoreHref = token
    ? learnMoreTarget
    : `/login?next=${encodeURIComponent(learnMoreTarget)}`;

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[rgba(196,90,42,0.12)]">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,rgba(196,90,42,0.18),transparent_60%)]" />
      </div>

      <CardHeader className="mb-3">
        <div className="flex w-full items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--color-surface)] text-lg">
            <span role="img" aria-label="service icon">{getServiceEmoji(service)}</span>
          </div>
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <Badge className="shadow-sm" variant={service.isPaid ? "default" : "outline"}>
                {service.isPaid ? "Paid" : "Free"}
              </Badge>
              <span className="ml-auto hidden rounded-full bg-[color:var(--color-card)] px-2 py-1 text-xs font-semibold text-[color:var(--color-text-soft)] md:inline">
                {priceLabel}
              </span>
            </div>
            <CardTitle className="truncate">{service.name}</CardTitle>
            <CardDescription className="line-clamp-2">{service.description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 text-sm text-[color:var(--color-text-soft)]">
        <ul className="space-y-2">
          {service.features?.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <svg className="mt-0.5 h-4 w-4 text-[color:var(--color-success)]" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414l2.293 2.293 6.543-6.543a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-[color:var(--color-text-soft)]">{feature}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 inline-flex w-fit items-center rounded-full bg-[color:var(--color-card)] px-3 py-1 text-xs font-semibold text-[color:var(--color-text)]">
          {priceLabel}
        </div>
      </CardContent>

      <div className="mt-6 flex gap-2">
        <Button onClick={bookNow} size="sm" aria-label="Book now">
          Book now
        </Button>
        <Button as={Link} href={learnMoreHref} size="sm" variant="ghost" aria-label="Learn more">
          Learn more
        </Button>
      </div>
    </Card>
  );
};

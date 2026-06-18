import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import Link from "next/link";
import AuthenticatedOnly from "../../../components/auth/AuthenticatedOnly.jsx";

async function fetchService(slug) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
  try {
    const res = await fetch(`${apiBase}/services/${encodeURIComponent(slug)}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.service || null;
  } catch (_err) {
    return null;
  }
}

export default async function ServiceBySlugPage({ params }) {
  const { slug } = await params;
  const service = await fetchService(slug);
  if (!service) return notFound();

  // Redirect to specialised pages that already exist
  switch (service.serviceType) {
    case "kundli":
      return redirect("/services/kundli");
    case "kundli_matching":
      return redirect("/services/matching");
    case "panchang":
      return redirect("/services/panchang");
    case "daily_horoscope":
      return redirect("/services/horoscope");
    case "mangal_dosha":
      return redirect("/services/mangal-dosha");
    case "career_counselling":
      return redirect("/services/career-counselling");
    case "kal_sarp_dosh":
      return redirect("/services/kal-sarp-dosh");
    case "lal_kitab":
      return redirect("/services/lal-kitab");
    case "baby_name":
      return redirect("/services/baby-name");
    case "horoscope_gochar":
      return redirect("/services/gochar-phal");
    case "year_analysis":
      return redirect("/services/year-analysis");
    default:
      break;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>{service.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-[color:var(--color-text-soft)]">
          <p className="text-[color:var(--color-text)]">{service.description}</p>
          {Array.isArray(service.features) && service.features.length > 0 && (
            <ul className="list-disc space-y-1 pl-5">
              {service.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}
          {service.isPaid ? (
            <div className="flex gap-3">
              <Button as={Link} href={`/payments/checkout?service=${service.slug}`}>
                Book now
              </Button>
              <AuthenticatedOnly>
                <Button as={Link} href="/wallet" variant="outline">
                  Recharge wallet
                </Button>
              </AuthenticatedOnly>
            </div>
          ) : (
            <p className="text-sm text-[color:var(--color-text-soft)]">
              This service opens in its own page (not in chat). Use the left panel to explore others.
            </p>
          )}
          <p className="text-xs opacity-70">More interactive flows coming soon for this service.</p>
        </CardContent>
      </Card>
    </div>
  );
}

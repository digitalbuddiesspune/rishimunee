import { ServiceCard } from "../../components/services/ServiceCard.jsx";

const sampleServices = [
  {
    _id: "svc-kundli",
    name: "Kundli Report",
    slug: "kundli",
    description: "Comprehensive Janam Kundli with planetary strengths and remedies.",
    basePrice: 799,
    isPaid: true,
    features: ["PDF report", "Remedy suggestions", "Lucky gemstones"]
  },
  {
    _id: "svc-matching",
    name: "Kundli Matching",
    slug: "matching",
    description: "Gun Milan score, strengths, and adjustments for couples.",
    basePrice: 999,
    isPaid: true,
    features: ["36 guna breakdown", "Compatibility summary", "Ritual guidance"]
  },
  {
    _id: "svc-panchang",
    name: "Daily Panchang",
    slug: "panchang",
    description: "Sunrise, tithi, and mahurat details personalised to your city.",
    basePrice: 0,
    isPaid: false,
    features: ["Tithi", "Nakshatra", "Yog", "Shubh muhurat"]
  }
];

async function fetchServices() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
  try {
    const res = await fetch(`${apiBase}/services`, { next: { revalidate: 120 } });
    if (!res.ok) return sampleServices;
    const json = await res.json();
    return json.data?.services || sampleServices;
  } catch (error) {
    console.error("Failed to fetch services", error);
    return sampleServices;
  }
}

export default async function ServicesPage() {
  const services = await fetchServices();
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-[color:var(--color-text)]">Astrology Services</h1>
        <p className="max-w-2xl text-sm text-[color:var(--color-text-soft)]">
          Handpicked offerings catering to your personal, professional, and spiritual goals.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <ServiceCard key={service._id || service.slug} service={service} />
        ))}
      </div>
    </div>
  );
}



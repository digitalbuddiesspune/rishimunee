import { ServiceCard } from "../services/ServiceCard.jsx";

const accents = [
  "bg-[color:var(--color-secondary)]/10",
  "bg-[color:var(--color-primary)]/10",
  "bg-[color:var(--color-accent)]/10",
];

async function fetchServices() {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
  try {
    const res = await fetch(`${apiBase}/services`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.services || [];
  } catch (_err) {
    return [];
  }
}

export const ServicesOverview = async () => {
  const services = await fetchServices();
  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-[color:var(--color-text)]">
          Every Service, One Cosmic Hub
        </h2>
        <p className="text-sm text-[color:var(--color-text-soft)]">
          एक स्थान पर हर सेवा — चैट, कुंडली, पंचांग, भविष्यफल और रिपोर्ट्स।
          RisheeMuni Wallet से सरल बुकिंग।
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {services.map((s) => (
          <ServiceCard key={s._id || s.slug} service={s} />
        ))}
        {services.length === 0 && (
          <div className="col-span-full rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-6 text-sm text-[color:var(--color-text-soft)]">
            Services are being prepared. Please check back shortly.
          </div>
        )}
      </div>
    </section>
  );
};

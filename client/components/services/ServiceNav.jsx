"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

// Preferred order when rendering, but actual visibility comes from API
const CORE_ORDER = [
  "kundli",
  "matching",
  "panchang",
  "horoscope",
  "mangal-dosha",
  "kal-sarp-dosh",
  "lal-kitab",
  "baby-name",
  "gochar-phal",
  "career-counselling",
  "life-report",
  "year-analysis",
];

function routeForService(slugOrType) {
  switch (slugOrType) {
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
    case "life_report":
      return "/services/life-report";
    case "year_analysis":
      return "/services/year-analysis";
    default:
      return `/services/${encodeURIComponent(slugOrType)}`;
  }
}

export function ServiceNav() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
        const res = await fetch(`${apiBase}/services`);
        if (!res.ok) return;
        const json = await res.json();
        const apiServices = (json?.data?.services || []).map((s) => ({
          slug: s.slug || s.serviceType,
          name: s.name || s.slug || s.serviceType,
          isPaid: !!s.isPaid,
          serviceType: s.serviceType,
        }));
        // Only show what API says is active; sort by preferred order
        const sorted = apiServices.sort((a, b) => (
          (CORE_ORDER.indexOf(a.slug) === -1 ? 999 : CORE_ORDER.indexOf(a.slug)) -
          (CORE_ORDER.indexOf(b.slug) === -1 ? 999 : CORE_ORDER.indexOf(b.slug))
        ));
        if (!cancelled) setServices(sorted);
      } catch (_e) {
        // keep core list
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const list = useMemo(() => services, [services]);

  return (
    <div className="h-[55vh] overflow-y-auto pr-2 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-4">
      <p className="mb-3 text-sm font-semibold text-[color:var(--color-text)]">
        Services
      </p>
      <nav className="space-y-1 text-sm">
        {list.map((s) => {
          const slug = s.slug;
          const isPaid = !!s.isPaid;
          const paywallHref = `/payments/checkout?service=${encodeURIComponent(
            slug
          )}`;
          const pageHref = routeForService(s.serviceType || slug);
          const href = isPaid ? paywallHref : pageHref;
          return (
            <Link
              key={slug}
              href={href}
              className="block rounded-xl px-3 py-2 text-[color:var(--color-text-soft)] hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-text)]"
            >
              {s.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

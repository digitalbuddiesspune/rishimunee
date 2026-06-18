"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card.jsx";
import { apiClient } from "../../lib/api-client.js";
import { selectAuthToken } from "../../lib/store/slices/authSlice.js";

const SERVICE_LABELS = {
  kundli: "Kundli",
  kundli_matching: "Kundli Matching",
  panchang: "Panchang",
  daily_horoscope: "Horoscope",
  horoscope_lal_kitab: "Lal Kitab",
  horoscope_gochar: "Gochar Phal",
  baby_name: "Baby Name",
  mangal_dosha: "Mangal Dosha",
  kal_sarp_dosh: "Kal Sarp Dosh",
  career: "Career Counselling",
  career_counselling: "Career Counselling",
  life_report: "Life Report",
  year_analysis: "Year Analysis"
};

export function ServiceHistoryCard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = useSelector(selectAuthToken);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        // Wait until auth token is available (after refresh)
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");
        const { data } = await apiClient.get("/reports");
        if (!cancelled) setItems(data?.data?.reports || []);
      } catch (e) {
        if (!cancelled) setError("Unable to load service history");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const list = useMemo(() => items, [items]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-[color:var(--color-text-soft)] max-h-[50vh] overflow-y-auto pr-2">
        {loading && <p>Loading...</p>}
        {!loading && error && <p className="text-[color:var(--color-danger)]">{error}</p>}
        {!loading && !error && list.length === 0 && <p>No service reports yet.</p>}
        {!loading && !error && list.length > 0 && (
          <ul className="space-y-2">
            {list.map((r) => {
              const label = SERVICE_LABELS[r.serviceType] || r.serviceType;
              const subtitle = r?.payload?.name || r?.payload?.bride?.name || r?.payload?.place || "Report";
              return (
                <li key={r._id}>
                  <Link href={`/reports/${r._id}`} className="block rounded-xl px-3 py-2 hover:bg-[color:var(--color-surface)]">
                    <p className="text-[color:var(--color-text)]">{label}</p>
                    <p className="text-xs">{new Date(r.createdAt).toLocaleString()} • {subtitle}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

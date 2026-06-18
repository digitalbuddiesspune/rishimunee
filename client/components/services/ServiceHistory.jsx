"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card.jsx";

export function ServiceHistory({ serviceType, onSelect }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchHistory() {
      try {
        setLoading(true);
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
        const res = await fetch(`${apiBase}/kundli/history?serviceType=${encodeURIComponent(serviceType)}`, { credentials: "include" });
        const json = await res.json();
        if (!cancelled) setItems(json?.data?.reports || []);
      } catch (_e) {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (serviceType) fetchHistory();
    return () => { cancelled = true; };
  }, [serviceType]);

  if (!serviceType) return null;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs text-[color:var(--color-text-soft)] max-h-[28vh] overflow-y-auto pr-2">
        {loading && <p>Loading...</p>}
        {!loading && items.length === 0 && <p>No previous reports.</p>}
        {!loading && items.length > 0 && (
          <ul className="space-y-2">
            {items.map((r) => (
              <li key={r._id}>
                <button
                  className="w-full text-left rounded-lg px-2 py-1 hover:bg-[color:var(--color-surface)]"
                  onClick={() => onSelect?.(r)}
                >
                  {new Date(r.createdAt).toLocaleString()} • {(r.payload?.name || r.payload?.bride?.name || r.payload?.place || "Report")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}


"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card.jsx";
import { apiClient } from "../../lib/api-client.js";
import { selectAuthToken } from "../../lib/store/slices/authSlice.js";

const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export function OrderHistoryCard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = useSelector(selectAuthToken);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        // Wait for auth to initialise on refresh
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");
        const { data } = await apiClient.get("/orders/me");
        const list = data?.data?.orders || [];
        // Prioritise shop orders; keep others too
        const sorted = list
          .slice()
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        if (!cancelled) setOrders(sorted);
      } catch (e) {
        if (!cancelled) setError("Unable to load orders");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const list = useMemo(() => orders.filter((o) => o.serviceType === "gemstone"), [orders]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shop Orders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-[color:var(--color-text-soft)] max-h-[50vh] overflow-y-auto pr-2">
        {loading && <p>Loading...</p>}
        {!loading && error && (
          <p className="text-[color:var(--color-danger)]">{error}</p>
        )}
        {!loading && !error && list.length === 0 && (
          <p>No orders yet.</p>
        )}
        {!loading && !error && list.length > 0 && (
          <ul className="space-y-2">
            {list.map((o) => (
              <li key={o._id}>
                <Link href={`/orders/${o._id}`} className="block rounded-xl px-3 py-2 hover:bg-[color:var(--color-surface)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[color:var(--color-text)]">
                        {(o.items || []).map((i) => i.name).join(", ") || "Order"}
                      </p>
                      <p className="text-xs">
                        {new Date(o.createdAt).toLocaleString()} • {o.paymentGateway?.toUpperCase()} • {rupees(o.amount)}
                      </p>
                    </div>
                    <span className="mt-0.5 inline-flex rounded-full border border-[color:var(--color-border)] px-2 py-0.5 text-xs capitalize text-[color:var(--color-text-soft)]">
                      {o.deliveryStatus || o.status}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

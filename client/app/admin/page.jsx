"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card.jsx";
import { adminApiClient } from "../../lib/admin-api-client.js";
import { useAppSelector } from "../../lib/store/hooks.js";
import { selectAdminAccessToken } from "../../lib/store/slices/adminAuthSlice.js";

export default function AdminOverviewPage() {
  const adminToken = useAppSelector(selectAdminAccessToken);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState({
    userCount: 0,
    astrologerCount: 0,
    orderCount: 0,
    revenue: 0
  });

  useEffect(() => {
    if (!adminToken) return; // wait for admin session
    const load = async () => {
      try {
        const { data } = await adminApiClient.get("/admin/dashboard");
        const m = data?.data?.metrics || {};
        setMetrics({
          userCount: m.userCount || 0,
          astrologerCount: m.astrologerCount || 0,
          orderCount: m.orderCount || 0,
          revenue: m.revenue || 0
        });
      } catch (e) {
        console.error("Failed to load admin overview metrics", e);
        setError("Unable to load overview stats");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [adminToken]);

  const items = [
    { title: "Total Users", value: metrics.userCount.toLocaleString() },
    { title: "Total Astrologers", value: metrics.astrologerCount.toLocaleString() },
    { title: "Total Orders", value: metrics.orderCount.toLocaleString() },
    { title: "Revenue", value: `₹${Number(metrics.revenue || 0).toLocaleString("en-IN")}` }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-[color:var(--color-text)]">Overview</h1>
        <p className="text-sm text-[color:var(--color-text-soft)]">Monitor platform health, orders, and active chats.</p>
      </div>
      {error && <p className="text-sm text-[color:var(--color-danger)]">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-[color:var(--color-text)]">
                {loading ? "—" : item.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Live Feed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[color:var(--color-text-soft)]">
          <p>• Platform metrics and recent activity will appear here.</p>
        </CardContent>
      </Card>
    </div>
  );
}


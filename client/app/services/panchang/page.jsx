"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/Button.jsx";
import { Input } from "../../../components/ui/Input.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import { apiClient } from "../../../lib/api-client.js";
import { ServiceNav } from "../../../components/services/ServiceNav.jsx";
import LoadingOverlay from "../../../components/ui/LoadingOverlay.jsx";

export default function PanchangPage() {
  const [location, setLocation] = useState("Delhi, India");
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPanchang = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(`/panchang?location=${encodeURIComponent(location)}`);
      setDetails(data.data.panchang);
    } catch (error) {
      console.error("Unable to load panchang", error);
    } finally {
      setLoading(false);
    }
  };

  if (details) {
    return (
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-12 md:grid-cols-12">
        <aside className="md:col-span-4 lg:col-span-3">
          <ServiceNav />
        </aside>
        <main className="md:col-span-8 lg:col-span-9">
          <Card className="h-[70vh] flex flex-col">
            <CardHeader>
              <CardTitle>Daily Panchang</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 overflow-y-auto pr-2">
              <div className="grid gap-4 rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-4 text-sm text-[color:var(--color-text-soft)] sm:grid-cols-2">
                {Object.entries(details).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs uppercase text-[color:var(--color-muted-foreground)]">{key}</p>
                    <p className="font-medium text-[color:var(--color-text)]">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Daily Panchang</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City, Country" />
            <Button onClick={fetchPanchang} disabled={loading}>
              {loading ? "Fetching..." : "Get Panchang"}
            </Button>
          </div>
          <p className="text-sm text-[color:var(--color-text-soft)]">Enter your city to view today’s tithi, nakshatra, yog, and auspicious timings.</p>
        </CardContent>
      </Card>
      <LoadingOverlay show={loading} label="Fetching panchang..." />
    </div>
  );
}

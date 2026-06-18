"use client";

import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import { adminApiClient } from "../../../lib/admin-api-client.js";

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await adminApiClient.get("/services", { params: { includeInactive: true } });
        setServices(data.data.services || []);
      } catch (error) {
        console.error("Failed to load services", error);
      }
    };
    load();
  }, []);

  const toggleService = async (id) => {
    try {
      const { data } = await adminApiClient.patch(`/services/${id}/toggle`);
      const updated = data.data?.service;
      setServices((prev) => prev.map((s) => (s._id === id ? updated : s)));
    } catch (error) {
      console.error("Failed to toggle service", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[color:var(--color-text)]">Services</h1>
        {/* Creation and catalog upsert removed intentionally */}
      </div>
      {/* Creation form removed */}
      <Card>
        <CardHeader>
          <CardTitle>Existing services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[color:var(--color-text-soft)]">
          {services.map((service) => (
            <div key={service._id} className="flex items-start justify-between gap-4 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-3">
              <div>
                <p className="font-medium text-[color:var(--color-text)]">{service.name}</p>
                <p>{service.description}</p>
                {!service.isActive && <p className="mt-1 inline-block rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">Hidden</p>}
              </div>
              <Button variant={service.isActive ? "outline" : "primary"} size="sm" onClick={() => toggleService(service._id)}>
                {service.isActive ? "Hide" : "Make visible"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}


"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { apiClient } from "../../../lib/api-client.js";
import RequireAuth from "../../../components/auth/RequireAuth.jsx";
import { submitHostedPayment } from "../../../lib/payu.js";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center">Loading…</div>}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const params = useSearchParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const slug = params.get("service");

  useEffect(() => {
    const load = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
        const res = await fetch(
          `${apiBase}/services/${encodeURIComponent(slug)}`
        );
        const json = await res.json();
        setService(json.data?.service || null);
      } catch (err) {
        setError("Unable to load service");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const handlePay = async () => {
    if (!service) return;
    try {
      setError("");
      const { data } = await apiClient.post("/payments/initiate", {
        serviceType: service.serviceType,
        gateway: "payu",
        platform: "web"
      });
      submitHostedPayment(data.data?.payment);
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed");
    }
  };

  return (
    <RequireAuth>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-semibold text-[color:var(--color-text)]">
            Checkout
          </h1>
          {!slug && (
            <p className="text-sm text-[color:var(--color-text-soft)]">
              Select a service from the catalog to continue.
            </p>
          )}
        </div>

        {slug && (
          <Card>
            <CardHeader>
              <CardTitle>Review and Pay</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[color:var(--color-text-soft)]">
              {loading && <p>Loading service...</p>}
              {error && (
                <p className="text-[color:var(--color-danger)]">{error}</p>
              )}
              {service && (
                <>
                  <div className="flex items-center justify-between text-[color:var(--color-text)]">
                    <p className="font-medium">{service.name}</p>
                    <p>{service.isPaid ? `₹${service.basePrice}` : "Free"}</p>
                  </div>
                  <p>{service.description}</p>
                  <p>You will continue to PayU Hosted Checkout.</p>
                  <div className="flex gap-3">
                    <Button onClick={handlePay}>Continue to PayU</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {!slug && (
          <Card>
            <CardHeader>
              <CardTitle>How it works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[color:var(--color-text-soft)]">
              <p>
                Pick a service and continue to PayU Hosted Checkout.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </RequireAuth>
  );
}

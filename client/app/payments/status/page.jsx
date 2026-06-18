"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import { apiClient } from "../../../lib/api-client.js";

export default function PaymentStatusPage() {
  return <Suspense fallback={<div className="py-24 text-center">Checking payment...</div>}><PaymentStatus /></Suspense>;
}

function PaymentStatus() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    let timer;
    const load = async () => {
      try {
        const { data } = await apiClient.get(`/orders/${orderId}/payment-status`);
        if (cancelled) return;
        setOrder(data.data);
        if (data.data.status === "pending") timer = setTimeout(load, 2500);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || "Unable to verify payment");
      }
    };
    load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [orderId]);

  const labels = {
    paid: "Payment successful",
    pending: "Payment is being verified",
    failed: "Payment failed",
    cancelled: "Payment cancelled",
    refunded: "Payment refunded"
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <Card>
        <CardHeader><CardTitle>{order ? labels[order.status] || "Payment status" : "Checking payment"}</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-[color:var(--color-text-soft)]">
          {!orderId && <p>Order reference is missing.</p>}
          {error && <p className="text-[color:var(--color-danger)]">{error}</p>}
          {order && <>
            <p>Order: {order.orderId}</p>
            {order.invoiceNumber && <p>Invoice: {order.invoiceNumber}</p>}
            <p>Total: ₹{Number(order.amount).toLocaleString("en-IN")}</p>
            {order.paymentReference && <p>Payment reference: {order.paymentReference}</p>}
            {order.status === "paid" && <p>A confirmation has been sent to your email.</p>}
          </>}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { apiClient } from "../../../lib/api-client.js";
import { useAppDispatch, useAppSelector } from "../../../lib/store/hooks.js";
import { loadSession, selectAuthToken } from "../../../lib/store/slices/authSlice.js";

const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl px-4 py-12">Loading order...</div>}>
      <OrderDetail />
    </Suspense>
  );
}

function OrderDetail() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id;
  const isConfirmed = searchParams.get("confirmed") === "1";
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAuthToken);

  useEffect(() => {
    let cancelled = false;
    if (!id) return;
    if (!token) {
      dispatch(loadSession());
      setLoading(true);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await apiClient.get(`/orders/${id}`);
        if (!cancelled) setOrder(data?.data?.order || null);
      } catch (e) {
        if (!cancelled) setError("Unable to load order");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, token, dispatch]);

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-12">Loading order...</div>;
  if (error || !order) return <div className="mx-auto max-w-4xl px-4 py-12">Unable to load order.</div>;

  const address = order?.notes?.address;
  const isCod = order.paymentGateway === "cod";
  const showConfirmation = isConfirmed && isCod;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-12">
      {showConfirmation && (
        <div className="rounded-2xl border border-[color:var(--color-success)]/30 bg-[color:var(--color-success)]/10 p-6">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="mt-0.5 h-8 w-8 shrink-0 text-[color:var(--color-success)]" />
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-[color:var(--color-text)]">Order confirmed!</h1>
              <p className="text-sm text-[color:var(--color-text-soft)]">
                Thank you for shopping with RisheeMuni. Your order has been placed successfully and will be prepared for delivery.
              </p>
              <p className="text-sm text-[color:var(--color-text-soft)]">
                {isCod
                  ? `Please keep ${rupees(order.amount)} ready in cash when your order arrives.`
                  : `Total paid: ${rupees(order.amount)}.`}
              </p>
              <p className="text-xs text-[color:var(--color-text-soft)]">
                Order reference: <span className="font-mono text-[color:var(--color-text)]">{order._id}</span>
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button as={Link} href="/store" variant="outline" size="sm">
                  Continue shopping
                </Button>
                <Button as={Link} href="/dashboard" size="sm">
                  View my orders
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{showConfirmation ? "Order summary" : "Order Details"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm text-[color:var(--color-text-soft)]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[color:var(--color-text)]">Summary</p>
              <p>Order ID: {order._id}</p>
              <p>Placed: {new Date(order.createdAt).toLocaleString()}</p>
              <p>Status: <span className="capitalize">{order.deliveryStatus || order.status}</span></p>
              <p>Payment: {isCod ? "Cash on Delivery" : order.paymentGateway?.toUpperCase()}</p>
              <p>Total: {rupees(order.amount)}</p>
            </div>
            <div>
              <p className="text-[color:var(--color-text)]">Shipping Address</p>
              {address ? (
                <div>
                  <p>{address.name} • {address.phone}</p>
                  <p>{address.line1}{address.line2 ? `, ${address.line2}` : ""}</p>
                  <p>{address.city}, {address.state} {address.postalCode}</p>
                  <p>{address.country || "IN"}</p>
                </div>
              ) : (
                <p>—</p>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[color:var(--color-text)]">Items</p>
            <div className="divide-y divide-[color:var(--color-border)] rounded-2xl border border-[color:var(--color-border)]">
              {(order.items || []).map((i, idx) => (
                <div key={idx} className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-[color:var(--color-text)]">{i.name}</p>
                    <p className="text-xs">Qty: {i.quantity}</p>
                  </div>
                  <p>{rupees((i.price || 0) * (i.quantity || 1))}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card.jsx";
import { apiClient } from "../../../lib/api-client.js";
import { useAppDispatch, useAppSelector } from "../../../lib/store/hooks.js";
import { loadSession, selectAuthToken } from "../../../lib/store/slices/authSlice.js";

const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAuthToken);

  useEffect(() => {
    let cancelled = false;
    if (!id) return;
    // Ensure session is loaded so apiClient has the token
    if (!token) {
      dispatch(loadSession());
      setLoading(true);
      return; // wait for token
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
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-sm text-[color:var(--color-text-soft)]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[color:var(--color-text)]">Summary</p>
              <p>Order ID: {order._id}</p>
              <p>Placed: {new Date(order.createdAt).toLocaleString()}</p>
              <p>Status: <span className="capitalize">{order.deliveryStatus || order.status}</span></p>
              <p>Payment: {order.paymentGateway?.toUpperCase()}</p>
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

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../../lib/api-client.js";
import { Button } from "../../components/ui/Button.jsx";
import { notifyCartUpdated } from "../../lib/cart-events.js";
import { useAppSelector } from "../../lib/store/hooks.js";
import { selectAuthToken } from "../../lib/store/slices/authSlice.js";
import Image from "next/image";
import { submitHostedPayment } from "../../lib/payu.js";

export default function CheckoutPage() {
  const token = useAppSelector(selectAuthToken);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState({ name: "", phone: "", line1: "", line2: "", city: "", state: "", postalCode: "", country: "IN" });
  const gateway = "payu";
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const refreshCart = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get("/cart");
      const nextCart = data.data?.cart || null;
      setCart(nextCart);
      const items = nextCart?.items || [];
      const count = items.reduce((s, i) => s + (i.quantity || 0), 0);
      notifyCartUpdated(count);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 404 || status === 400 || status === 401) {
        setCart(null);
        notifyCartUpdated(0);
      } else {
        console.error("Failed to load cart", e?.response?.data || e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setCart(null);
      setLoading(false);
      notifyCartUpdated(0);
      return;
    }
    refreshCart();
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = { gateway, address };
      const { data } = await apiClient.post("/checkout/initiate", payload);
      submitHostedPayment(data.data?.payment);
    } catch (err) {
      console.error("Checkout failed", err?.response?.data || err.message);
      alert("Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 px-4 py-12 md:grid-cols-2">
        <div className="space-y-4">
          <div className="h-6 w-48 animate-pulse rounded bg-[color:var(--color-card)]" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 w-full animate-pulse rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-card)]" />
          ))}
          <div className="h-6 w-32 animate-pulse rounded bg-[color:var(--color-card)]" />
          <div className="flex gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 w-32 animate-pulse rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-card)]" />
            ))}
          </div>
          <div className="h-11 w-40 animate-pulse rounded-full bg-[color:var(--color-card)]" />
        </div>
        <div className="space-y-4">
          <div className="h-6 w-48 animate-pulse rounded bg-[color:var(--color-card)]" />
          <div className="divide-y divide-[color:var(--color-border)] rounded-2xl border border-[color:var(--color-border)]">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="h-14 w-14 animate-pulse rounded-md bg-[color:var(--color-card)]" />
                <div className="flex-1">
                  <div className="mb-2 h-4 w-2/3 animate-pulse rounded bg-[color:var(--color-card)]" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-[color:var(--color-card)]" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-6 w-56 animate-pulse rounded bg-[color:var(--color-card)]" />
        </div>
      </div>
    );
  const items = cart?.items || [];
  const total = items.reduce((sum, i) => sum + (i.productId?.price || 0) * (i.quantity || 1), 0);

  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 px-4 py-12 md:grid-cols-2">
      <form onSubmit={submit} className="space-y-4">
        <h2 className="text-xl font-semibold text-[color:var(--color-text)]">Shipping Address</h2>
        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="Full name" className="rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" value={address.name} onChange={(e) => setAddress((a) => ({ ...a, name: e.target.value }))} />
          <input required placeholder="Phone" className="rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" value={address.phone} onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))} />
          <input required placeholder="Address line 1" className="col-span-2 rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" value={address.line1} onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))} />
          <input placeholder="Address line 2" className="col-span-2 rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" value={address.line2} onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))} />
          <input required placeholder="City" className="rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} />
          <input required placeholder="State" className="rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" value={address.state} onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))} />
          <input required placeholder="Postal code" className="rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" value={address.postalCode} onChange={(e) => setAddress((a) => ({ ...a, postalCode: e.target.value }))} />
          <input placeholder="Country" className="rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2" value={address.country} onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))} />
        </div>

        <h2 className="pt-6 text-xl font-semibold text-[color:var(--color-text)]">Payment</h2>
        <p className="text-sm text-[color:var(--color-text-soft)]">You will continue to PayU Hosted Checkout.</p>
        <Button type="submit" isLoading={submitting}>Continue to PayU</Button>
      </form>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[color:var(--color-text)]">Order Summary</h2>
        <div className="divide-y divide-[color:var(--color-border)] rounded-2xl border border-[color:var(--color-border)]">
          {items.map((i) => {
            const img = i.productId?.images?.[0] || null;
            return (
              <div key={i.productId?._id} className="flex items-center justify-between gap-4 p-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 overflow-hidden rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-card)]">
                    {img ? (
                      <Image src={img} alt={i.productId?.name || "Product"} width={56} height={56} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-[color:var(--color-text-soft)]">No image</div>
                    )}
                  </div>
                  <p className="text-[color:var(--color-text)]">{i.productId?.name}</p>
                </div>
                <p className="text-[color:var(--color-text-soft)]">₹{i.productId?.price} × {i.quantity}</p>
              </div>
            );
          })}
        </div>
        <p className="text-lg font-semibold text-[color:var(--color-text)]">Total: ₹{Number(total).toLocaleString("en-IN")}</p>
      </div>
    </div>
  );
}

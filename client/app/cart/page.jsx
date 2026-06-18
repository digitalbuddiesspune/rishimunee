"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { apiClient } from "../../lib/api-client.js";
import { Button } from "../../components/ui/Button.jsx";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { notifyCartUpdated } from "../../lib/cart-events.js";
import { useAppSelector } from "../../lib/store/hooks.js";
import { selectAuthToken } from "../../lib/store/slices/authSlice.js";

export default function CartPage() {
  const token = useAppSelector(selectAuthToken);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [navigating, setNavigating] = useState(false);
  const router = useRouter();

  const refresh = async ({ background = false } = {}) => {
    try {
      if (!background) setLoading(true);
      const { data } = await apiClient.get("/cart");
      const nextCart = data.data?.cart || null;
      setCart(nextCart);
      const items = nextCart?.items || [];
      const count = items.reduce((s, i) => s + (i.quantity || 0), 0);
      notifyCartUpdated(count);
    } catch (e) {
      const status = e?.response?.status;
      if (status === 404 || status === 400 || status === 401) {
        // Empty cart – set to null and zero count without error noise
        setCart(null);
        notifyCartUpdated(0);
      } else {
        console.error("Failed to load cart", e?.response?.data || e.message);
      }
    } finally {
      if (!background) setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setCart(null);
      setLoading(false);
      notifyCartUpdated(0);
      return;
    }
    refresh();
  }, [token]);

  const updateQty = async (productId, quantity) => {
    try {
      setUpdatingId(productId);
      await apiClient.patch("/cart/item", { productId, quantity });
      await refresh({ background: true });
    } finally {
      setUpdatingId(null);
    }
  };
  const removeItem = async (productId) => {
    try {
      setUpdatingId(productId);
      await apiClient.post("/cart/remove", { productId });
      await refresh({ background: true });
    } finally {
      setUpdatingId(null);
    }
  };

  const goToCheckout = () => {
    setNavigating(true);
    router.push("/checkout");
  };

  if (loading)
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12">
        <div className="mb-6 h-6 w-40 animate-pulse rounded bg-[color:var(--color-card)]" />
        <div className="divide-y divide-[color:var(--color-border)] rounded-2xl border border-[color:var(--color-border)]">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4">
              <div className="h-20 w-20 shrink-0 animate-pulse rounded-lg bg-[color:var(--color-card)]" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-3/5 animate-pulse rounded bg-[color:var(--color-card)]" />
                <div className="h-3 w-2/5 animate-pulse rounded bg-[color:var(--color-card)]" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 animate-pulse rounded-full bg-[color:var(--color-card)]" />
                <div className="h-4 w-8 animate-pulse rounded bg-[color:var(--color-card)]" />
                <div className="h-9 w-9 animate-pulse rounded-full bg-[color:var(--color-card)]" />
                <div className="h-9 w-16 animate-pulse rounded-full bg-[color:var(--color-card)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  const items = cart?.items || [];
  const total = items.reduce((sum, i) => sum + (i.productId?.price || 0) * (i.quantity || 1), 0);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-12">
      <h1 className="text-2xl font-semibold text-[color:var(--color-text)]">Your Cart</h1>
      {items.length === 0 ? (
        <div className="mx-auto mt-2 w-full max-w-xl rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-secondary)]/30">
            <ShoppingCart className="h-8 w-8 text-[color:var(--color-text-soft)]" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-[color:var(--color-text)]">Your cart is empty</h2>
          <p className="mb-6 text-[color:var(--color-text-soft)]">Looks like you haven’t added anything yet.</p>
          <div className="flex items-center justify-center gap-3">
            <Button as={Link} href="/store" size="md">Browse Shop</Button>
            <Button as={Link} href="/services" variant="outline" size="md">Explore Services</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="divide-y divide-[color:var(--color-border)] rounded-2xl border border-[color:var(--color-border)]">
            {items.map((i) => {
              const img = i.productId?.images?.[0] || null;
              const pid = i.productId?._id;
              const isUpdating = updatingId === pid;
              return (
                <div key={pid} className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-card)]">
                      {img ? (
                        <Image
                          src={img}
                          alt={i.productId?.name || "Product"}
                          width={80}
                          height={80}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-[color:var(--color-text-soft)]">No image</div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[color:var(--color-text)]">{i.productId?.name}</p>
                      <p className="text-sm text-[color:var(--color-text-soft)]">₹{i.productId?.price} × {i.quantity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        const q = i.quantity || 1;
                        if (q <= 1) return removeItem(pid);
                        return updateQty(pid, q - 1);
                      }}
                      disabled={isUpdating}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">
                      {isUpdating ? (
                        <span className="mx-auto block h-4 w-4 animate-spin rounded-full border-2 border-[color:var(--color-text-soft)] border-t-transparent" />
                      ) : (
                        i.quantity
                      )}
                    </span>
                    <Button size="sm" onClick={() => updateQty(pid, (i.quantity || 1) + 1)} disabled={isUpdating}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => removeItem(pid)} disabled={isUpdating}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-[color:var(--color-text)]">Total: ₹{Number(total).toLocaleString("en-IN")}</p>
            <Button onClick={goToCheckout} isLoading={navigating}>Checkout</Button>
          </div>
        </>
      )}
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { Button } from "../ui/Button.jsx";
import { apiClient } from "../../lib/api-client.js";
import { useRouter } from "next/navigation";
import { notifyCartUpdated } from "../../lib/cart-events.js";
import { useAppSelector } from "../../lib/store/hooks.js";
import { selectAuthToken } from "../../lib/store/slices/authSlice.js";

export function AddToCartButton({ productId, quantity = 1 }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const token = useAppSelector(selectAuthToken);

  const onAdd = async () => {
    // If not authenticated, redirect to login immediately
    if (!token) {
      router.push(`/login?next=${encodeURIComponent("/cart")}`);
      return;
    }
    try {
      setLoading(true);
      await apiClient.post("/cart/add", { productId, quantity });
      // Fetch updated count and notify listeners (header badge, etc.)
      try {
        const { data } = await apiClient.get("/cart");
        const items = data?.data?.cart?.items || [];
        const count = items.reduce((s, i) => s + (i.quantity || 0), 0);
        notifyCartUpdated(count);
      } catch (_) {}
      router.push("/cart");
    } catch (err) {
      console.error("Add to cart failed", err?.response?.data || err.message);
      const status = err?.response?.status;
      if (status === 401) {
        router.push(`/login?next=${encodeURIComponent("/cart")}`);
        return;
      }
      alert("Unable to add to cart");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button size="sm" onClick={onAdd} disabled={loading}>
      {loading ? "Adding..." : "Add to Cart"}
    </Button>
  );
}

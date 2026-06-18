"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "../../lib/api-client.js";
import { ProductCard } from "./ProductCard.jsx";

const PAGE_SIZE = 100;

const mergeProducts = (prev, batch, replace = false) => {
  const merged = replace ? batch : [...prev, ...batch];
  const seen = new Set();
  return merged.filter((product) => {
    const key = product._id || product.slug;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export function StoreProductGrid() {
  const [products, setProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const pageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);
  const sentinelRef = useRef(null);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;

    loadingRef.current = true;
    const nextPage = pageRef.current + 1;
    const isFirstPage = nextPage === 1;

    try {
      if (isFirstPage) setLoading(true);
      else setLoadingMore(true);
      setError("");

      const { data } = await apiClient.get("/products", {
        params: { page: nextPage, limit: PAGE_SIZE }
      });

      const batch = Array.isArray(data.data?.products) ? data.data.products : [];
      const pagination = data.data?.pagination;
      const more = pagination?.hasMore ?? batch.length === PAGE_SIZE;

      setProducts((prev) => mergeProducts(prev, batch, isFirstPage));
      hasMoreRef.current = more;
      setHasMore(more);
      pageRef.current = nextPage;
    } catch (err) {
      console.error("Failed to load products", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadMore();
  }, [loadMore]);

  useEffect(() => {
    if (loading || !hasMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, loading, hasMore]);

  if (loading) {
    return (
      <p className="text-sm text-[color:var(--color-text-soft)]">Loading products...</p>
    );
  }

  if (error && !products.length) {
    return <p className="text-sm text-red-500">{error}</p>;
  }

  if (!products.length) {
    return (
      <p className="text-sm text-[color:var(--color-text-soft)]">
        No products are available right now.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6 lg:gap-5">
        {products.map((product) => (
          <ProductCard
            key={product._id || product.slug}
            product={product}
          />
        ))}
      </div>

      {hasMore ? (
        <div ref={sentinelRef} className="flex justify-center py-8">
          {loadingMore ? (
            <p className="text-sm text-[color:var(--color-text-soft)]">Loading more products...</p>
          ) : null}
        </div>
      ) : products.length > PAGE_SIZE ? (
        <p className="py-6 text-center text-sm text-[color:var(--color-text-soft)]">
          You&apos;ve seen all products.
        </p>
      ) : null}

      {error ? <p className="text-center text-sm text-red-500">{error}</p> : null}
    </>
  );
}

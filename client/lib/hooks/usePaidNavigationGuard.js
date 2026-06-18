"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function usePaidNavigationGuard({ isPaid, hasResult, clearResult, hasPaidFlag, unlockedOverride = false }) {
  const router = useRouter();
  const unlockedRef = useRef(false);

  // When a paid result appears, replace URL to drop paid=1 so history won't freely replay
  useEffect(() => {
    if (!isPaid) return;
    if (unlockedOverride) {
      unlockedRef.current = true;
    }
    if (hasResult && typeof window !== "undefined") {
      unlockedRef.current = true;
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has("paid")) {
          url.searchParams.delete("paid");
          const qs = url.searchParams.toString();
          router.replace(url.pathname + (qs ? `?${qs}` : ""));
        }
      } catch (_) {}
    }
  }, [isPaid, hasResult, router, unlockedOverride]);

  // Guard against BFCache/back-forward revisits without entitlement
  useEffect(() => {
    if (!isPaid) return;
    const handlePageShow = (event) => {
      // If page is restored from bfcache and no paid flag in URL, clear the result
      if (event?.persisted && typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (!url.searchParams.get("paid") && !unlockedRef.current) {
          clearResult?.();
        }
      }
    };
    const handlePopState = () => {
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      if (!url.searchParams.get("paid") && !unlockedRef.current) {
        clearResult?.();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isPaid, clearResult]);
}

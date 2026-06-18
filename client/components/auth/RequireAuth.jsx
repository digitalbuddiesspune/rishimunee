"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "../../lib/store/hooks.js";
import { selectAuthToken } from "../../lib/store/slices/authSlice.js";

export default function RequireAuth({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAppSelector(selectAuthToken);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Fast check from Redux; fallback to localStorage in case session hasn't hydrated yet
    if (token) {
      setChecked(true);
      return;
    }
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem("aa-session") : null;
      const hasSession = !!raw;
      if (hasSession) {
        setChecked(true);
      } else {
        // Redirect unauthenticated users to login
        const next = pathname || "/";
        router.replace(`/login?next=${encodeURIComponent(next)}`);
      }
    } catch (_e) {
      router.replace("/login");
    }
  }, [token, pathname, router]);

  if (!checked && token == null) {
    return null; // Prevent flicker while redirecting
  }
  return children;
}


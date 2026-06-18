"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Logo } from "../ui/Logo.jsx";

export function AuthModal({ children, title }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const handleClose = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  }, [router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") handleClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [handleClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Authentication"}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-label="Close dialog"
      />
      <div className="relative z-10 w-full max-w-md overflow-y-auto rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-6 shadow-2xl max-h-[90vh]">
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--color-border)] text-[color:var(--color-text-soft)] hover:text-[color:var(--color-text)]"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="mb-5 flex justify-center pt-2">
          <Logo size="lg" href={null} />
        </div>
        {title ? (
          <h2 className="mb-5 text-center text-xl font-semibold text-[color:var(--color-text)]">
            {title}
          </h2>
        ) : null}
        {children}
      </div>
    </div>,
    document.body
  );
}

"use client";

import clsx from "clsx";
import { Logo } from "./Logo.jsx";

export function LoadingOverlay({ show = false, label = "Generating...", className }) {
  if (!show) return null;
  return (
    <div className={clsx("fixed inset-0 z-50 flex items-center justify-center bg-black/40", className)}>
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-card)] px-6 py-5 shadow-xl">
        <Logo size="lg" href={null} />
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-transparent border-t-[color:var(--color-text)]" />
        <p className="text-sm font-medium text-[color:var(--color-text)]">{label}</p>
        <p className="text-xs text-[color:var(--color-text-soft)]">This may take a few seconds…</p>
      </div>
    </div>
  );
}

export default LoadingOverlay;

"use client";

import { useMemo, useState } from "react";

// Lightweight avatar that renders an image when available,
// falling back to initials inside a colored circle.
export const Avatar = ({ src, alt, name, className = "" }) => {
  const [errored, setErrored] = useState(false);

  const initials = useMemo(() => {
    if (!name) return "";
    const parts = String(name).trim().split(/\s+/);
    const letters = parts.slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
    return letters || "";
  }, [name]);

  const normalizedSrc = useMemo(() => {
    if (!src) return "";
    const s = String(src);
    if (s.startsWith("http")) return s;
    if (s.startsWith("data:")) return s;
    // Otherwise, treat as relative path (e.g., from Next public/ or app CDN)
    return s;
  }, [src]);

  const showImage = normalizedSrc && !errored;

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-card)] shadow-sm ${className}`}
      aria-label={alt || name || "Avatar"}
    >
      {showImage ? (
        <img
          src={normalizedSrc}
          alt={alt || name || "Avatar"}
          className="h-full w-full object-cover object-center"
          loading="lazy"
          onError={() => setErrored(true)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-[color:var(--color-primary)]/10 text-[color:var(--color-text)]">
          <span className="text-xs font-medium tracking-wide">{initials}</span>
        </span>
      )}
    </span>
  );
};

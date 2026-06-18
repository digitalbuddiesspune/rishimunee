"use client";
import { useState } from "react";
import { AddToCartButton } from "./AddToCartButton.jsx";
import { Button } from "../ui/Button.jsx";

export function ProductDetailView({ product }) {
  const images = Array.isArray(product.images) && product.images.length ? product.images : [
    "https://via.placeholder.com/800x800.png?text=Product"
  ];
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);

  const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <div className="aspect-square overflow-hidden rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-card)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={product.name} src={images[active]} className="h-full w-full object-cover" />
        </div>
        {images.length > 1 && (
          <div className="mt-3 grid grid-cols-4 gap-3">
            {images.slice(0, 4).map((src, idx) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt={`${product.name} ${idx + 1}`}
                onClick={() => setActive(idx)}
                className={`aspect-square cursor-pointer rounded-2xl border object-cover ${active === idx ? "border-[color:var(--color-primary)]" : "border-[color:var(--color-border)]"}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold text-[color:var(--color-text)]">{product.name}</h1>
          {product.category && (
            <p className="text-sm text-[color:var(--color-text-soft)]">{product.category}</p>
          )}
        </div>
        <p className="text-[color:var(--color-text-soft)]">{product.description}</p>
        <p className="text-2xl font-semibold text-[color:var(--color-text)]">{rupees(product.price)}</p>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl border border-[color:var(--color-border)]">
            <button className="px-3 py-2" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
            <span className="min-w-10 text-center">{qty}</span>
            <button className="px-3 py-2" onClick={() => setQty((q) => q + 1)}>+</button>
          </div>
          <AddToCartButton productId={product._id} quantity={qty} />
        </div>

        {product.attributes && (
          <div className="rounded-2xl border border-[color:var(--color-border)] p-4">
            <p className="mb-2 font-medium text-[color:var(--color-text)]">Details</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-[color:var(--color-text-soft)]">
              {Object.entries(product.attributes || {}).map(([k, v]) => (
                <div key={k}>
                  <span className="font-medium text-[color:var(--color-text)]">{k}:</span> {String(v)}
                </div>
              ))}
            </div>
          </div>
        )}

        {product.longDescription && (
          <div className="prose prose-invert max-w-none">
            <h3>Description</h3>
            <p>{product.longDescription}</p>
          </div>
        )}
      </div>
    </div>
  );
}


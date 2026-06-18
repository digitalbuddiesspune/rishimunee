import Link from "next/link";
import { Card } from "../ui/Card.jsx";
import { AddToCartButton } from "./AddToCartButton.jsx";
import Image from "next/image";

export const ProductCard = ({ product }) => {
  const price = `₹${Number(product.price || 0).toLocaleString("en-IN")}`;
  const img = product.images?.[0] || null;
  const productHref = `/store/${product.slug}`;

  return (
    <Card className="relative !m-0 flex h-full flex-col overflow-hidden !p-0 transition hover:border-[color:var(--color-primary)]/40">
      <Link
        href={productHref}
        className="absolute inset-0 z-10"
        aria-label={`View ${product.name}`}
      />

      <div className="relative m-0 aspect-square w-full overflow-hidden p-0">
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 50vw, 16vw"
            className="object-cover"
          />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center bg-[color:var(--color-card)] text-sm text-[color:var(--color-text-soft)]">
            Image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3 lg:p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-[color:var(--color-text)] lg:text-xs">
          {product.name}
        </h3>
        <p className="text-sm text-[color:var(--color-text-soft)] lg:text-xs">{price}</p>
        {product._id ? (
          <div className="relative z-20 mt-auto">
            <AddToCartButton productId={product._id} />
          </div>
        ) : null}
      </div>
    </Card>
  );
};

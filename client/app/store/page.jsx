import { StoreProductGrid } from "../../components/store/StoreProductGrid.jsx";

export default function StorePage() {
  return (
    <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-8 px-4 py-12">
      <div>
        <h1 className="text-3xl font-semibold text-[color:var(--color-text)]">Shop</h1>
        <p className="mt-2 max-w-2xl text-sm text-[color:var(--color-text-soft)]">
          Explore curated items for astrology enthusiasts — gemstones, books and puja accessories, delivered with care.
        </p>
      </div>
      <StoreProductGrid />
    </div>
  );
}

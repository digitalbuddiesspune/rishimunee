import { ProductDetailView } from "../../../components/store/ProductDetailView.jsx";

const sampleProduct = {
  name: "Yellow Sapphire",
  description: "Boosts Jupiter blessings; supplied with puja instructions.",
  gemstoneType: "Pukhraj",
  price: 8999,
  attributes: { weight: "5 carat", clarity: "VVS", origin: "Sri Lanka" }
};

async function fetchProduct(slug) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
  try {
    const res = await fetch(`${apiBase}/products/${slug}`, { cache: "no-store" });
    if (!res.ok) return sampleProduct;
    const json = await res.json();
    return json.data?.product || sampleProduct;
  } catch (error) {
    console.error("Failed to fetch product", error);
    return sampleProduct;
  }
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12">
      <ProductDetailView product={product} />
    </div>
  );
}

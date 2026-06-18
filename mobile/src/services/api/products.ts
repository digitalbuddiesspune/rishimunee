import { apiClient } from "./client";

export type Product = {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  price?: number;
  images?: string[];
  category?: string;
  attributes?: Record<string, any>;
  longDescription?: string;
};

export type ProductPagination = {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type ProductPageResult = {
  products: Product[];
  pagination: ProductPagination;
};

const PAGE_SIZE = 100;

export async function listProducts(): Promise<Product[]> {
  const { data } = await apiClient.get("/products");
  return data?.data?.products || data?.products || [];
}

export async function listProductsPage(page = 1, limit = PAGE_SIZE): Promise<ProductPageResult> {
  const { data } = await apiClient.get("/products", { params: { page, limit } });
  const products = data?.data?.products || data?.products || [];
  const pagination = data?.data?.pagination || {
    page,
    limit,
    total: products.length,
    hasMore: products.length === limit,
  };
  return { products, pagination };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data } = await apiClient.get(`/products/${encodeURIComponent(slug)}`);
  return data?.data?.product || data?.product || null;
}

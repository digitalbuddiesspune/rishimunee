import { apiClient } from "./client";

export type CartItem = { productId: any; quantity: number };
export type Cart = { items: CartItem[] };

export async function getCart(): Promise<Cart> {
  const { data } = await apiClient.get("/cart");
  return data?.data?.cart || data?.cart || { items: [] };
}

export async function addToCart(productId: string, quantity = 1) {
  const { data } = await apiClient.post("/cart/add", { productId, quantity });
  return data;
}

export async function updateCartItem(productId: string, quantity: number) {
  const { data } = await apiClient.patch("/cart/item", { productId, quantity });
  return data;
}

export async function removeCartItem(productId: string) {
  const { data } = await apiClient.post("/cart/remove", { productId });
  return data;
}


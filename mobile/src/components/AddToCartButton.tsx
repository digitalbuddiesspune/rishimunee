import React, { useState } from "react";
import { TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Text } from "@components/Themed";
import { useThemeColors } from "@theme/index";
import { useAuth } from "@hooks/useAuth";
import { addToCart } from "@services/api/cart";

type AddToCartButtonProps = {
  productId: string;
  quantity?: number;
};

export function AddToCartButton({ productId, quantity = 1 }: AddToCartButtonProps) {
  const c = useThemeColors();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const onAdd = async () => {
    if (!user) {
      router.push("/(auth)/login");
      return;
    }

    try {
      setLoading(true);
      await addToCart(productId, quantity);
      router.push("/cart");
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401) {
        router.push("/(auth)/login");
        return;
      }
      Alert.alert("Unable to add to cart", error?.response?.data?.message || error?.message || "");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={onAdd}
      disabled={loading}
      style={{
        backgroundColor: c.primary,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 999,
        alignItems: "center",
      }}
    >
      <Text style={{ color: c.primaryForeground, fontSize: 13, fontWeight: "600" }}>
        {loading ? "Adding..." : "Add to Cart"}
      </Text>
    </TouchableOpacity>
  );
}

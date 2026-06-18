import React from "react";
import { Image, TouchableOpacity } from "react-native";
import { View, Text, Card } from "@components/Themed";
import { useThemeColors } from "@theme/index";
import { type Product } from "@services/api/products";
import { AddToCartButton } from "@components/AddToCartButton";

type ProductCardProps = {
  product: Product;
  onPress: () => void;
};

export function ProductCard({ product, onPress }: ProductCardProps) {
  const c = useThemeColors();
  const image = product.images?.[0];
  const price = `₹${Number(product.price || 0).toLocaleString("en-IN")}`;

  return (
    <Card style={{ padding: 0, margin: 0, overflow: "hidden", flex: 1 }}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.92}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={{ width: "100%", aspectRatio: 1 }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: "100%",
              aspectRatio: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: c.card,
            }}
          >
            <Text soft>Image</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={{ padding: 12, gap: 8 }}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.92}>
          <Text numberOfLines={2} style={{ fontWeight: "700", fontSize: 14 }}>
            {product.name}
          </Text>
          <Text soft style={{ fontSize: 13, marginTop: 4 }}>
            {price}
          </Text>
        </TouchableOpacity>
        {product._id ? <AddToCartButton productId={product._id} /> : null}
      </View>
    </Card>
  );
}

import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import { View, Text, Card } from "@components/Themed";
import { useThemeColors } from "@theme/index";
import { getProductBySlug, type Product } from "@services/api/products";
import { addToCart } from "@services/api/cart";
import { ScrollView, Image, TouchableOpacity, Alert } from "react-native";

export default function ProductDetailsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const c = useThemeColors();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try { const p = await getProductBySlug(String(slug)); setProduct(p); }
      catch (e: any) { setError(e?.message || "Failed to load product"); }
      finally { setLoading(false); }
    })();
  }, [slug]);

  const onAdd = async () => {
    if (!product?._id) return;
    setSaving(true);
    try { await addToCart(product._id, qty); router.push("/cart"); }
    catch (e: any) { Alert.alert("Add to cart failed", e?.response?.data?.message || e?.message || ""); }
    finally { setSaving(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {loading && <Text soft>Loading...</Text>}
        {error && <Text style={{ color: c.danger }}>{error}</Text>}
        {product && (
          <>
            <Card style={{ padding: 0 }}>
              {product.images?.[0] ? (
                <Image source={{ uri: product.images[0] }} style={{ width: "100%", aspectRatio: 1, borderTopLeftRadius: 12, borderTopRightRadius: 12 }} />
              ) : (
                <View style={{ width: "100%", aspectRatio: 1, alignItems: "center", justifyContent: "center", backgroundColor: c.card }}>
                  <Text soft>Image</Text>
                </View>
              )}
              <View style={{ padding: 12 }}>
                <Text style={{ fontSize: 20, fontWeight: "800" }}>{product.name}</Text>
                {product.category && <Text soft>{product.category}</Text>}
                <Text style={{ fontSize: 18, fontWeight: "800", marginTop: 6 }}>₹{Number(product.price || 0).toLocaleString("en-IN")}</Text>
                <Text soft style={{ marginTop: 6 }}>{product.description}</Text>
                {product.attributes && (
                  <View style={{ marginTop: 10 }}>
                    {Object.entries(product.attributes).map(([k, v]) => (
                      <Text soft key={k}>{k}: {String(v)}</Text>
                    ))}
                  </View>
                )}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", borderColor: c.border, borderWidth: 1, borderRadius: 10 }}>
                    <TouchableOpacity onPress={() => setQty(q => Math.max(1, q - 1))} style={{ paddingVertical: 6, paddingHorizontal: 10 }}>
                      <Text>-</Text>
                    </TouchableOpacity>
                    <Text style={{ minWidth: 28, textAlign: "center" }}>{qty}</Text>
                    <TouchableOpacity onPress={() => setQty(q => q + 1)} style={{ paddingVertical: 6, paddingHorizontal: 10 }}>
                      <Text>+</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={onAdd} disabled={saving} style={{ backgroundColor: c.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 }}>
                    <Text style={{ color: c.primaryForeground, fontWeight: "700" }}>{saving ? "Adding..." : "Add to Cart"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}



import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Card } from "@components/Themed";
import { useThemeColors } from "@theme/index";
import { ScrollView, TouchableOpacity, Alert, Image } from "react-native";
import { useRouter } from "expo-router";
import { bi } from "@theme/strings";
import { getCart, updateCartItem, removeCartItem } from "@services/api/cart";

export default function CartScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getCart();
      setCart(res);
    } catch (e: any) {
      Alert.alert("Failed to load cart", e?.message || "");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const items = cart?.items || [];
  const total = useMemo(
    () => items.reduce((sum: number, i: any) => sum + (Number(i.productId?.price || 0) * Number(i.quantity || 1)), 0),
    [items]
  );
  const rupees = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 8 }}>
          {bi("Your Cart", "आपकी कार्ट")}
        </Text>
        <Card>
          {loading ? (
            <View style={{ padding: 12 }}>
              {[0, 1, 2].map((k) => (
                <View
                  key={k}
                  style={{
                    flexDirection: "row",
                    gap: 12,
                    alignItems: "center",
                    paddingVertical: 10,
                    borderBottomWidth: k < 2 ? 1 : 0,
                    borderBottomColor: c.border,
                  }}
                >
                  <View style={{ width: 56, height: 56, borderRadius: 8, backgroundColor: c.surface }} />
                  <View style={{ flex: 1, gap: 6 }}>
                    <View style={{ height: 12, borderRadius: 6, backgroundColor: c.surface, width: "70%" }} />
                    <View style={{ height: 12, borderRadius: 6, backgroundColor: c.surface, width: "40%" }} />
                  </View>
                </View>
              ))}
            </View>
          ) : items.length === 0 ? (
            <View style={{ padding: 16, alignItems: "center" }}>
              <Text soft>{bi("Cart is empty.", "कार्ट खाली है।")}</Text>
            </View>
          ) : (
            items.map((i: any) => {
              const img = i.productId?.images?.[0];
              const price = Number(i.productId?.price || 0);
              const qty = Number(i.quantity || 1);
              const line = price * qty;
              return (
                <View
                  key={i.productId?._id}
                  style={{
                    flexDirection: "row",
                    gap: 12,
                    alignItems: "center",
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: c.border,
                  }}
                >
                  {img ? (
                    <Image source={{ uri: img }} style={{ width: 64, height: 64, borderRadius: 10 }} />
                  ) : (
                    <View
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 10,
                        backgroundColor: c.surface,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text soft>IMG</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "700" }} numberOfLines={2}>
                      {i.productId?.name}
                    </Text>
                    <Text soft>
                      {rupees(price)} • {bi("Qty", "मात्रा")}: {qty}
                    </Text>
                    <Text soft>
                      {bi("Subtotal", "उप-योग")}: {rupees(line)}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                      <TouchableOpacity
                        onPress={async () => {
                          await updateCartItem(i.productId?._id, Math.max(1, qty - 1));
                          load();
                        }}
                        style={{ borderWidth: 1, borderColor: c.border, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 }}
                      >
                        <Text>-</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={async () => {
                          await updateCartItem(i.productId?._id, qty + 1);
                          load();
                        }}
                        style={{ borderWidth: 1, borderColor: c.border, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 }}
                      >
                        <Text>+</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={async () => {
                          await removeCartItem(i.productId?._id);
                          load();
                        }}
                        style={{ borderWidth: 1, borderColor: c.border, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 }}
                      >
                        <Text>{bi("Remove", "हटाएँ")}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </Card>
        <View
          style={{
            marginTop: 12,
            padding: 12,
            backgroundColor: c.card,
            borderRadius: 12,
            borderColor: c.border,
            borderWidth: 1,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
            <Text soft>{bi("Items", "आइटम")}</Text>
            <Text soft>{items.length}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 18, fontWeight: "800" }}>{bi("Total", "कुल")}</Text>
            <Text style={{ fontSize: 18, fontWeight: "800" }}>{rupees(total)}</Text>
          </View>
          <TouchableOpacity
            disabled={items.length === 0}
            onPress={() => router.push("/checkout")}
            style={{ backgroundColor: items.length ? c.primary : c.border, paddingVertical: 12, borderRadius: 12, marginTop: 10 }}
          >
            <Text style={{ color: items.length ? c.primaryForeground : c.text, textAlign: "center", fontWeight: "700" }}>
              {bi("Proceed to Checkout", "भुगतान के लिए आगे बढ़ें")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


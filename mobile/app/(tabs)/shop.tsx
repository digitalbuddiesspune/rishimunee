import React, { useCallback, useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "@components/Themed";
import { useThemeColors } from "@theme/index";
import { bi } from "@theme/strings";
import { listProductsPage, type Product } from "@services/api/products";
import { FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ProductCard } from "@components/ProductCard";

const PAGE_SIZE = 100;

const mergeProducts = (prev: Product[], batch: Product[], replace = false) => {
  const merged = replace ? batch : [...prev, ...batch];
  const seen = new Set<string>();
  return merged.filter((product) => {
    const key = product._id || product.slug;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export default function ShopScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    const nextPage = pageRef.current + 1;
    const isFirstPage = nextPage === 1;

    try {
      if (isFirstPage) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      const { products: batch, pagination } = await listProductsPage(nextPage, PAGE_SIZE);
      setProducts((prev) => mergeProducts(prev, batch, isFirstPage));
      setHasMore(pagination.hasMore);
      pageRef.current = nextPage;
    } catch (e: any) {
      setError(e?.message || "Failed to load products");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [hasMore]);

  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderHeader = () => (
    <View style={{ marginBottom: 12 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "800" }}>{bi("Shop", "दुकान")}</Text>
        <TouchableOpacity
          onPress={() => router.push("/cart")}
          accessibilityRole="button"
          accessibilityLabel="Open cart"
        >
          <Ionicons name="cart" size={22} color={c.text} />
        </TouchableOpacity>
      </View>
      <Text soft style={{ fontSize: 14, lineHeight: 20 }}>
        {bi(
          "Explore curated gemstones, books and puja accessories.",
          "क्यूरेटेड रत्न, पुस्तकें और पूजा सामग्री देखें।"
        )}
      </Text>
      {error ? <Text style={{ color: c.danger, marginTop: 8 }}>{error}</Text> : null}
    </View>
  );

  const renderSkeleton = () => (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between" }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={`sk-${i}`} style={{ width: "48%", height: 220, borderRadius: 16, backgroundColor: c.surface }} />
      ))}
    </View>
  );

  if (loading && !products.length) {
    return (
      <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1, backgroundColor: c.background }}>
        <View style={{ padding: 16 }}>
          {renderHeader()}
          {renderSkeleton()}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1, backgroundColor: c.background }}>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id || item.slug}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 12 }}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <ProductCard
              product={item}
              onPress={() => router.push({ pathname: "/store/[slug]", params: { slug: item.slug } })}
            />
          </View>
        )}
        onEndReached={() => {
          if (!loadingMore) loadMore();
        }}
        onEndReachedThreshold={0.35}
        ListFooterComponent={
          loadingMore ? (
            <Text soft style={{ textAlign: "center", marginTop: 8 }}>
              {bi("Loading more products...", "और उत्पाद लोड हो रहे हैं...")}
            </Text>
          ) : !hasMore && products.length > PAGE_SIZE ? (
            <Text soft style={{ textAlign: "center", marginTop: 8 }}>
              {bi("You've seen all products.", "आपने सभी उत्पाद देख लिए हैं।")}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <Text soft style={{ textAlign: "center", marginTop: 24 }}>
              {bi("No products are available right now.", "अभी कोई उत्पाद उपलब्ध नहीं है।")}
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

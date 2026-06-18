import React, { useEffect, useState } from "react";
import { View, Text, Card } from "@components/Themed";
import { useThemeColors } from "@theme/index";
import { Link, useRouter } from "expo-router";
import {
  TouchableOpacity,
  FlatList,
  ScrollView,
  RefreshControl,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { listServices, type Service } from "@services/api/services";
import { listAstrologers, type Astrologer } from "@services/api/astrologers";
import {
  startChatSession,
  fetchChatHistory,
  quoteChatAccess,
} from "@services/api/chat";
import ConfirmChatAccessModal from "@components/ConfirmChatAccessModal";
import { getWallet } from "@services/api/wallet";
import { SafeAreaView } from "react-native-safe-area-context";
import { GuruCard } from "@components/GuruCard";
import { ServiceTile } from "@components/ServiceTile";
import { Logo } from "@components/Logo";
import { bi } from "@theme/strings";
import { useAuth } from "@hooks/useAuth";

export default function HomeScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [gurus, setGurus] = useState<Astrologer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [lastChatId, setLastChatId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedAstro, setSelectedAstro] = useState<Astrologer | null>(null);

  const fetchData = async () => {
    setError(null);
    setLoading(true);
    try {
      const [svc, astro] = await Promise.all([
        listServices(),
        listAstrologers(),
      ]);
      setServices(svc);
      setGurus(astro.filter((a) => a));
      try {
        const w = await getWallet();
        setWallet(w?.data || w);
      } catch {}
      try {
        const h = await fetchChatHistory();
        const chats = (h as any)?.data?.chats || (h as any)?.chats || [];
        if (chats.length) setLastChatId(String(chats[0]._id));
      } catch {}
    } catch (e: any) {
      setError(e?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const onServicePress = (s: Service) => {
    const slug = s.slug.toLowerCase();
    if (s.isPaid) {
      return router.push({ pathname: "/services/[slug]", params: { slug } });
    }
    if (slug.includes("horoscope")) return router.push("/services/horoscope");
    if (slug.includes("kundli")) return router.push("/services/kundli");
    if (slug.includes("panchang")) return router.push("/services/panchang");
    if (slug.includes("matching")) return router.push("/services/matching");
    if (slug.includes("mangal")) return router.push("/services/mangal-dosha");
    if (slug.includes("kal") || slug.includes("sarp"))
      return router.push("/services/kal-sarp-dosh");
    if (slug.includes("baby")) return router.push("/services/baby-names");
    if (slug.includes("career")) return router.push("/services/career");
    if (slug.includes("life")) return router.push("/services/life-report");
    if (slug.includes("year")) return router.push("/services/year-analysis");
    if (slug.includes("lal")) return router.push("/services/lal-kitab");
    if (slug.includes("gochar")) return router.push("/services/gochar-phal");
    // Fallback to generic service details
    router.push({ pathname: "/services/[slug]", params: { slug } });
  };

  const startChat = async (guru: Astrologer) => {
    try {
      const quote = await quoteChatAccess(guru._id, 5);
      const hasAccess = quote?.data?.hasAccess ?? quote?.hasAccess;
      if (!hasAccess) {
        setSelectedAstro(guru);
        setConfirmOpen(true);
        return;
      }
      const res = await startChatSession({ astrologerId: guru._id });
      const chatId = (res as any)?.data?.chatId || (res as any)?.chatId;
      if (chatId) router.push(`/chat/${chatId}`);
    } catch {}
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1 }}>
      {/* Top bar */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
      >
        {/* Left: User avatar (initial) + Logo text */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            accessibilityRole="button"
            accessibilityLabel="Open Profile"
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: c.surface,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: c.border,
              }}
            >
              <Text
                style={{ fontSize: 14, fontWeight: "800", color: c.primary }}
              >
                {(user?.name?.[0] || "J").toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
          <Logo size="md" onPress={() => router.push("/")} />
        </View>

        {/* Right: Search + Notifications */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <TouchableOpacity
            onPress={() => router.push("/search")}
            accessibilityRole="button"
            accessibilityLabel="Search"
          >
            <Ionicons name="search-outline" size={22} color={c.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/notifications")}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={22} color={c.text} />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 24,
          paddingTop: 8,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ alignItems: "center", marginBottom: 12 }}>
          {/* <Text
            style={{
              fontSize: 36,
              fontWeight: "900",
              letterSpacing: 0.5,
              color: c.primary,
              marginBottom: 4,
              textAlign: "center",
            }}
          >
            RisheeMuni
          </Text> */}
          <Text
            style={{ fontSize: 18, fontWeight: "700", textAlign: "center" }}
          >
            {bi("Welcome to RisheeMuni", "RisheeMuni में स्वागत है")}
          </Text>
        </View>

        <Card style={{ marginBottom: 12 }}>
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                marginBottom: 4,
                textAlign: "center",
              }}
            >
              {bi("Your Daily Astro Companion", "आपका दैनिक एस्ट्रो साथी")}
            </Text>
            <Text soft style={{ textAlign: "center", lineHeight: 20 }}>
              {bi(
                "Explore services, chat with AI astrologers, and manage your wallet - all in one place.",
                "सेवाएँ देखें, एआई ज्योतिषियों से चैट करें और अपना वॉलेट प्रबंधित करें - सब कुछ एक ही जगह पर।"
              )}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              gap: 6,
              marginTop: 6,
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Link href="/(tabs)/services" asChild>
              <TouchableOpacity
                style={{
                  backgroundColor: c.primary,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 10,
                }}
              >
                <Text style={{ color: c.primaryForeground, fontWeight: "700" }}>
                  {bi("Browse Services", "सेवाएँ देखें")}
                </Text>
              </TouchableOpacity>
            </Link>
            <Link href="/(tabs)/astrologers" asChild>
              <TouchableOpacity
                style={{
                  borderColor: c.border,
                  borderWidth: 1,
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 10,
                  backgroundColor: c.card,
                }}
              >
                <Text style={{ color: c.text, fontWeight: "700" }}>
                  {bi("Astrologers", "ज्योतिषी")}
                </Text>
              </TouchableOpacity>
            </Link>
            {lastChatId && (
              <Link href={`/chat/${lastChatId}`} asChild>
                <TouchableOpacity
                  style={{
                    borderColor: c.border,
                    borderWidth: 0,
                    paddingVertical: 6,
                    paddingHorizontal: 8,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: c.primary, fontWeight: "700" }}>
                    {bi("Resume Chat", "चैट जारी रखें")}
                  </Text>
                </TouchableOpacity>
              </Link>
            )}
          </View>
        </Card>

        {wallet && (
          <View
            style={{
              backgroundColor: c.primary,
              padding: 16,
              borderRadius: 16,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: c.primaryForeground, opacity: 0.9 }}>
              {bi("Wallet Balance", "वॉलेट बैलेंस")}
            </Text>
            <Text
              style={{
                color: c.primaryForeground,
                fontSize: 24,
                fontWeight: "900",
              }}
            >
              {wallet.balance} {wallet.currency || "INR"}
            </Text>
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: 10,
            paddingVertical: 6,
            marginBottom: 6,
          }}
        >
          <Link href="/services/horoscope" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: c.card,
                borderColor: c.border,
                borderWidth: 1,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 20,
              }}
            >
              <Text>{bi("Daily Horoscope", "दैनिक राशिफल")}</Text>
            </TouchableOpacity>
          </Link>
          <Link href={{ pathname: "/services/[slug]", params: { slug: "kundli" } }} asChild>
            <TouchableOpacity
              style={{
                backgroundColor: c.card,
                borderColor: c.border,
                borderWidth: 1,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 20,
              }}
            >
              <Text>{bi("Kundli", "कुंडली")}</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/services/panchang" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: c.card,
                borderColor: c.border,
                borderWidth: 1,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 20,
              }}
            >
              <Text>{bi("Panchang", "पंचांग")}</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/(tabs)/wallet" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: c.card,
                borderColor: c.border,
                borderWidth: 1,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 20,
              }}
            >
              <Text>{bi("Wallet", "वॉलेट")}</Text>
            </TouchableOpacity>
          </Link>
        </ScrollView>

        {error ? (
          <View
            style={{
              backgroundColor: c.card,
              borderColor: c.danger,
              borderWidth: 1,
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
            }}
          >
            <Text style={{ color: c.danger, fontWeight: "700" }}>
              {bi("Could not load content", "सामग्री लोड नहीं हो सकी")}
            </Text>
            <Text soft>{error}</Text>
            <TouchableOpacity
              onPress={fetchData}
              style={{
                backgroundColor: c.primary,
                padding: 10,
                borderRadius: 10,
                marginTop: 8,
              }}
            >
              <Text
                style={{
                  color: c.primaryForeground,
                  textAlign: "center",
                  fontWeight: "700",
                }}
              >
                {bi("Retry", "पुनः प्रयास करें")}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <Text style={{ fontSize: 18, fontWeight: "800", marginBottom: 8 }}>
          {bi("Featured AI Gurus", "विशेष एआई गुरु")}
        </Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={gurus.filter((g) => g.isFeatured)}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <GuruCard
              name={item.name}
              description={item.description}
              specialty={item.specialty}
              avatar={(item as any).avatar}
              avatarUrl={(item as any).avatarUrl}
              onPress={() => startChat(item)}
            />
          )}
          ListEmptyComponent={
            loading ? (
              <Text soft>
                {bi("Loading AI Gurus...", "एआई गुरु लोड हो रहे हैं...")}
              </Text>
            ) : (
              <Text soft>
                {bi(
                  "No featured gurus available.",
                  "कोई विशेष गुरु उपलब्ध नहीं हैं।"
                )}
              </Text>
            )
          }
          style={{ marginBottom: 16 }}
        />

        <Text style={{ fontSize: 18, fontWeight: "800", marginBottom: 8 }}>
          {bi("Top Services", "शीर्ष सेवाएँ")}
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            paddingBottom: 8,
            justifyContent: "center",
          }}
        >
          {services.slice(0, 8).map((s) => (
            <ServiceTile
              key={s._id}
              title={s.name}
              slug={s.slug}
              onPress={() => onServicePress(s)}
            />
          ))}
          {!services.length &&
            (loading ? (
              <Text soft>
                {bi("Loading services...", "सेवाएँ लोड हो रही हैं...")}
              </Text>
            ) : (
              <Text soft>
                {bi("No services found.", "कोई सेवाएँ नहीं मिलीं।")}
              </Text>
            ))}
        </View>

        <View style={{ marginTop: 8, gap: 8 }}>
          <Link href="/(tabs)/astrologers" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: c.secondary,
                padding: 14,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  color: c.secondaryForeground,
                  textAlign: "center",
                  fontWeight: "700",
                }}
              >
                {bi("Browse Astrologers", "ज्योतिषी देखें")}
              </Text>
            </TouchableOpacity>
          </Link>
          <Link href="/(tabs)/wallet" asChild>
            <TouchableOpacity
              style={{
                backgroundColor: c.accent,
                padding: 14,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  color: c.accentForeground,
                  textAlign: "center",
                  fontWeight: "700",
                }}
              >
                {bi("Go to Wallet", "वॉलेट पर जाएँ")}
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
      <ConfirmChatAccessModal
        visible={!!confirmOpen}
        astrologerId={selectedAstro?._id || ""}
        onClose={() => {
          setConfirmOpen(false);
          setSelectedAstro(null);
        }}
        onConfirmed={async () => {
          setConfirmOpen(false);
          const astro = selectedAstro;
          setSelectedAstro(null);
          if (!astro) return;
          try {
            const res = await startChatSession({ astrologerId: astro._id });
            const chatId = (res as any)?.data?.chatId || (res as any)?.chatId;
            if (chatId) router.push(`/chat/${chatId}`);
          } catch {}
        }}
        onInsufficient={() => {
          setConfirmOpen(false);
          setSelectedAstro(null);
          router.push("/(tabs)/wallet");
        }}
      />
    </SafeAreaView>
  );
}

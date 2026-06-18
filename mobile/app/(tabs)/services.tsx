import React, { useEffect, useState } from "react";
import { View, Text, Card } from "@components/Themed";
import { TouchableOpacity, ScrollView } from "react-native";
import { useThemeColors } from "@theme/index";
import { useRouter, Link } from "expo-router";
import { startChatSession } from "@services/api/chat";
import { SafeAreaView } from "react-native-safe-area-context";
import { listServices, type Service } from "@services/api/services";
import { ServiceTile } from "@components/ServiceTile";

export default function ServicesScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startAiChat = async () => {
    try {
      const res = await startChatSession({ astrologerSlug: "ai-arya" });
      const chatId = (res as any)?.data?.chatId || (res as any)?.chatId;
      if (chatId) router.push(`/chat/${chatId}`);
    } catch (e) {
      // noop
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const data = await listServices();
        setServices(data);
      } catch (e: any) {
        setError(e?.message || "Failed to load services");
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      >
        {/* Hero card */}
        <Card style={{ marginBottom: 12 }}>
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "800",
                marginBottom: 4,
                textAlign: "center",
              }}
            >
              Find The Right Guidance
            </Text>
            <Text soft style={{ textAlign: "center" }}>
              Pick from quick tools like Horoscope and Panchang, or deeper
              insights like Kundli and matching.
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginTop: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <TouchableOpacity
              onPress={startAiChat}
              style={{
                backgroundColor: c.primary,
                borderRadius: 12,
                paddingVertical: 10,
                paddingHorizontal: 14,
              }}
            >
              <Text style={{ color: c.primaryForeground, fontWeight: "700" }}>
                Start AI Chat
              </Text>
            </TouchableOpacity>
            <Link href="/(tabs)/astrologers" asChild>
              <TouchableOpacity
                style={{
                  backgroundColor: c.secondary,
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                }}
              >
                <Text
                  style={{ color: c.secondaryForeground, fontWeight: "700" }}
                >
                  Browse Astrologers
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </Card>

        <Text style={{ fontSize: 18, fontWeight: "800", marginBottom: 8 }}>
          All Services
        </Text>
        {error && (
          <Text style={{ color: c.danger, marginBottom: 8 }}>{error}</Text>
        )}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "center",
          }}
        >
          {services.map((s) => (
            <ServiceTile
              key={s._id}
              title={s.name}
              slug={s.slug}
              onPress={() => {
                if (s.isPaid) {
                  return router.push({
                    pathname: "/services/[slug]",
                    params: { slug: s.slug },
                  });
                }
                if (s.slug.includes("horoscope"))
                  return router.push("/services/horoscope");
                if (s.slug.includes("kundli"))
                  return router.push("/services/kundli");
                if (s.slug.includes("panchang"))
                  return router.push("/services/panchang");
                if (s.slug.includes("matching"))
                  return router.push("/services/matching");
                if (s.slug.includes("mangal"))
                  return router.push("/services/mangal-dosha");
                if (s.slug.includes("kal") || s.slug.includes("sarp"))
                  return router.push("/services/kal-sarp-dosh");
                if (s.slug.includes("baby"))
                  return router.push("/services/baby-names");
                if (s.slug.includes("career"))
                  return router.push("/services/career");
                if (s.slug.includes("life"))
                  return router.push("/services/life-report");
                if (s.slug.includes("year"))
                  return router.push("/services/year-analysis");
                if (s.slug.includes("lal"))
                  return router.push("/services/lal-kitab");
                if (s.slug.includes("gochar"))
                  return router.push("/services/gochar-phal");
                router.push({
                  pathname: "/services/[slug]",
                  params: { slug: s.slug },
                });
              }}
            />
          ))}
          {!services.length &&
            (loading ? (
              <Text soft>Loading services�</Text>
            ) : (
              <Text soft>No services found.</Text>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}













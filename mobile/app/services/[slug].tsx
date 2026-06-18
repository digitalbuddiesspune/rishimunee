import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Card } from "@components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "@theme/index";
import { getServiceBySlug, type Service } from "@services/api/services";
import { initiatePayment } from "@services/api/payments";
import { TouchableOpacity, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { Header } from "@components/Header";

export default function ServiceDetailsScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const c = useThemeColors();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const s = await getServiceBySlug(String(slug));
        setService(s);
        setActivated(!s?.isPaid);
      } catch (e: any) {
        setError(e?.message || "Failed to load service");
      } finally { setLoading(false); }
    })();
  }, [slug]);

  const onPay = async () => {
    if (!service) return;
    setPaying(true);
    try {
      const response = await initiatePayment({ serviceType: service.serviceType, gateway: "payu", platform: "mobile" });
      const data = response?.data || response;
      const checkoutUrl = data?.payment?.checkoutUrl;
      if (!checkoutUrl) throw new Error("PayU checkout link is missing");
      const result = await WebBrowser.openAuthSessionAsync(checkoutUrl, "astro://payments/status");
      const returnedOrderId = result.type === "success" && result.url
        ? new URL(result.url).searchParams.get("orderId")
        : data.orderId;
      router.push({ pathname: "/payments/status", params: { orderId: returnedOrderId || data.orderId } });
    } catch (e: any) {
      Alert.alert("Payment failed", e?.response?.data?.message || e?.message || "");
    } finally { setPaying(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Services" />
      <View style={{ padding: 16 }}>
        {loading && <Text soft>Loading…</Text>}
        {error && <Text style={{ color: c.danger }}>{error}</Text>}
        {service && (
          <Card>
            <Text style={{ fontSize: 20, fontWeight: "800" }}>{service.name}</Text>
            <Text soft style={{ marginTop: 6 }}>{service.description}</Text>
            {service.features?.length ? (
              <View style={{ marginTop: 10 }}>
                {service.features.map((f) => (
                  <Text soft key={f}>• {f}</Text>
                ))}
              </View>
            ) : null}
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontWeight: "700" }}>{service.isPaid ? `Starts Rs ${service.basePrice || 0}` : "Complimentary"}</Text>
            </View>
            {service.isPaid && !activated && (
              <TouchableOpacity onPress={onPay} disabled={paying} style={{ backgroundColor: c.primary, padding: 12, borderRadius: 12, marginTop: 12 }}>
                <Text style={{ color: c.primaryForeground, textAlign: "center", fontWeight: "700" }}>{paying ? "Opening checkout..." : "Continue to PayU"}</Text>
              </TouchableOpacity>
            )}
            {activated && (
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontWeight: "700", marginBottom: 6 }}>Next Steps</Text>
                {service.slug?.includes("kundli") && (
                  <TouchableOpacity onPress={() => router.push("/services/kundli")} style={{ borderColor: c.border, borderWidth: 1, padding: 12, borderRadius: 12 }}>
                    <Text style={{ textAlign: "center" }}>Open Kundli Form</Text>
                  </TouchableOpacity>
                )}
                {service.slug?.includes("horoscope") && (
                  <TouchableOpacity onPress={() => router.push("/services/horoscope")} style={{ borderColor: c.border, borderWidth: 1, padding: 12, borderRadius: 12, marginTop: 8 }}>
                    <Text style={{ textAlign: "center" }}>Open Horoscope</Text>
                  </TouchableOpacity>
                )}
                {service.slug?.includes("panchang") && (
                  <TouchableOpacity onPress={() => router.push("/services/panchang")} style={{ borderColor: c.border, borderWidth: 1, padding: 12, borderRadius: 12, marginTop: 8 }}>
                    <Text style={{ textAlign: "center" }}>Open Panchang</Text>
                  </TouchableOpacity>
                )}
                {!service.slug?.match(/kundli|horoscope|panchang/) && (
                  <Text soft>Service activated. The form or report will appear in your dashboard once implemented.</Text>
                )}
              </View>
            )}
          </Card>
        )}
      </View>
    </SafeAreaView>
  );
}

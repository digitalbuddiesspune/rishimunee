import React, { useCallback, useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Card } from "@components/Themed";
import { useThemeColors } from "@theme/index";
import { getPaymentStatus } from "@services/api/payments";

export default function PaymentStatusScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!orderId) return;
    try {
      const result = await getPaymentStatus(orderId);
      setOrder(result);
      setError("");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Unable to verify payment");
    }
  }, [orderId]);

  useEffect(() => {
    load();
    if (order?.status !== "pending") return;
    const timer = setInterval(load, 2500);
    return () => clearInterval(timer);
  }, [load, order?.status]);

  const title = {
    paid: "Payment successful",
    pending: "Payment is being verified",
    failed: "Payment failed",
    cancelled: "Payment cancelled",
    refunded: "Payment refunded"
  }[order?.status as string] || "Checking payment";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
        <Card>
          <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 12 }}>{title}</Text>
          {error ? <Text style={{ color: c.danger }}>{error}</Text> : null}
          {order ? <>
            <Text soft>Order: {order.orderId}</Text>
            {order.invoiceNumber ? <Text soft>Invoice: {order.invoiceNumber}</Text> : null}
            <Text style={{ fontSize: 18, fontWeight: "700", marginTop: 8 }}>
              Total: ₹{Number(order.amount || 0).toLocaleString("en-IN")}
            </Text>
            {order.paymentReference ? <Text soft>Payment reference: {order.paymentReference}</Text> : null}
            {order.status === "paid" ? <Text soft style={{ marginTop: 8 }}>A confirmation has been sent to your email.</Text> : null}
          </> : null}
          <TouchableOpacity onPress={() => router.replace("/(tabs)")}
            style={{ backgroundColor: c.primary, padding: 14, borderRadius: 12, marginTop: 16 }}>
            <Text style={{ color: c.primaryForeground, textAlign: "center", fontWeight: "700" }}>Back to home</Text>
          </TouchableOpacity>
        </Card>
      </View>
    </SafeAreaView>
  );
}

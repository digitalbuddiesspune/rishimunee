import React, { useState } from "react";
import { ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Text, Card } from "@components/Themed";
import { useThemeColors } from "@theme/index";
import { initiateProductCheckout } from "@services/api/checkout";

const emptyAddress = {
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "IN"
};

export default function CheckoutScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(emptyAddress);

  const checkout = async () => {
    const required = ["name", "phone", "line1", "city", "state", "postalCode"] as const;
    if (required.some((key) => !address[key].trim())) {
      Alert.alert("Address required", "Please complete all required delivery fields.");
      return;
    }
    try {
      setLoading(true);
      const response = await initiateProductCheckout({ address, gateway: "payu", platform: "mobile" });
      const data = response?.data || response;
      const checkoutUrl = data?.payment?.checkoutUrl;
      if (!checkoutUrl) throw new Error("PayU checkout link is missing");
      const result = await WebBrowser.openAuthSessionAsync(checkoutUrl, "astro://payments/status");
      if (result.type === "success" && result.url) {
        const orderId = new URL(result.url).searchParams.get("orderId") || data.orderId;
        router.replace({ pathname: "/payments/status", params: { orderId } });
      } else {
        router.push({ pathname: "/payments/status", params: { orderId: data.orderId } });
      }
    } catch (error: any) {
      Alert.alert("Checkout failed", error?.response?.data?.message || error?.message || "");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    color: c.text
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 12 }}>Checkout</Text>
        <Card>
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>Delivery address</Text>
          {Object.entries(address).map(([key, value]) => (
            <TextInput
              key={key}
              placeholder={{
                name: "Full name",
                phone: "Phone",
                line1: "Address line 1",
                line2: "Address line 2 (optional)",
                city: "City",
                state: "State",
                postalCode: "Postal code",
                country: "Country"
              }[key]}
              keyboardType={key === "phone" ? "phone-pad" : "default"}
              placeholderTextColor={c.textSoft}
              value={value}
              onChangeText={(next) => setAddress((current) => ({ ...current, [key]: next }))}
              style={inputStyle}
            />
          ))}
          <Text soft>You will continue to PayU Hosted Checkout.</Text>
          <TouchableOpacity onPress={checkout} disabled={loading}
            style={{ backgroundColor: c.primary, padding: 14, borderRadius: 12, marginTop: 12 }}>
            <Text style={{ color: c.primaryForeground, textAlign: "center", fontWeight: "700" }}>
              {loading ? "Opening checkout..." : "Continue to PayU"}
            </Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

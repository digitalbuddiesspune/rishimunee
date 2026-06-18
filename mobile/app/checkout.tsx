import React, { useEffect, useState } from "react";
import { ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Text, Card } from "@components/Themed";
import { useThemeColors } from "@theme/index";
import { initiateProductCheckout } from "@services/api/checkout";
import { listAddresses } from "@services/api/addresses";
import { getProfile } from "@services/api/auth";

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

const toFormAddress = (addr: any = {}) => ({
  name: addr.name || "",
  phone: addr.phone || "",
  line1: addr.line1 || "",
  line2: addr.line2 || "",
  city: addr.city || "",
  state: addr.state || "",
  postalCode: addr.postalCode || "",
  country: addr.country || "IN"
});

export default function CheckoutScreen() {
  const c = useThemeColors();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [address, setAddress] = useState(emptyAddress);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [addresses, profileRes] = await Promise.all([
          listAddresses().catch(() => []),
          getProfile().catch(() => null)
        ]);
        if (!active) return;
        setSavedAddresses(addresses);
        if (addresses.length) {
          const defaultAddress = addresses.find((item) => item.isDefault) || addresses[0];
          setSelectedAddressId(defaultAddress._id);
          setAddress(toFormAddress(defaultAddress));
          setUseNewAddress(false);
        } else {
          const user = profileRes?.data?.user;
          setSelectedAddressId("new");
          setAddress({
            ...emptyAddress,
            name: user?.name || "",
            phone: user?.phone || ""
          });
          setUseNewAddress(true);
        }
      } finally {
        if (active) setBootstrapping(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const checkout = async () => {
    if (useNewAddress || selectedAddressId === "new") {
      const required = ["name", "phone", "line1", "city", "state", "postalCode"] as const;
      if (required.some((key) => !address[key].trim())) {
        Alert.alert("Address required", "Please complete all required delivery fields.");
        return;
      }
    }

    try {
      setLoading(true);
      const payload =
        !useNewAddress && selectedAddressId !== "new"
          ? { addressId: selectedAddressId, gateway: "cod", platform: "mobile" }
          : { address, gateway: "cod", platform: "mobile" };
      const response = await initiateProductCheckout(payload);
      const data = response?.data || response;
      const orderId = data?.order?._id || data?.orderId;
      if (!orderId) throw new Error("Order reference is missing");
      Alert.alert(
        "Order placed",
        "Your cash on delivery order has been placed successfully.",
        [{ text: "OK", onPress: () => router.replace("/(tabs)") }]
      );
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

  if (bootstrapping) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background, justifyContent: "center", alignItems: "center" }}>
        <Text soft>Loading checkout...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 12 }}>Checkout</Text>
        <Card>
          <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>Delivery address</Text>

          {savedAddresses.map((saved) => {
            const selected = !useNewAddress && selectedAddressId === saved._id;
            return (
              <TouchableOpacity
                key={saved._id}
                onPress={() => {
                  setSelectedAddressId(saved._id);
                  setAddress(toFormAddress(saved));
                  setUseNewAddress(false);
                }}
                style={{
                  borderWidth: 1,
                  borderColor: selected ? c.primary : c.border,
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 10,
                  backgroundColor: selected ? `${c.primary}12` : "transparent"
                }}
              >
                <Text style={{ fontWeight: "700" }}>{saved.name}{saved.isDefault ? " • Default" : ""}</Text>
                <Text soft>{saved.phone}</Text>
                <Text soft>
                  {saved.line1}
                  {saved.line2 ? `, ${saved.line2}` : ""}, {saved.city}, {saved.state} {saved.postalCode}
                </Text>
              </TouchableOpacity>
            );
          })}

          {savedAddresses.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSelectedAddressId("new");
                setUseNewAddress(true);
              }}
              style={{ marginBottom: 12 }}
            >
              <Text style={{ color: c.primary, fontWeight: "600" }}>Use a different address</Text>
            </TouchableOpacity>
          )}

          {(useNewAddress || savedAddresses.length === 0) &&
            Object.entries(address).map(([key, value]) => (
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

          <Text soft>Cash on Delivery (COD) — pay when your order is delivered.</Text>
          <TouchableOpacity onPress={checkout} disabled={loading}
            style={{ backgroundColor: c.primary, padding: 14, borderRadius: 12, marginTop: 12 }}>
            <Text style={{ color: c.primaryForeground, textAlign: "center", fontWeight: "700" }}>
              {loading ? "Placing order..." : "Place Order (COD)"}
            </Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

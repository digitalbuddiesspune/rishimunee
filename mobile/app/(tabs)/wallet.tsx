import React, { useEffect, useState } from "react";
import { View, Text, Card } from "@components/Themed";
import { TouchableOpacity, TextInput, Alert, ScrollView } from "react-native";
import { useThemeColors } from "@theme/index";
import { getWallet, topUpWallet } from "@services/api/wallet";
import { SafeAreaView } from "react-native-safe-area-context";
import { bi } from "@theme/strings";
import * as WebBrowser from "expo-web-browser";

export default function WalletScreen() {
  const c = useThemeColors();
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  const [amount, setAmount] = useState<string>("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await getWallet();
      setWallet(res?.data || res);
    } catch (e: any) {
      Alert.alert("Failed to load wallet", e?.message || "");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onTopUp = async () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) return;
    try {
      const response = await topUpWallet(value);
      const data = response?.data || response;
      const checkoutUrl = data?.payment?.checkoutUrl;
      if (!checkoutUrl) throw new Error("PayU checkout link is missing");
      const result = await WebBrowser.openAuthSessionAsync(checkoutUrl, "astro://wallet");
      if (result.type === "success") {
        Alert.alert("Payment received", "Your wallet balance is being updated.");
      }
      setAmount("");
      await load();
    } catch (e: any) {
      Alert.alert("Top-up failed", e?.message || "");
    }
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* Balance card */}
        <Card>
          <View style={{ backgroundColor: c.primary, padding: 16, borderRadius: 12 }}>
            <Text style={{ color: c.primaryForeground, fontSize: 14, opacity: 0.9 }}>Available Balance</Text>
            <Text style={{ color: c.primaryForeground, fontSize: 28, fontWeight: "900" }}>{wallet?.balance ?? "—"} {wallet?.currency || "INR"}</Text>
          </View>
        </Card>

        {/* Top-up */}
        <Card style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "600", marginBottom: 8 }}>{bi("Add money", "पैसे जोड़ें")}</Text>
          <TextInput
            placeholder={bi("Amount", "राशि")}
            placeholderTextColor={c.textSoft}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            style={{ borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 12, color: c.text, marginBottom: 8 }}
          />
          <TouchableOpacity onPress={onTopUp} style={{ backgroundColor: c.primary, padding: 12, borderRadius: 12 }}>
            <Text style={{ color: c.primaryForeground, textAlign: "center", fontWeight: "600" }}>{bi("Continue to PayU", "PayU से भुगतान करें")}</Text>
          </TouchableOpacity>
        </Card>

        {/* Transactions */}
        <Card style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: "600", marginBottom: 8 }}>{bi("Transactions", "लेन-देन")}</Text>
          {loading && <Text soft>{bi("Loading...", "लोड हो रहा है...")}</Text>}
          {!loading && (wallet?.transactions?.length ? (
            wallet.transactions.map((t: any) => (
              <View key={t._id} style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.border }}>
                <Text>{t.type} • {t.amount}</Text>
                <Text soft>{new Date(t.createdAt).toLocaleString()}</Text>
              </View>
            ))
          ) : (
            <Text soft>{bi("No transactions yet.", "अभी तक कोई लेन-देन नहीं।")}</Text>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

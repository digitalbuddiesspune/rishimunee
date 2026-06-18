import React, { useState, useEffect } from "react";
import { View, Text, Card } from "@components/Themed";
import { Header } from "@components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { useThemeColors } from "@theme/index";
import { generateKundli, type KundliResult } from "@services/api/kundli";
import { getServiceBySlug } from "@services/api/services";
import { initiatePayment } from "@services/api/payments";
import FullScreenLoader from "@components/FullScreenLoader";

export default function KundliScreen() {
  const c = useThemeColors();
  const [form, setForm] = useState({ name: "", date: "", time: "", place: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<KundliResult | null>(null);
  const [servicePrice, setServicePrice] = useState<number | null>(null);
  const [paying, setPaying] = useState(false);
  const [activated, setActivated] = useState(false);
  const [isPaid, setIsPaid] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const svc = await getServiceBySlug("kundli");
        const paid = !!svc?.isPaid;
        setIsPaid(paid);
        if (paid) {
          setServicePrice(svc.basePrice || 0);
          setActivated(false);
        } else {
          setActivated(true);
        }
      } catch {}
    })();
  }, []);

  const submit = async () => {
    if (!form.name || !form.date || !form.time || !form.place) {
      Alert.alert("Missing details", "Please fill all fields");
      return;
    }
    // Enforce activation for paid service
    if (isPaid && !activated) {
      Alert.alert(
        "Activation required",
        "Please activate this service using your wallet before proceeding."
      );
      return;
    }
    setLoading(true);
    try {
      const res = await generateKundli(form);
      setResult(res);
    } catch (e: any) {
      Alert.alert("Failed", e?.message || "Could not generate Kundli");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Kundli (कुंडली)" />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <Card>
            {isPaid && servicePrice !== null && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: "700", marginBottom: 6 }}>
                  Activation (सक्रियण)
                </Text>
                <Text soft>Price (कीमत): ₹{servicePrice}</Text>
                <TouchableOpacity
                  onPress={async () => {
                    setPaying(true);
                    try {
                      await initiatePayment({
                        serviceType: "kundli",
                        items: [],
                        gateway: "wallet",
                      });
                      Alert.alert(
                        "Activated",
                        "Kundli service activated via wallet"
                      );
                      setActivated(true);
                    } catch (e: any) {
                      Alert.alert(
                        "Payment failed",
                        e?.response?.data?.message || e?.message || ""
                      );
                    } finally {
                      setPaying(false);
                    }
                  }}
                  disabled={paying}
                  style={{
                    backgroundColor: c.primary,
                    padding: 12,
                    borderRadius: 12,
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
                    {paying
                      ? "Processing... (प्रोसेस हो रहा है)"
                      : "Activate with Wallet (वॉलेट से सक्रिय करें)"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <Text style={{ fontWeight: "700", marginBottom: 8 }}>
              Enter Birth Details (जन्म विवरण भरें)
            </Text>
            <TextInput
              placeholder="Name (नाम)"
              placeholderTextColor={c.textSoft}
              value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })}
              style={{
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: 12,
                padding: 12,
                marginBottom: 8,
                color: c.text,
              }}
            />
            <TextInput
              placeholder="Date (YYYY-MM-DD) • तारीख"
              placeholderTextColor={c.textSoft}
              value={form.date}
              onChangeText={(v) => setForm({ ...form, date: v })}
              style={{
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: 12,
                padding: 12,
                marginBottom: 8,
                color: c.text,
              }}
            />
            <TextInput
              placeholder="Time (HH:mm) • समय"
              placeholderTextColor={c.textSoft}
              value={form.time}
              onChangeText={(v) => setForm({ ...form, time: v })}
              style={{
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: 12,
                padding: 12,
                marginBottom: 8,
                color: c.text,
              }}
            />
            <TextInput
              placeholder="Place (स्थान)"
              placeholderTextColor={c.textSoft}
              value={form.place}
              onChangeText={(v) => setForm({ ...form, place: v })}
              style={{
                borderWidth: 1,
                borderColor: c.border,
                borderRadius: 12,
                padding: 12,
                marginBottom: 8,
                color: c.text,
              }}
            />
            <TouchableOpacity
              onPress={submit}
              disabled={loading || (isPaid && !activated)}
              style={{
                backgroundColor: c.primary,
                padding: 12,
                borderRadius: 12,
                opacity: isPaid && !activated ? 0.6 : 1,
              }}
            >
              <Text
                style={{
                  color: c.primaryForeground,
                  textAlign: "center",
                  fontWeight: "700",
                }}
              >
                {isPaid && !activated
                  ? "Activate to Continue (पहले सक्रिय करें)"
                  : loading
                  ? "Generating... (बना रहे हैं)"
                  : "Generate Kundli (कुंडली बनाएं)"}
              </Text>
            </TouchableOpacity>
          </Card>

          {result && (
            <Card style={{ marginTop: 12 }}>
              <Text
                style={{ fontSize: 16, fontWeight: "800", marginBottom: 6 }}
              >
                Insights (अंतर्दृष्टि)
              </Text>
              <Markdown style={{ body: { color: c.text } }}>
                {result.narrative || ""}
              </Markdown>
            </Card>
          )}
          {(loading || paying) && (
            <FullScreenLoader
              label={
                loading
                  ? "Generating... (बना रहे हैं)"
                  : "Processing... (प्रोसेस हो रहा है)"
              }
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
// const payWithWallet = async () => {
//   setPaying(true);
//   try {
//     await initiatePayment({ serviceType: "kundli", items: [], gateway: "wallet" });
//     Alert.alert("Activated", "Kundli service activated via wallet");
//   } catch (e: any) {
//     Alert.alert("Payment failed", e?.response?.data?.message || e?.message || "");
//   } finally { setPaying(false); }
// };
